import {
  PDFDocument,
  StandardFonts,
  BlendMode,
  LineCapStyle,
  concatTransformationMatrix,
  popGraphicsState,
  pushGraphicsState,
  rgb,
} from "pdf-lib";
import { PdfEngine } from "./pdfEngine.js";
import { sanitizePdfBaseName, createNameDeduper } from "./outputName.js";
import { visibleSize, visibleToUserMatrix } from "./pdfGeometry.js";
import { missingGlyphs, resolveTextFont } from "./unicodeFont.js";

// PDFin workspace — visual annotation / edit layer.
//
// Objects are stored in *visible page space*: normalized 0..1 coordinates with
// the origin at the top-left of the page as the user sees it in the preview
// (i.e. after the page's /Rotate entry is applied). Export maps that space back
// into PDF user space with a single CTM per page, so a rotated page stamps in
// exactly the place the preview showed.

export const ANNOTATION_TYPES = ["text", "image", "rect", "ellipse", "line", "highlight", "draw"];

const FONT_TABLE = {
  sans: {
    regular: StandardFonts.Helvetica,
    bold: StandardFonts.HelveticaBold,
    italic: StandardFonts.HelveticaOblique,
    boldItalic: StandardFonts.HelveticaBoldOblique,
  },
  serif: {
    regular: StandardFonts.TimesRoman,
    bold: StandardFonts.TimesRomanBold,
    italic: StandardFonts.TimesRomanItalic,
    boldItalic: StandardFonts.TimesRomanBoldItalic,
  },
  mono: {
    regular: StandardFonts.Courier,
    bold: StandardFonts.CourierBold,
    italic: StandardFonts.CourierOblique,
    boldItalic: StandardFonts.CourierBoldOblique,
  },
};

// The 14 standard PDF fonts are WinAnsi-encoded. pdf-lib throws on any code
// point outside that set, so text is normalized before it reaches the page:
// typographic look-alikes are folded to ASCII and anything left over is
// reported to the caller instead of failing the whole export.
const WINANSI_FOLD = {
  "‘": "'", "’": "'", "‚": "'", "‛": "'",
  "“": '"', "”": '"', "„": '"', "‟": '"',
  "–": "-", "—": "-", "−": "-", "‐": "-", "‑": "-",
  "…": "...", " ": " ", " ": " ", " ": " ", "​": "",
  "•": "-", "·": "-", "‹": "<", "›": ">",
  "€": "EUR", "™": "(TM)",
  "\t": "    ",
};

function encodableInWinAnsi(code) {
  // Printable ASCII plus the Latin-1 supplement block that WinAnsi shares with
  // ISO-8859-1. The 0x80–0x9F range is deliberately excluded: those slots hold
  // WinAnsi-specific glyphs that we already folded above.
  return (code >= 32 && code <= 126) || (code >= 160 && code <= 255);
}

export function sanitizeWinAnsiText(raw) {
  const source = String(raw ?? "");
  let text = "";
  let dropped = 0;
  for (const char of source) {
    if (char === "\n" || char === "\r") {
      text += char;
      continue;
    }
    const folded = Object.prototype.hasOwnProperty.call(WINANSI_FOLD, char) ? WINANSI_FOLD[char] : char;
    for (const out of folded) {
      if (encodableInWinAnsi(out.charCodeAt(0))) text += out;
      else dropped += 1;
    }
  }
  return { text, dropped };
}

/**
 * Counts characters no available font can draw: text outside WinAnsi is checked
 * against the embedded app font before being reported as unsupported.
 */
export async function countUnsupportedCharacters(objects = []) {
  let total = 0;
  for (const object of objects) {
    if (object?.type !== "text") continue;
    const raw = String(object.text ?? "");
    if (!sanitizeWinAnsiText(raw).dropped) continue;
    const family = FONT_TABLE[object.fontFamily] ? object.fontFamily : "sans";
    const missing = await missingGlyphs(raw, { family, italic: !!object.italic });
    const missingSet = new Set(missing);
    for (const char of raw) if (missingSet.has(char)) total += 1;
  }
  return total;
}

