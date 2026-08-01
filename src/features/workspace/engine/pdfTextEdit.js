import {
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFName,
  PDFRawStream,
  StandardFonts,
  concatTransformationMatrix,
  decodePDFRawStream,
  popGraphicsState,
  pushGraphicsState,
  rgb,
} from "pdf-lib";
import { PdfEngine } from "./pdfEngine.js";
import { sanitizePdfBaseName, createNameDeduper } from "./outputName.js";
import { tokenizeContentStream, serializeContentStream, formatOperand } from "./contentStream.js";
import { buildFontDecoder, createStandardFontWidthProvider, describeFont, readSimpleEncoding, winAnsiMaps } from "./pdfFontWidths.js";
import { cssFontStack, fontDisplayName } from "./fontCatalog.js";
import { parseToUnicodeCMap, encodeWithCMap } from "./pdfCMap.js";
import { sanitizeWinAnsiText } from "./pdfAnnotate.js";
import { resolveTextFont } from "./unicodeFont.js";
import {
  IDENTITY,
  applyMatrix,
  boxOfQuad,
  glyphBox,
  isAxisAligned,
  multiply,
  textRenderingMatrix,
  userToVisibleMatrix,
  visibleSize,
} from "./pdfGeometry.js";

// PDFin workspace — editing the text that is already in a PDF.
//
// Each text-showing operator on a page becomes one editable run. Replacing a
// run is attempted two ways, in order:
//
//   1. Same font. If every character of the new text can be re-encoded with the
//      run's own font (via its ToUnicode CMap, or WinAnsi for the standard 14),
//      the operator is rewritten with new character codes. The result is
//      pixel-identical in typeface, size, and color.
//   2. Redraw. Otherwise the original glyphs are dropped from the stream and
//      the new text is drawn with the closest standard font at the same
//      position, size, and color. Subset fonts routinely lack the glyphs a user
//      types, so this path is the norm rather than the exception.
//
// Runs whose geometry we cannot reproduce (rotated or skewed text, unknown font
// metrics, invisible OCR layers) are reported as read-only instead of being
// edited badly.

const FALLBACK_FONTS = {
  "sans:": StandardFonts.Helvetica,
  "sans:b": StandardFonts.HelveticaBold,
  "sans:i": StandardFonts.HelveticaOblique,
  "sans:bi": StandardFonts.HelveticaBoldOblique,
  "serif:": StandardFonts.TimesRoman,
  "serif:b": StandardFonts.TimesRomanBold,
  "serif:i": StandardFonts.TimesRomanItalic,
  "serif:bi": StandardFonts.TimesRomanBoldItalic,
  "mono:": StandardFonts.Courier,
  "mono:b": StandardFonts.CourierBold,
  "mono:i": StandardFonts.CourierOblique,
  "mono:bi": StandardFonts.CourierBoldOblique,
};

function familyOf(description = {}) {
  if (description.family === "mono" || description.family === "serif" || description.family === "sans") return description.family;
  return description.fixedPitch ? "mono" : description.serif ? "serif" : "sans";
}

