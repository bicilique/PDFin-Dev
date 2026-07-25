import {
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFName,
  PDFRawStream,
  PDFNumber,
  concatTransformationMatrix,
  decodePDFRawStream,
  popGraphicsState,
  pushGraphicsState,
  rgb,
} from "pdf-lib";
import { PdfEngine } from "./pdfEngine.js";
import { sanitizePdfBaseName, createNameDeduper } from "./outputName.js";
import { visibleSize, visibleToUserMatrix } from "./pdfAnnotate.js";
import { tokenizeContentStream, serializeContentStream, formatOperand } from "./contentStream.js";
import {
  IDENTITY,
  applyMatrix,
  boxInside,
  boxOfQuad,
  boxesIntersect,
  glyphBox,
  multiply,
  textRenderingMatrix,
} from "./pdfGeometry.js";
import { buildFontDecoder, createStandardFontWidthProvider } from "./pdfFontWidths.js";

// PDFin workspace — true redaction.
//
// Unlike the editor's white box, this removes the covered glyphs from the page
// content stream so the text cannot be selected, copied, or extracted. The
// walker is deliberately pessimistic: any construct whose geometry it cannot
// account for (Type3 fonts, unknown metrics, text clipping modes, images that
// only partially overlap, content nested in form XObjects) marks the page as
// "not provably clean", and that page is rasterized instead. Rasterizing is
// slower and drops text selection for that page, but it cannot leak.

// Glyph boxes are compared against areas grown by this fraction of the page so
// that small metric errors cannot leave a sliver of a covered glyph behind.
const SAFETY_MARGIN = 0.004;

// Areas arrive in visible page space (normalized, origin top-left). Map them to
// PDF user space so they can be compared with content-stream geometry.
export function areaToUserBox(area, pageWidth, pageHeight, angle) {
  const visible = visibleSize(pageWidth, pageHeight, angle);
  const matrix = visibleToUserMatrix(pageWidth, pageHeight, visible.angle);
  const margin = SAFETY_MARGIN;
  const x0 = Math.max(0, area.rect.x - margin) * visible.width;
  const x1 = Math.min(1, area.rect.x + area.rect.w + margin) * visible.width;
  // Visible y grows downward; content geometry grows upward.
  const yTop = visible.height - Math.max(0, area.rect.y - margin) * visible.height;
  const yBottom = visible.height - Math.min(1, area.rect.y + area.rect.h + margin) * visible.height;
  const corners = [
    applyMatrix(matrix, x0, yBottom),
    applyMatrix(matrix, x1, yBottom),
    applyMatrix(matrix, x1, yTop),
    applyMatrix(matrix, x0, yTop),
  ];
  return boxOfQuad(corners);
}

function decodeStreamBytes(stream) {
  if (!stream) return null;
  try {
    if (stream instanceof PDFRawStream) return decodePDFRawStream(stream).decode();
    if (typeof stream.getContents === "function") return stream.getContents();
  } catch {
    return null;
  }
  return null;
}