function hexRgb(hex, fallback) {
  const match = /^#?([0-9a-f]{6})$/i.exec(String(hex || "").trim());
  if (!match) return fallback;
  const value = parseInt(match[1], 16);
  return rgb(((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255);
}

function clamp01(value) {
  return Math.min(1, Math.max(0, Number(value) || 0));
}

export { visibleSize, visibleToUserMatrix };

function fontKeyFor(object) {
  const family = FONT_TABLE[object.fontFamily] ? object.fontFamily : "sans";
  const weight = object.bold ? (object.italic ? "boldItalic" : "bold") : (object.italic ? "italic" : "regular");
  return { family, weight, cacheKey: `${family}:${weight}` };
}

function wrapLines(text, font, size, maxWidth) {
  const lines = [];
  for (const paragraph of String(text || "").split(/\r?\n/)) {
    if (!paragraph) {
      lines.push("");
      continue;
    }
    let current = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const candidate = current ? `${current} ${word}` : word;
      if (current && maxWidth > 0 && font.widthOfTextAtSize(candidate, size) > maxWidth) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    lines.push(current);
  }
  return lines;
}

function alignedX(line, font, size, rect, pageWidth) {
  const boxX = rect.x * pageWidth;
  const boxW = rect.w * pageWidth;
  if (rect.align === "center" || rect.textAlign === "center") return boxX + (boxW - font.widthOfTextAtSize(line, size)) / 2;
  if (rect.align === "right" || rect.textAlign === "right") return boxX + boxW - font.widthOfTextAtSize(line, size);
  return boxX;
}

function arrowHead(from, to, size) {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const spread = Math.PI / 7;
  return [
    { x: to.x - size * Math.cos(angle - spread), y: to.y - size * Math.sin(angle - spread) },
    { x: to.x - size * Math.cos(angle + spread), y: to.y - size * Math.sin(angle + spread) },
  ];
}

async function drawObject(page, object, context) {
  const { width, height, doc, fonts } = context;
  const opacity = object.opacity === undefined ? 1 : clamp01(object.opacity);
  const rect = object.rect || { x: 0, y: 0, w: 0.2, h: 0.1 };
  // Visible-space helpers: normalized top-left -> visible bottom-left points.
  const px = (nx) => nx * width;
  const py = (ny) => height - ny * height;

  if (object.type === "text") {
    const { family, weight, cacheKey } = fontKeyFor(object);
    const { font, text, dropped } = await resolveTextFont(
      doc,
      object.text,
      { family, bold: !!object.bold, italic: !!object.italic },
      {
        standardFont: async () => {
          if (!fonts.has(cacheKey)) fonts.set(cacheKey, await doc.embedFont(FONT_TABLE[family][weight]));
          return fonts.get(cacheKey);
        },
        sanitize: sanitizeWinAnsiText,
      }
    );
    if (!text.trim()) return dropped;
    const size = Math.max(1, (object.sizePct || 0.02) * height);
    const maxWidth = Math.max(0, rect.w * width);
    const lines = wrapLines(text, font, size, maxWidth);
    const lineHeight = size * 1.2;
    const top = py(rect.y);
    lines.forEach((line, index) => {
      if (!line) return;
      page.drawText(line, {
        x: alignedX(line, font, size, { ...rect, align: object.align }, width),
        y: top - size * 0.85 - index * lineHeight,
        size,
        font,
        color: hexRgb(object.color, rgb(0.1, 0.1, 0.12)),
        opacity,
      });
    });
    return dropped;
  }

  if (object.type === "image") {
    const bytes = object.source?.bytes;
    if (!bytes) return 0;
    const image = object.source.type === "image/jpeg" ? await doc.embedJpg(bytes) : await doc.embedPng(bytes);
    const w = rect.w * width;
    const h = rect.h ? rect.h * height : w * (image.height / image.width);
    page.drawImage(image, { x: px(rect.x), y: py(rect.y) - h, width: w, height: h, opacity });
    return 0;
  }

  if (object.type === "rect" || object.type === "highlight") {
    const isHighlight = object.type === "highlight";
    const w = rect.w * width;
    const h = rect.h * height;
    const strokeWidth = Number(object.strokeWidth) || 0;
    page.drawRectangle({
      x: px(rect.x),
      y: py(rect.y) - h,
      width: w,
      height: h,
      color: object.fill ? hexRgb(object.fill, rgb(1, 1, 1)) : undefined,
      borderColor: !isHighlight && strokeWidth > 0 ? hexRgb(object.stroke, rgb(0.1, 0.1, 0.12)) : undefined,
      borderWidth: !isHighlight && strokeWidth > 0 ? strokeWidth : 0,
      opacity: object.fill ? opacity : 0,
      borderOpacity: opacity,
      blendMode: isHighlight ? BlendMode.Multiply : undefined,
    });
    return 0;
  }

  if (object.type === "ellipse") {
    const w = rect.w * width;
    const h = rect.h * height;
    const strokeWidth = Number(object.strokeWidth) || 0;
    page.drawEllipse({
      x: px(rect.x) + w / 2,
      y: py(rect.y) - h / 2,
      xScale: Math.max(0.5, w / 2),
      yScale: Math.max(0.5, h / 2),
      color: object.fill ? hexRgb(object.fill, rgb(1, 1, 1)) : undefined,
      borderColor: strokeWidth > 0 ? hexRgb(object.stroke, rgb(0.1, 0.1, 0.12)) : undefined,
      borderWidth: strokeWidth > 0 ? strokeWidth : 0,
      opacity: object.fill ? opacity : 0,
      borderOpacity: opacity,
    });
    return 0;
  }

  if (object.type === "line") {
    const from = { x: px(object.from?.x ?? rect.x), y: py(object.from?.y ?? rect.y) };
    const to = { x: px(object.to?.x ?? rect.x + rect.w), y: py(object.to?.y ?? rect.y) };
    const thickness = Math.max(0.5, Number(object.strokeWidth) || 1.5);
    const color = hexRgb(object.stroke, rgb(0.1, 0.1, 0.12));
    page.drawLine({ start: from, end: to, thickness, color, opacity });
    if (object.arrow) {
      const head = arrowHead(from, to, thickness * 5);
      head.forEach((point) => page.drawLine({ start: to, end: point, thickness, color, opacity }));
    }
    return 0;
  }

  if (object.type === "draw") {
    const points = (object.points || []).map((point) => ({ x: px(point.x), y: py(point.y) }));
    if (points.length < 2) return 0;
    const thickness = Math.max(0.5, Number(object.strokeWidth) || 2);
    const color = hexRgb(object.stroke, rgb(0.1, 0.1, 0.12));
    for (let i = 1; i < points.length; i += 1) {
      page.drawLine({ start: points[i - 1], end: points[i], thickness, color, opacity, lineCap: LineCapStyle.Round });
    }
    return 0;
  }

  return 0;
}

function outputRecord(name, bytes, pages, fileId) {
  const blob = bytes instanceof Blob ? bytes : new Blob([bytes], { type: "application/pdf" });
  return { name, blob, size: blob.size, pages, fileId };
}

// files: [{ id, name }] — annotation objects carry their own fileId/srcIndex.
//
// `opts.sourceBytes` (a `{ [fileId]: Uint8Array }` map) replaces the loaded
// source for a file, which is how the editor draws objects on top of a document
// whose text was already rewritten in the same run.
export async function annotatePdfs(files, opts = {}, onProgress) {
  const objects = (opts.objects || []).filter((object) => object && ANNOTATION_TYPES.includes(object.type));
  const customBase = opts.outputName ? sanitizePdfBaseName(opts.outputName) : "";
  const sourceBytes = opts.sourceBytes || {};
  const dedupe = createNameDeduper();
  const outputs = [];
  let droppedCharacters = 0;

  for (let f = 0; f < files.length; f += 1) {
    const file = files[f];
    const record = PdfEngine.files.get(file.id);
    const bytes = sourceBytes[file.id] || record?.bytes;
    if (!bytes) continue;
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const pages = doc.getPages();
    const fonts = new Map();
    const byPage = new Map();
    for (const object of objects) {
      if (object.fileId !== file.id) continue;
      const index = Math.min(Math.max(0, object.srcIndex | 0), pages.length - 1);
      if (!byPage.has(index)) byPage.set(index, []);
      byPage.get(index).push(object);
    }

    for (const [index, pageObjects] of byPage) {
      const page = pages[index];
      const size = page.getSize();
      const { width, height, angle } = visibleSize(size.width, size.height, page.getRotation().angle || 0);
      const matrix = visibleToUserMatrix(size.width, size.height, angle);
      page.pushOperators(pushGraphicsState(), concatTransformationMatrix(...matrix));
      for (const object of pageObjects) {
        droppedCharacters += await drawObject(page, object, { width, height, doc, fonts });
      }
      page.pushOperators(popGraphicsState());
    }

    if (onProgress) onProgress(((f + 1) / files.length) * 95);
    const fallbackBase = sanitizePdfBaseName(file.name) || `dokumen-${f + 1}`;
    const name = customBase
      ? (files.length > 1 ? `${customBase}-${f + 1}.pdf` : `${customBase}.pdf`)
      : `${fallbackBase}-diedit.pdf`;
    outputs.push(outputRecord(dedupe(name), await doc.save(), pages.length, file.id));
  }

  if (onProgress) onProgress(100);
  return { outputs, droppedCharacters };
}