function fallbackFontFor(description) {
  const style = `${description.bold ? "b" : ""}${description.italic ? "i" : ""}`;
  return FALLBACK_FONTS[`${familyOf(description)}:${style}`] || StandardFonts.Helvetica;
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

function cmykToRgb(c, m, y, k) {
  return rgb((1 - Math.min(1, c + k)), (1 - Math.min(1, m + k)), (1 - Math.min(1, y + k)));
}

// Font-level data shared by every run that uses it. Parsing a ToUnicode CMap is
// the expensive part of reading a page, and the same font resource is reused by
// every page of a document, so contexts are cached per font object.
const fontContextCache = new WeakMap();

function fontContextFor(fontDict, standardFontWidth) {
  if (!(fontDict instanceof PDFDict)) return buildFontContext(fontDict, standardFontWidth);
  const cached = fontContextCache.get(fontDict);
  if (cached) return cached;
  const context = buildFontContext(fontDict, standardFontWidth);
  fontContextCache.set(fontDict, context);
  return context;
}

function buildFontContext(fontDict, standardFontWidth) {
  const decoder = buildFontDecoder(fontDict, standardFontWidth);
  const description = describeFont(fontDict);
  let maps = { toUnicode: new Map(), fromUnicode: new Map(), codeByteLength: description.subtype === "Type0" ? 2 : 1 };

  const toUnicodeStream = fontDict instanceof PDFDict ? fontDict.lookup(PDFName.of("ToUnicode")) : null;
  const cmapBytes = decodeStreamBytes(toUnicodeStream);
  if (cmapBytes) {
    const parsed = parseToUnicodeCMap(cmapBytes);
    if (parsed.toUnicode.size) maps = parsed;
  } else if (description.subtype !== "Type0" && fontDict instanceof PDFDict) {
    // Without a CMap we can only read codes for base encodings we know, and
    // only when no /Differences array has remapped individual codes.
    const encoding = readSimpleEncoding(fontDict);
    if (!encoding.hasDifferences && encoding.name === "WinAnsiEncoding") maps = winAnsiMaps();
    else if (!encoding.hasDifferences && encoding.name === "StandardEncoding") maps = winAnsiMaps(true);
  }

  return { decoder, description, maps, hasText: maps.toUnicode.size > 0 };
}

class TextRunWalker {
  constructor({ doc, resources, standardFontWidth }) {
    this.doc = doc;
    this.resources = resources;
    this.standardFontWidth = standardFontWidth;
    this.fontCache = new Map();
    this.runs = [];
  }

  fontContext(fontName) {
    if (this.fontCache.has(fontName)) return this.fontCache.get(fontName);
    const fonts = resourceDict(this.resources, "Font");
    const fontDict = fonts ? fonts.lookup(PDFName.of(fontName)) : null;
    const context = fontContextFor(fontDict, this.standardFontWidth);
    this.fontCache.set(fontName, context);
    return context;
  }

  walk(operations) {
    const state = {
      ctm: IDENTITY,
      stack: [],
      fill: rgb(0, 0, 0),
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
    const number = (operands, index) => (operands[index]?.type === "number" ? operands[index].value : 0);

    for (let index = 0; index < operations.length; index += 1) {
      const { operator, operands } = operations[index];
      switch (operator) {
        case "q":
          state.stack.push({
            ctm: state.ctm, fill: state.fill, font: state.font, fontName: state.fontName, fontSize: state.fontSize,
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
        case "g": state.fill = rgb(number(operands, 0), number(operands, 0), number(operands, 0)); break;
        case "rg": state.fill = rgb(number(operands, 0), number(operands, 1), number(operands, 2)); break;
        case "k": state.fill = cmykToRgb(number(operands, 0), number(operands, 1), number(operands, 2), number(operands, 3)); break;
        case "sc":
        case "scn":
          // Only plain numeric components are understood; pattern and named
          // color spaces keep whatever fill was in effect.
          if (operands.length === 1 && operands[0].type === "number") state.fill = rgb(number(operands, 0), number(operands, 0), number(operands, 0));
          else if (operands.length === 3 && operands.every((operand) => operand.type === "number")) state.fill = rgb(number(operands, 0), number(operands, 1), number(operands, 2));
          else if (operands.length === 4 && operands.every((operand) => operand.type === "number")) state.fill = cmykToRgb(number(operands, 0), number(operands, 1), number(operands, 2), number(operands, 3));
          break;
        case "BT":
          state.textMatrix = IDENTITY;
          state.lineMatrix = IDENTITY;
          break;
        case "Tf":
          state.fontName = operands[0]?.type === "name" ? operands[0].value : "";
          state.fontSize = number(operands, 1);
          state.font = this.fontContext(state.fontName);
          break;
        case "Tc": state.charSpacing = number(operands, 0); break;
        case "Tw": state.wordSpacing = number(operands, 0); break;
        case "Tz": state.hScale = number(operands, 0) / 100; break;
        case "TL": state.leading = number(operands, 0); break;
        case "Ts": state.rise = number(operands, 0); break;
        case "Tr": state.renderMode = number(operands, 0); break;
        case "Td":
        case "TD":
          if (operator === "TD") state.leading = -number(operands, 1);
          state.lineMatrix = multiply([1, 0, 0, 1, number(operands, 0), number(operands, 1)], state.lineMatrix);
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
          this.readRun(operator, operands, state, index);
          break;
        default:
          break;
      }
    }
    return this.runs;
  }

  readRun(operator, operands, state, opIndex) {
    if (operator === "'" || operator === "\"") {
      if (operator === "\"") {
        state.wordSpacing = operands[0]?.type === "number" ? operands[0].value : state.wordSpacing;
        state.charSpacing = operands[1]?.type === "number" ? operands[1].value : state.charSpacing;
      }
      state.lineMatrix = multiply([1, 0, 0, 1, 0, -state.leading], state.lineMatrix);
      state.textMatrix = state.lineMatrix;
    }

    const showOperand = operator === "\"" ? operands[2] : operands[operands.length - 1];
    const items = operator === "TJ"
      ? (showOperand?.type === "array" ? showOperand.items : [])
      : (showOperand?.type === "string" ? [showOperand] : []);
    if (!items.length) return;

    const context = state.font;
    const startMatrix = state.textMatrix;
    const startTrm = textRenderingMatrix({
      fontSize: state.fontSize, hScale: state.hScale, rise: state.rise,
      textMatrix: startMatrix, ctm: state.ctm,
    });

    let text = "";
    let advance = 0;
    let unmapped = 0;
    const boxes = [];

    for (const item of items) {
      if (item.type === "number") {
        advance += (-item.value / 1000) * state.fontSize * state.hScale;
        continue;
      }
      if (item.type !== "string") continue;
      if (!context?.decoder?.supported) {
        unmapped += 1;
        continue;
      }
      const glyphs = context.decoder.decode(item.bytes);
      for (const glyph of glyphs) {
        const trm = textRenderingMatrix({
          fontSize: state.fontSize, hScale: state.hScale, rise: state.rise,
          textMatrix: multiply([1, 0, 0, 1, advance, 0], startMatrix), ctm: state.ctm,
        });
        boxes.push(glyphBox(trm, glyph.width));
        const mapped = context.maps.toUnicode.get(glyph.code);
        if (mapped === undefined) unmapped += 1;
        text += mapped ?? "";
        advance += (glyph.width * state.fontSize + state.charSpacing + (glyph.isSingleByteSpace ? state.wordSpacing : 0)) * state.hScale;
      }
    }

    // Advance the caller's text matrix past this run.
    state.textMatrix = multiply([1, 0, 0, 1, advance, 0], startMatrix);

    let reason = "";
    if (!context?.decoder?.supported) reason = context?.decoder?.reason || "unknown-font";
    else if (unmapped) reason = "unmapped-characters";
    else if (!isAxisAligned(startTrm)) reason = "rotated-text";
    else if (state.renderMode === 3 || state.renderMode === 7) reason = "invisible-text";
    else if (state.fontSize === 0 || state.hScale === 0) reason = "degenerate-text";

    // Runs we cannot decode are still reported, with an empty text and a reason,
    // so the UI can say "this page has text I cannot edit" instead of pretending
    // the text is not there.
    if (!boxes.length && !text && !reason) return;
    const box = boxes.length
      ? boxOfQuad([[Math.min(...boxes.map((b) => b.x0)), Math.min(...boxes.map((b) => b.y0))], [Math.max(...boxes.map((b) => b.x1)), Math.max(...boxes.map((b) => b.y1))]])
      : { x0: startTrm[4], y0: startTrm[5], x1: startTrm[4], y1: startTrm[5] };

    this.runs.push({
      unreadable: !boxes.length,
      opIndex,
      operator,
      text,
      reason,
      editable: !reason,
      box,
      origin: [startTrm[4], startTrm[5]],
      drawSize: startTrm[3],
      xScale: startTrm[3] === 0 ? 1 : startTrm[0] / startTrm[3],
      advance,
      fontSize: state.fontSize,
      hScale: state.hScale,
      charSpacing: state.charSpacing,
      wordSpacing: state.wordSpacing,
      fill: state.fill,
      fontName: state.fontName,
      context,
      operands,
    });
  }
}

// A single visual line is often emitted as several operators. Merging them back
// together is what makes the tool feel like editing a sentence rather than
// editing fragments, so consecutive runs are joined when they share a font, a
// size, a colour, and a baseline, and sit close enough to be the same line.
const SAME_LINE_TOLERANCE = 0.12; // in em
const MAX_JOIN_GAP = 0.6; // in em
const SPACE_GAP = 0.25; // in em

function sameStyle(a, b) {
  return a.fontName === b.fontName
    && Math.abs(a.fontSize - b.fontSize) < 1e-6
    && Math.abs(a.drawSize - b.drawSize) < 1e-6
    && a.fill?.type === b.fill?.type
    && JSON.stringify(a.fill) === JSON.stringify(b.fill);
}

function joinable(previous, next) {
  if (!previous.editable || !next.editable) return false;
  if (!sameStyle(previous, next)) return false;
  const em = previous.drawSize || 1;
  if (Math.abs(previous.origin[1] - next.origin[1]) > em * SAME_LINE_TOLERANCE) return false;
  const gap = next.origin[0] - (previous.origin[0] + previous.advance);
  return gap >= -em * SAME_LINE_TOLERANCE && gap <= em * MAX_JOIN_GAP;
}

export function mergeRuns(runs) {
  const merged = [];
  for (const run of runs) {
    const previous = merged[merged.length - 1];
    const last = previous?.members[previous.members.length - 1];
    if (previous && last && joinable(last, run)) {
      const em = last.drawSize || 1;
      const gap = run.origin[0] - (last.origin[0] + last.advance);
      previous.text += (gap >= em * SPACE_GAP && !/\s$/.test(previous.text) ? " " : "") + run.text;
      previous.members.push(run);
      previous.box = {
        x0: Math.min(previous.box.x0, run.box.x0),
        y0: Math.min(previous.box.y0, run.box.y0),
        x1: Math.max(previous.box.x1, run.box.x1),
        y1: Math.max(previous.box.y1, run.box.y1),
      };
      // Squeezing a merged edit has the whole line to work with.
      previous.fitAdvance = run.origin[0] + run.advance - previous.members[0].origin[0];
      continue;
    }
    merged.push({ ...run, members: [run], fitAdvance: run.advance });
  }
  return merged;
}

function collectPageRuns(doc, page, standardFontWidth) {
  const bytes = pageContentBytes(page);
  if (bytes === null) return { bytes: null, operations: [], runs: [] };
  const operations = tokenizeContentStream(bytes);
  const walker = new TextRunWalker({ doc, resources: page.node.Resources(), standardFontWidth });
  return { bytes, operations, runs: mergeRuns(walker.walk(operations)) };
}

function toVisibleRect(box, page) {
  const size = page.getSize();
  const visible = visibleSize(size.width, size.height, page.getRotation().angle || 0);
  const matrix = userToVisibleMatrix(size.width, size.height, visible.angle);
  const corners = [
    applyMatrix(matrix, box.x0, box.y0), applyMatrix(matrix, box.x1, box.y0),
    applyMatrix(matrix, box.x1, box.y1), applyMatrix(matrix, box.x0, box.y1),
  ];
  const bounds = boxOfQuad(corners);
  return {
    x: bounds.x0 / visible.width,
    // Visible space grows upward here; the UI overlay measures y from the top.
    y: (visible.height - bounds.y1) / visible.height,
    w: (bounds.x1 - bounds.x0) / visible.width,
    h: (bounds.y1 - bounds.y0) / visible.height,
  };
}

function cssColor(fill) {
  const channel = (value) => Math.max(0, Math.min(255, Math.round((value ?? 0) * 255)));
  if (!fill || typeof fill.red !== "number") return "#111111";
  return `rgb(${channel(fill.red)}, ${channel(fill.green)}, ${channel(fill.blue)})`;
}

// What the overlay needs to draw an edit the way the page already looks.
function describeRunStyle(description = {}) {
  return {
    bold: !!description.bold,
    italic: !!description.italic,
    family: familyOf(description),
    weight: description.weight || (description.bold ? 700 : 400),
    // A CSS stack for the recognised typeface (Calibri, Georgia, Roboto, ...),
    // falling back to the generic family when the font is not one we know.
    css: cssFontStack(description),
    name: fontDisplayName(description),
    known: !!description.matched,
    symbolic: !!description.symbolic,
  };
}

// Reading a second page of the same file should not re-parse the whole
// document, so the read-only document used for extraction is kept per file.
// Editing always loads its own copy, so nothing here is ever mutated.
const readerCache = new Map();

function readerFor(fileId, record) {
  const cached = readerCache.get(fileId);
  if (cached && cached.bytes === record.bytes) return cached.reader;
  const reader = (async () => {
    const doc = await PDFDocument.load(record.bytes, { ignoreEncryption: true });
    return { doc, pages: doc.getPages(), standardFontWidth: createStandardFontWidthProvider(doc) };
  })().catch((error) => {
    readerCache.delete(fileId);
    throw error;
  });
  readerCache.set(fileId, { bytes: record.bytes, reader });
  return reader;
}

/** Drops the cached read-only documents, e.g. when the workspace file changes. */
export function clearTextRunReaders() {
  readerCache.clear();
}

/**
 * Lists the editable text runs of one page.
 * Returns `[{ id, opIndex, srcIndex, text, rect, fontSize, editable, reason }]`
 * with `rect` in the preview's normalized visible coordinates.
 */
export async function extractPageTextRuns(fileId, srcIndex) {
  const record = PdfEngine.files.get(fileId);
  if (!record) return [];
  const { doc, pages, standardFontWidth } = await readerFor(fileId, record);
  const page = pages[Math.min(Math.max(0, srcIndex | 0), pages.length - 1)];
  if (!page) return [];
  const { runs } = collectPageRuns(doc, page, standardFontWidth);
  return runs
    .filter((run) => run.text.trim() || run.reason)
    .map((run) => ({
      id: `${fileId}:${srcIndex}:${run.opIndex}`,
      fileId,
      srcIndex,
      opIndex: run.opIndex,
      text: run.text,
      rect: toVisibleRect(run.box, page),
      fontSize: Math.round(run.drawSize * 10) / 10,
      // The colour the page draws this text in, so an edit typed over it looks
      // like the rest of the line instead of like an annotation.
      color: cssColor(run.fill),
      editable: run.editable,
      unreadable: !!run.unreadable,
      reason: run.reason,
      // Enough of the original font's character for the overlay to preview an
      // edit in a similar style, and for the inspector to name the typeface.
      style: describeRunStyle(run.context?.description),
    }));
}

// Builds the replacement source for one edited run, or returns a redraw request
// when the run's own font cannot express the new text.
function planReplacement(run, newText, { fitWidth }) {
  const scale = run.fontSize * run.hScale;
  const compensationFor = (delta) => (scale === 0 ? "" : String(Number((-1000 * delta / scale).toFixed(4))));
  // The advance to preserve belongs to this operator alone; the width to fit
  // into may span several merged operators.
  const fitAdvance = run.fitAdvance ?? run.advance;

  const encoded = run.context?.maps?.fromUnicode?.size
    ? encodeWithCMap(newText, run.context.maps.fromUnicode, run.context.maps.codeByteLength)
    : null;

  if (encoded && run.context.decoder.supported) {
    const glyphs = run.context.decoder.decode(encoded);
    const newAdvance = glyphs.reduce(
      (total, glyph) => total + (glyph.width * run.fontSize + run.charSpacing + (glyph.isSingleByteSpace ? run.wordSpacing : 0)) * run.hScale,
      0
    );
    const body = newText ? hexOf(encoded) : "";
    if (fitWidth && newAdvance > fitAdvance && fitAdvance > 0) {
      // Condense horizontally so the edit keeps the original footprint.
      const squeeze = (fitAdvance / newAdvance) * run.hScale * 100;
      return { source: `${Number(squeeze.toFixed(3))} Tz [${body}] TJ ${Number((run.hScale * 100).toFixed(3))} Tz`, kind: "same-font" };
    }
    const compensation = compensationFor(run.advance - newAdvance);
    return { source: `[${body}${compensation ? ` ${compensation}` : ""}] TJ`, kind: "same-font" };
  }

  // Erase the original glyphs but keep the advance so later runs stay put.
  const compensation = compensationFor(run.advance);
  const prefix = run.operator === "'" ? "T* " : run.operator === "\"" ? `${formatOperand(run.operands[0])} Tw ${formatOperand(run.operands[1])} Tc T* ` : "";
  return { source: `${prefix}[${compensation}] TJ`, kind: "redraw" };
}

/**
 * Applies text edits to the given files.
 *
 * edits: `{ "<srcIndex>:<opIndex>": "new text" }` per file id, i.e.
 * `opts.edits[fileId][key]`.
 */
export async function applyTextEdits(files, opts = {}, onProgress) {
  const editsByFile = opts.edits || {};
  const fitWidth = opts.fitWidth !== false;
  const customBase = opts.outputName ? sanitizePdfBaseName(opts.outputName) : "";
  const dedupe = createNameDeduper();
  const outputs = [];
  let sameFont = 0;
  let redrawn = 0;
  let skipped = 0;
  let droppedCharacters = 0;

  for (let f = 0; f < files.length; f += 1) {
    const file = files[f];
    const record = PdfEngine.files.get(file.id);
    const fileEdits = editsByFile[file.id] || {};
    if (!record) continue;
    const doc = await PDFDocument.load(record.bytes, { ignoreEncryption: true });
    const standardFontWidth = createStandardFontWidthProvider(doc);
    const pages = doc.getPages();
    const fallbackFonts = new Map();

    const byPage = new Map();
    for (const key of Object.keys(fileEdits)) {
      const [srcIndex, opIndex] = key.split(":").map(Number);
      if (!Number.isFinite(srcIndex) || !Number.isFinite(opIndex)) continue;
      if (!byPage.has(srcIndex)) byPage.set(srcIndex, []);
      byPage.get(srcIndex).push({ opIndex, text: fileEdits[key] });
    }

    for (const [srcIndex, pageEdits] of byPage) {
      const page = pages[srcIndex];
      if (!page) continue;
      const { bytes, operations, runs } = collectPageRuns(doc, page, standardFontWidth);
      if (bytes === null) {
        skipped += pageEdits.length;
        continue;
      }
      const runByOp = new Map(runs.map((run) => [run.opIndex, run]));
      const replacements = new Map();
      const redraws = [];

      for (const edit of pageEdits) {
        const run = runByOp.get(edit.opIndex);
        if (!run || !run.editable || edit.text === run.text) {
          if (run && edit.text !== run.text) skipped += 1;
          continue;
        }
        // The run's own font is tried with the text exactly as typed; only the
        // redraw path has to fall back to what a substitute font can carry.
        const plan = planReplacement(run, edit.text, { fitWidth });
        replacements.set(edit.opIndex, plan.source);
        // A merged run owns several operators: the first carries the new text,
        // the rest are emptied while keeping the advance they contributed.
        for (const member of (run.members || []).slice(1)) {
          replacements.set(member.opIndex, planReplacement(member, "", { fitWidth: false }).source);
        }
        if (plan.kind === "same-font") {
          sameFont += 1;
        } else {
          redrawn += 1;
          redraws.push({ run, rawText: edit.text });
        }
      }

      if (replacements.size) {
        const rewritten = serializeContentStream(bytes, operations, replacements);
        page.node.set(PDFName.of("Contents"), doc.context.register(doc.context.flateStream(rewritten)));
      }

      for (const { run, rawText } of redraws) {
        const description = run.context.description;
        const standardFont = fallbackFontFor(description);
        const { font, text, dropped } = await resolveTextFont(
          doc,
          rawText,
          {
            family: familyOf(description),
            bold: !!description.bold,
            italic: !!description.italic,
          },
          {
            standardFont: async () => {
              if (!fallbackFonts.has(standardFont)) fallbackFonts.set(standardFont, await doc.embedFont(standardFont));
              return fallbackFonts.get(standardFont);
            },
            sanitize: sanitizeWinAnsiText,
          }
        );
        droppedCharacters += dropped;
        if (!text) continue;
        const size = run.drawSize;
        const naturalWidth = font.widthOfTextAtSize(text, size) * run.xScale;
        const squeeze = fitWidth && run.advance > 0 && naturalWidth > run.advance ? run.advance / naturalWidth : 1;
        const horizontal = run.xScale * squeeze;
        // Scale horizontally around the run origin so the baseline start and
        // the glyph height both stay exactly where the original text was.
        page.pushOperators(
          pushGraphicsState(),
          concatTransformationMatrix(horizontal, 0, 0, 1, run.origin[0] * (1 - horizontal), 0)
        );
        page.drawText(text, { x: run.origin[0], y: run.origin[1], size, font, color: run.fill });
        page.pushOperators(popGraphicsState());
      }
    }

    if (onProgress) onProgress(((f + 1) / files.length) * 95);
    const fallbackBase = sanitizePdfBaseName(file.name) || `dokumen-${f + 1}`;
    const name = customBase
      ? (files.length > 1 ? `${customBase}-${f + 1}.pdf` : `${customBase}.pdf`)
      : `${fallbackBase}-teks-diedit.pdf`;
    const saved = await doc.save();
    const blob = new Blob([saved], { type: "application/pdf" });
    // `fileId` lets a caller feed this output straight into another pass (the
    // editor applies text changes and annotation objects in one run).
    outputs.push({ name: dedupe(name), blob, size: blob.size, pages: pages.length, fileId: file.id, bytes: saved });
  }

  if (onProgress) onProgress(100);
  return { outputs, sameFont, redrawn, skipped, droppedCharacters };
}