function pageContentBytes(page) {
  const contents = page.node.Contents();
  if (!contents) return new Uint8Array(0);
  const streams = contents instanceof PDFArray
    ? contents.asArray().map((ref) => page.doc.context.lookup(ref))
    : [contents];
  const parts = [];
  for (const stream of streams) {
    const bytes = decodeStreamBytes(stream);
    if (!bytes) return null;
    parts.push(bytes, Uint8Array.of(10));
  }
  let size = 0;
  for (const part of parts) size += part.length;
  const out = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function resourceDict(resources, category) {
  if (!(resources instanceof PDFDict)) return null;
  const dict = resources.lookup(PDFName.of(category));
  return dict instanceof PDFDict ? dict : null;
}

function hexOf(bytes) {
  let out = "";
  for (const byte of bytes) out += byte.toString(16).padStart(2, "0");
  return `<${out}>`;
}

class PageWalker {
  constructor({ boxes, resources, doc, standardFontWidth }) {
    this.boxes = boxes;
    this.resources = resources;
    this.doc = doc;
    this.standardFontWidth = standardFontWidth;
    this.decoderCache = new Map();
    this.removedGlyphs = 0;
    this.unsafeReasons = new Set();
    this.replacements = new Map();
  }

  markUnsafe(reason) {
    this.unsafeReasons.add(reason);
  }

  // One walker only ever sees a single resource scope, so the font name alone
  // identifies the decoder.
  fontDecoder(resources, fontName) {
    if (this.decoderCache.has(fontName)) return this.decoderCache.get(fontName);
    const fonts = resourceDict(resources, "Font");
    const fontDict = fonts ? fonts.lookup(PDFName.of(fontName)) : null;
    const decoder = buildFontDecoder(fontDict, this.standardFontWidth);
    this.decoderCache.set(fontName, decoder);
    return decoder;
  }

  intersectsAny(box) {
    return this.boxes.some((area) => boxesIntersect(box, area));
  }

  insideAny(box) {
    return this.boxes.some((area) => boxInside(box, area));
  }

  // Walks one content stream. `mutate` false means detection only (used for
  // nested form XObjects, which we never rewrite in place).
  walk(bytes, resources, initialMatrix, { mutate }) {
    const operations = tokenizeContentStream(bytes);
    this.operations = operations;
    const state = {
      ctm: initialMatrix,
      stack: [],
      font: null,
      fontName: "",
      fontSize: 0,
      charSpacing: 0,
      wordSpacing: 0,
      hScale: 1,
      leading: 0,
      rise: 0,
      renderMode: 0,
      textMatrix: IDENTITY,
      lineMatrix: IDENTITY,
    };

    const numberAt = (operands, index) => {
      const operand = operands[index];
      return operand && operand.type === "number" ? operand.value : 0;
    };

    for (let index = 0; index < operations.length; index += 1) {
      const { operator, operands } = operations[index];
      switch (operator) {
        case "q":
          // The text matrix is not part of the graphics state, so it is left
          // alone across q/Q.
          state.stack.push({
            ctm: state.ctm, font: state.font, fontName: state.fontName, fontSize: state.fontSize,
            charSpacing: state.charSpacing, wordSpacing: state.wordSpacing, hScale: state.hScale,
            leading: state.leading, rise: state.rise, renderMode: state.renderMode,
          });
          break;
        case "Q": {
          const saved = state.stack.pop();
          if (saved) Object.assign(state, saved);
          break;
        }
        case "cm":
          state.ctm = multiply(operands.slice(0, 6).map((operand) => (operand.type === "number" ? operand.value : 0)), state.ctm);
          break;
        case "BT":
          state.textMatrix = IDENTITY;
          state.lineMatrix = IDENTITY;
          break;
        case "Tf":
          state.fontName = operands[0]?.type === "name" ? operands[0].value : "";
          state.fontSize = numberAt(operands, 1);
          state.font = this.fontDecoder(resources, state.fontName);
          break;
        case "Tc": state.charSpacing = numberAt(operands, 0); break;
        case "Tw": state.wordSpacing = numberAt(operands, 0); break;
        case "Tz": state.hScale = numberAt(operands, 0) / 100; break;
        case "TL": state.leading = numberAt(operands, 0); break;
        case "Ts": state.rise = numberAt(operands, 0); break;
        case "Tr": state.renderMode = numberAt(operands, 0); break;
        case "Td":
          state.lineMatrix = multiply([1, 0, 0, 1, numberAt(operands, 0), numberAt(operands, 1)], state.lineMatrix);
          state.textMatrix = state.lineMatrix;
          break;
        case "TD":
          state.leading = -numberAt(operands, 1);
          state.lineMatrix = multiply([1, 0, 0, 1, numberAt(operands, 0), numberAt(operands, 1)], state.lineMatrix);
          state.textMatrix = state.lineMatrix;
          break;
        case "Tm":
          state.lineMatrix = operands.slice(0, 6).map((operand) => (operand.type === "number" ? operand.value : 0));
          state.textMatrix = state.lineMatrix;
          break;
        case "T*":
          state.lineMatrix = multiply([1, 0, 0, 1, 0, -state.leading], state.lineMatrix);
          state.textMatrix = state.lineMatrix;
          break;
        case "Tj":
        case "TJ":
        case "'":
        case "\"":
          this.handleShowText(operator, operands, state, index, { mutate });
          break;
        case "Do":
          this.handleXObject(operands[0], state, index, resources, { mutate });
          break;
        case "INLINE_IMAGE": {
          const box = boxOfQuad([
            applyMatrix(state.ctm, 0, 0), applyMatrix(state.ctm, 1, 0),
            applyMatrix(state.ctm, 1, 1), applyMatrix(state.ctm, 0, 1),
          ]);
          if (this.intersectsAny(box)) {
            if (this.insideAny(box) && mutate) this.replacements.set(index, null);
            else this.markUnsafe("inline-image");
          }
          break;
        }
        default:
          break;
      }
    }
  }

  // Splits a text-showing operator into kept runs and removed glyphs, emitting
  // an equivalent TJ array whose numeric adjustments preserve the advance of
  // everything that was taken out.
  handleShowText(operator, operands, state, index, { mutate }) {
    const showOperand = operator === "\"" ? operands[2] : operands[operands.length - 1];
    if (operator === "'") {
      state.lineMatrix = multiply([1, 0, 0, 1, 0, -state.leading], state.lineMatrix);
      state.textMatrix = state.lineMatrix;
    }
    if (operator === "\"") {
      state.wordSpacing = operands[0]?.type === "number" ? operands[0].value : state.wordSpacing;
      state.charSpacing = operands[1]?.type === "number" ? operands[1].value : state.charSpacing;
      state.lineMatrix = multiply([1, 0, 0, 1, 0, -state.leading], state.lineMatrix);
      state.textMatrix = state.lineMatrix;
    }

    const items = operator === "TJ"
      ? (showOperand?.type === "array" ? showOperand.items : [])
      : (showOperand?.type === "string" ? [showOperand] : []);
    if (!items.length) return;

    const decoder = state.font;
    const outputs = [];
    let pending = [];
    let removedHere = 0;
    let touched = false;

    const flush = () => {
      if (!pending.length) return;
      outputs.push(hexOf(Uint8Array.from(pending)));
      pending = [];
    };

    for (const item of items) {
      if (item.type === "number") {
        flush();
        outputs.push(formatOperand(item));
        const shift = (-item.value / 1000) * state.fontSize * state.hScale;
        state.textMatrix = multiply([1, 0, 0, 1, shift, 0], state.textMatrix);
        continue;
      }
      if (item.type !== "string") continue;
      if (!decoder || !decoder.supported) {
        // Unknown metrics: we cannot place these glyphs, so the page is only
        // safe if none of them could be inside an area. Assume the worst.
        this.markUnsafe(decoder?.reason || "unknown-font");
        flush();
        outputs.push(hexOf(item.bytes));
        continue;
      }

      const glyphs = decoder.decode(item.bytes);
      const bytesPerGlyph = item.bytes.length && glyphs.length ? Math.round(item.bytes.length / glyphs.length) : 1;
      for (let glyphIndex = 0; glyphIndex < glyphs.length; glyphIndex += 1) {
        const glyph = glyphs[glyphIndex];
        const trm = textRenderingMatrix({
          fontSize: state.fontSize, hScale: state.hScale, rise: state.rise,
          textMatrix: state.textMatrix, ctm: state.ctm,
        });
        const covered = this.intersectsAny(glyphBox(trm, glyph.width));
        const advance = (glyph.width * state.fontSize + state.charSpacing + (glyph.isSingleByteSpace ? state.wordSpacing : 0)) * state.hScale;

        if (covered) {
          if (state.renderMode >= 4) this.markUnsafe("text-clipping-mode");
          touched = true;
          removedHere += 1;
          flush();
          if (state.fontSize !== 0) {
            const compensation = -1000 * (glyph.width + (state.charSpacing + (glyph.isSingleByteSpace ? state.wordSpacing : 0)) / state.fontSize);
            outputs.push(String(Number(compensation.toFixed(4))));
          }
        } else {
          const offset = glyphIndex * bytesPerGlyph;
          for (let byteIndex = 0; byteIndex < bytesPerGlyph; byteIndex += 1) {
            const byte = item.bytes[offset + byteIndex];
            if (byte !== undefined) pending.push(byte);
          }
        }
        state.textMatrix = multiply([1, 0, 0, 1, advance, 0], state.textMatrix);
      }
    }
    flush();

    this.removedGlyphs += removedHere;
    if (!touched || !mutate) return;

    const array = `[${outputs.join(" ")}]`;
    if (operator === "Tj" || operator === "TJ") {
      this.replacements.set(index, `${array} TJ`);
    } else if (operator === "'") {
      this.replacements.set(index, `T* ${array} TJ`);
    } else {
      const aw = formatOperand(operands[0]);
      const ac = formatOperand(operands[1]);
      this.replacements.set(index, `${aw} Tw ${ac} Tc T* ${array} TJ`);
    }
  }

  handleXObject(nameOperand, state, index, resources, { mutate }) {
    if (!nameOperand || nameOperand.type !== "name") return;
    const xobjects = resourceDict(resources, "XObject");
    const xobject = xobjects ? xobjects.lookup(PDFName.of(nameOperand.value)) : null;
    if (!xobject) return;
    const dict = xobject instanceof PDFRawStream ? xobject.dict : xobject;
    const subtype = dict instanceof PDFDict ? dict.lookup(PDFName.of("Subtype")) : null;
    const subtypeName = subtype instanceof PDFName ? subtype.asString().replace(/^\//, "") : "";

    if (subtypeName === "Image") {
      const box = boxOfQuad([
        applyMatrix(state.ctm, 0, 0), applyMatrix(state.ctm, 1, 0),
        applyMatrix(state.ctm, 1, 1), applyMatrix(state.ctm, 0, 1),
      ]);
      if (!this.intersectsAny(box)) return;
      // Fully covered images can simply be dropped; a partial overlap would
      // need pixel surgery, so the page goes to the raster path instead.
      if (this.insideAny(box) && mutate) this.replacements.set(index, null);
      else this.markUnsafe("image-overlap");
      return;
    }

    if (subtypeName !== "Form") return;
    const bytes = decodeStreamBytes(xobject);
    if (!bytes) {
      this.markUnsafe("unreadable-form");
      return;
    }
    const formMatrixArray = dict.lookup(PDFName.of("Matrix"));
    const formMatrix = formMatrixArray instanceof PDFArray
      ? formMatrixArray.asArray().map((item) => (item instanceof PDFNumber ? item.asNumber() : 0))
      : IDENTITY;
    const formResources = resourceDict(dict, "Resources") || resources;

    // Detection-only pass: if anything inside the form falls in an area, the
    // page cannot be cleaned by rewriting the page stream alone.
    const probe = new PageWalker({ boxes: this.boxes, resources: formResources, doc: this.doc, standardFontWidth: this.standardFontWidth });
    probe.walk(bytes, formResources, multiply(formMatrix.length === 6 ? formMatrix : IDENTITY, state.ctm), { mutate: false });
    if (probe.removedGlyphs > 0 || probe.unsafeReasons.size > 0 || probe.replacements.size > 0) this.markUnsafe("form-xobject");
  }
}

function removeCoveredAnnotations(page, boxes) {
  const annots = page.node.Annots();
  if (!(annots instanceof PDFArray)) return 0;
  const keep = [];
  let removed = 0;
  for (let index = 0; index < annots.size(); index += 1) {
    const ref = annots.get(index);
    const annot = page.doc.context.lookup(ref);
    const rect = annot instanceof PDFDict ? annot.lookup(PDFName.of("Rect")) : null;
    if (rect instanceof PDFArray && rect.size() === 4) {
      const values = rect.asArray().map((item) => (item instanceof PDFNumber ? item.asNumber() : 0));
      const box = { x0: Math.min(values[0], values[2]), y0: Math.min(values[1], values[3]), x1: Math.max(values[0], values[2]), y1: Math.max(values[1], values[3]) };
      if (boxes.some((area) => boxesIntersect(box, area))) {
        removed += 1;
        continue;
      }
    }
    keep.push(ref);
  }
  if (removed) {
    const next = page.doc.context.obj([]);
    keep.forEach((ref) => next.push(ref));
    page.node.set(PDFName.of("Annots"), next);
  }
  return removed;
}

function hexRgb(hex, fallback) {
  const match = /^#?([0-9a-f]{6})$/i.exec(String(hex || "").trim());
  if (!match) return fallback;
  const value = parseInt(match[1], 16);
  return rgb(((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255);
}

function drawAreaBoxes(page, areas, fill) {
  const size = page.getSize();
  const visible = visibleSize(size.width, size.height, page.getRotation().angle || 0);
  const matrix = visibleToUserMatrix(size.width, size.height, visible.angle);
  page.pushOperators(pushGraphicsState(), concatTransformationMatrix(...matrix));
  for (const area of areas) {
    const width = area.rect.w * visible.width;
    const height = area.rect.h * visible.height;
    page.drawRectangle({
      x: area.rect.x * visible.width,
      y: visible.height - area.rect.y * visible.height - height,
      width,
      height,
      color: fill,
    });
  }
  page.pushOperators(popGraphicsState());
}

async function rasterizePage(doc, page, record, pageIndex, renderPage) {
  const size = page.getSize();
  const visible = visibleSize(size.width, size.height, page.getRotation().angle || 0);
  const canvas = await renderPage(record.id, pageIndex + 1, Math.max(600, visible.width * 2));
  if (!canvas) throw new Error("REDACT_RASTER_UNAVAILABLE");
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("REDACT_RASTER_UNAVAILABLE");
  const image = await doc.embedPng(new Uint8Array(await blob.arrayBuffer()));

  // Drop every trace of the original page content, then paint the flattened
  // picture back in visible space so rotation still applies as before.
  page.node.delete(PDFName.of("Contents"));
  page.node.delete(PDFName.of("Annots"));
  const matrix = visibleToUserMatrix(size.width, size.height, visible.angle);
  page.pushOperators(pushGraphicsState(), concatTransformationMatrix(...matrix));
  page.drawImage(image, { x: 0, y: 0, width: visible.width, height: visible.height });
  page.pushOperators(popGraphicsState());
}

/**
 * Removes the content covered by `opts.areas` from each file.
 *
 * areas: [{ fileId, srcIndex, rect: { x, y, w, h } }] in visible page space.
 * mode: "vector" (rewrite content streams, rasterize only pages that cannot be
 * proven clean) or "raster" (always flatten redacted pages).
 */
export async function redactPdfs(files, opts = {}, onProgress) {
  const areas = (opts.areas || []).filter((area) => area && area.rect);
  const mode = opts.mode === "raster" ? "raster" : "vector";
  const fill = hexRgb(opts.fillColor, rgb(0, 0, 0));
  const renderPage = opts.renderPage || PdfEngine.renderPage;
  const customBase = opts.outputName ? sanitizePdfBaseName(opts.outputName) : "";
  const dedupe = createNameDeduper();
  const outputs = [];
  const rasterizedPages = [];
  let removedGlyphs = 0;
  let removedAnnotations = 0;

  for (let f = 0; f < files.length; f += 1) {
    const file = files[f];
    const record = PdfEngine.files.get(file.id);
    if (!record) continue;
    const doc = await PDFDocument.load(record.bytes, { ignoreEncryption: true });
    const standardFontWidth = createStandardFontWidthProvider(doc);
    const pages = doc.getPages();
    const byPage = new Map();
    for (const area of areas) {
      if (area.fileId !== file.id) continue;
      const index = Math.min(Math.max(0, area.srcIndex | 0), pages.length - 1);
      if (!byPage.has(index)) byPage.set(index, []);
      byPage.get(index).push(area);
    }

    for (const [pageIndex, pageAreas] of byPage) {
      const page = pages[pageIndex];
      const size = page.getSize();
      const angle = page.getRotation().angle || 0;
      const boxes = pageAreas.map((area) => areaToUserBox(area, size.width, size.height, angle));
      removedAnnotations += removeCoveredAnnotations(page, boxes);

      let rasterReason = mode === "raster" ? "mode" : "";
      if (!rasterReason) {
        const bytes = pageContentBytes(page);
        if (bytes === null) {
          rasterReason = "unreadable-content";
        } else {
          const walker = new PageWalker({ boxes, resources: page.node.Resources(), doc, standardFontWidth });
          walker.walk(bytes, page.node.Resources(), IDENTITY, { mutate: true });
          if (walker.unsafeReasons.size) {
            rasterReason = [...walker.unsafeReasons][0];
          } else {
            const rewritten = serializeContentStream(bytes, walker.operations, walker.replacements);
            const stream = doc.context.flateStream(rewritten);
            page.node.set(PDFName.of("Contents"), doc.context.register(stream));
            removedGlyphs += walker.removedGlyphs;
          }
        }
      }

      if (rasterReason) {
        await rasterizePage(doc, page, record, pageIndex, renderPage);
        rasterizedPages.push({ fileId: file.id, pageIndex, reason: rasterReason });
      }

      drawAreaBoxes(page, pageAreas, fill);
    }

    if (onProgress) onProgress(((f + 1) / files.length) * 95);
    const fallbackBase = sanitizePdfBaseName(file.name) || `dokumen-${f + 1}`;
    const name = customBase
      ? (files.length > 1 ? `${customBase}-${f + 1}.pdf` : `${customBase}.pdf`)
      : `${fallbackBase}-redaksi.pdf`;
    const bytes = await doc.save();
    const blob = new Blob([bytes], { type: "application/pdf" });
    outputs.push({ name: dedupe(name), blob, size: blob.size, pages: pages.length });
  }

  if (onProgress) onProgress(100);
  return { outputs, rasterizedPages, removedGlyphs, removedAnnotations };
}
