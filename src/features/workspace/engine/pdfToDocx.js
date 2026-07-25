import { PdfEngine } from "./pdfEngine.js";
import { createTesseractOcrEngine } from "./ocrEngine.js";
import { extractPageImages } from "./pdfPageImages.js";
import {
  alignmentOf,
  buildBlocks,
  buildLines,
  contentBox,
  detectColumns,
  itemFontSize,
  lineParts,
  splitCells,
} from "./pdfLayout.js";

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const TWIPS_PER_PT = 20;
const EMU_PER_PT = 12700;
const PX_PER_PT = 96 / 72;
const MIN_MARGIN_PT = 14;
const MAX_MARGIN_PT = 108;
let docxApi;

async function loadDocx() {
  if (!docxApi) docxApi = await import("docx");
  return docxApi;
}

function isEncrypted(bytes) {
  if (!bytes) return false;
  const tail = bytes.slice(Math.max(0, bytes.length - 256 * 1024));
  return /\/Encrypt\b/.test(new TextDecoder("latin1").decode(tail));
}

function usableText(items) {
  return items
    .map((item) => String(item?.str || ""))
    .join("")
    .replace(/\s+/g, "").length;
}

const twips = (pt) => Math.round(pt * TWIPS_PER_PT);
const emu = (pt) => Math.round(pt * EMU_PER_PT);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function fontFamily(style = {}) {
  const family = String(style.fontFamily || "").toLowerCase();
  if (family.includes("times") || family.includes("serif") && !family.includes("sans")) return "Times New Roman";
  if (family.includes("courier") || family.includes("mono")) return "Courier New";
  if (family.includes("georgia")) return "Georgia";
  if (family.includes("calibri")) return "Calibri";
  if (family.includes("helvetica") || family.includes("arial") || family.includes("sans")) return "Arial";
  return "Arial";
}

function fontDescriptor(item, styles) {
  const style = styles?.[item?.fontName] || {};
  const signature = `${item?.fontName || ""} ${style.fontFamily || ""}`;
  return {
    font: fontFamily(style),
    bold: /bold|black|heavy|semibold|demi/i.test(signature) || Number(style.fontWeight) >= 600,
    italics: /italic|oblique/i.test(signature) || style.italic === true,
  };
}

function runFor(item, styles, text) {
  const descriptor = fontDescriptor(item, styles);
  return new docxApi.TextRun({
    text,
    font: descriptor.font,
    size: Math.round(itemFontSize(item) * 2),
    bold: descriptor.bold,
    italics: descriptor.italics,
  });
}

// Rebuild the readable text of a block, reflowing wrapped lines and undoing
// end-of-line hyphenation the way the source document reads.
function blockRuns(block, styles) {
  const parts = [];
  block.lines.forEach((line, lineIndex) => {
    const previous = parts.at(-1);
    if (lineIndex > 0 && previous) {
      if (/[‐-―-]$/.test(previous.text) && /^[a-zà-ÿ]/.test(line.text)) {
        previous.text = previous.text.replace(/[‐-―-]$/, "");
      } else if (!/\s$/.test(previous.text)) {
        previous.text = `${previous.text} `;
      }
    }
    parts.push(...lineParts(line.items));
  });
  const runs = parts
    .filter((part) => part.text.length)
    .map((part) => runFor(part.item, styles, part.text));
  return runs.length ? runs : [new docxApi.TextRun({ text: "" })];
}

function cellRuns(items, styles) {
  const runs = lineParts(items)
    .filter((part) => part.text.length)
    .map((part) => runFor(part.item, styles, part.text));
  return runs.length ? runs : [new docxApi.TextRun({ text: "" })];
}

// Single lines with wide internal gaps (signature blocks, "Nama : X" rows)
// keep their horizontal positions through real tab stops.
function tabbedParagraph(block, styles, box, spacing, alignment) {
  const cells = splitCells(block.lines[0]);
  const children = [];
  const tabStops = [];
  cells.forEach((cell, index) => {
    if (index > 0) {
      children.push(new docxApi.TextRun({ children: [new docxApi.Tab()] }));
      tabStops.push({
        type: docxApi.TabStopType.LEFT,
        position: twips(clamp(cell.left - box.left, 0, box.width)),
      });
    }
    children.push(...cellRuns(cell.items, styles));
  });
  return new docxApi.Paragraph({
    alignment,
    tabStops,
    spacing,
    indent: { left: twips(clamp(block.left - box.left, 0, box.width)) },
    children,
  });
}

function blockParagraph(block, styles, box, bodySize, spacingBefore, leading) {
  const alignmentKey = alignmentOf(block, box);
  const alignment = {
    center: docxApi.AlignmentType.CENTER,
    right: docxApi.AlignmentType.RIGHT,
    justify: docxApi.AlignmentType.JUSTIFIED,
    left: docxApi.AlignmentType.LEFT,
  }[alignmentKey];
  const blockLeading = block.lines.length > 1
    ? (block.lines[0].baseline - block.lines.at(-1).baseline) / (block.lines.length - 1)
    : leading;
  const spacing = {
    before: clamp(twips(spacingBefore), 0, twips(48)),
    after: 0,
    line: twips(clamp(blockLeading, block.maxFontSize, block.maxFontSize * 2.4)),
    lineRule: docxApi.LineRuleType.AT_LEAST,
  };

  if (block.lines.length === 1 && !block.marker && splitCells(block.lines[0]).length > 1) {
    return tabbedParagraph(block, styles, box, spacing, docxApi.AlignmentType.LEFT);
  }

  const indentLeft = alignmentKey === "left" || alignmentKey === "justify"
    ? twips(clamp(block.left - box.left, 0, box.width * 0.8))
    : 0;
  const indent = { left: indentLeft };
  if (block.marker) {
    const hanging = twips(clamp(block.marker.length * block.fontSize * 0.55, 8, 48));
    indent.left = indentLeft + hanging;
    indent.hanging = hanging;
  }

  const isHeading = block.lines.length === 1
    && block.maxFontSize >= bodySize * 1.18
    && block.lines[0].text.trim().length <= 140;

  return new docxApi.Paragraph({
    alignment,
    spacing,
    indent,
    outlineLevel: isHeading ? (block.maxFontSize >= bodySize * 1.5 ? 0 : 1) : undefined,
    children: blockRuns(block, styles),
  });
}

function blockTable(block, styles, box) {
  const anchors = block.columns;
  const widths = anchors.map((anchor, index) => {
    const next = index + 1 < anchors.length ? anchors[index + 1] : box.right;
    return twips(Math.max(24, next - anchor));
  });
  const noBorder = { style: docxApi.BorderStyle.NONE, size: 0, color: "auto" };
  const cellBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
  const tableBorders = { ...cellBorders, insideHorizontal: noBorder, insideVertical: noBorder };

  const rows = block.rows.map((row) => {
    const cells = [];
    for (let column = 0; column < anchors.length; column++) {
      const entry = row.cells.find((candidate) => candidate.column === column);
      cells.push(new docxApi.TableCell({
        width: { size: widths[column], type: docxApi.WidthType.DXA },
        borders: cellBorders,
        margins: { top: 0, bottom: 0, left: 0, right: twips(4) },
        children: [
          new docxApi.Paragraph({
            spacing: { before: 0, after: 0 },
            children: entry ? cellRuns(entry.cell.items, styles) : [new docxApi.TextRun({ text: "" })],
          }),
        ],
      }));
    }
    return new docxApi.TableRow({ children: cells });
  });

  return new docxApi.Table({
    width: { size: twips(box.width), type: docxApi.WidthType.DXA },
    columnWidths: widths,
    borders: tableBorders,
    rows,
  });
}

function floatingImageParagraph(images) {
  return new docxApi.Paragraph({
    spacing: { before: 0, after: 0, line: 1, lineRule: docxApi.LineRuleType.EXACT },
    children: images.map((image) => new docxApi.ImageRun({
      data: image.data,
      type: "png",
      transformation: {
        width: Math.max(1, Math.round(image.width * PX_PER_PT)),
        height: Math.max(1, Math.round(image.height * PX_PER_PT)),
      },
      floating: {
        horizontalPosition: {
          relative: docxApi.HorizontalPositionRelativeFrom.PAGE,
          offset: emu(image.left),
        },
        verticalPosition: {
          relative: docxApi.VerticalPositionRelativeFrom.PAGE,
          offset: emu(image.top),
        },
        behindDocument: true,
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
        wrap: { type: docxApi.TextWrappingType.NONE },
      },
    })),
  });
}

function pageProperties(page, box, columns) {
  const margin = {
    top: twips(clamp(page.height - box.top, MIN_MARGIN_PT, MAX_MARGIN_PT)),
    right: twips(clamp(page.width - box.right, MIN_MARGIN_PT, MAX_MARGIN_PT)),
    bottom: twips(clamp(box.bottom, MIN_MARGIN_PT, MAX_MARGIN_PT)),
    left: twips(clamp(box.left, MIN_MARGIN_PT, MAX_MARGIN_PT)),
  };
  return {
    page: {
      size: { width: twips(page.width), height: twips(page.height) },
      margin,
    },
    ...(columns ? {
      column: { count: columns.count, space: twips(columns.space), equalWidth: true },
    } : {}),
  };
}

function fallbackSection(page) {
  return {
    properties: {
      page: {
        size: { width: twips(page.width), height: twips(page.height) },
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
      },
    },
    children: [
      new docxApi.Paragraph({
        spacing: { before: 0, after: 0 },
        children: [
          new docxApi.ImageRun({
            data: page.fallbackImage.data,
            transformation: {
              width: page.fallbackImage.width,
              height: page.fallbackImage.height,
            },
            type: "png",
          }),
        ],
      }),
    ],
  };
}

function orderedLines(lines, columns) {
  if (!columns) return lines;
  return columns.bands.flatMap((band) => band.lines);
}

function pageSection(page) {
  if (page.fallbackImage) return fallbackSection(page);

  const lines = buildLines(page.items);
  const box = contentBox(lines, page.width, page.height);
  const columns = page.source === "native" ? detectColumns(lines, page.width) : null;
  const sizes = lines.flatMap((line) => line.items.map(itemFontSize)).sort((a, b) => a - b);
  const bodySize = sizes[Math.floor(sizes.length / 2)] || 11;
  const { blocks, leading } = buildBlocks(orderedLines(lines, columns), box, bodySize);

  const children = [];
  if (page.images?.length) children.push(floatingImageParagraph(page.images));

  let previousBottom = null;
  for (const block of blocks) {
    const top = block.type === "table" ? block.top : block.lines[0].baseline;
    const gap = previousBottom === null ? 0 : previousBottom - top - leading;
    if (block.type === "table") {
      children.push(blockTable(block, page.styles, box));
      children.push(new docxApi.Paragraph({ spacing: { before: 0, after: 0, line: 1, lineRule: docxApi.LineRuleType.EXACT }, children: [] }));
      previousBottom = block.rows.at(-1).line.baseline;
    } else {
      children.push(blockParagraph(block, page.styles, box, bodySize, Math.max(0, gap), leading));
      previousBottom = block.bottom;
    }
  }

  return { properties: pageProperties(page, box, columns), children };
}

async function extractNativePage(record, pageNumber, opts) {
  const page = await record.doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1 });
  const content = await page.getTextContent();
  const items = (content.items || []).filter((item) => typeof item?.str === "string" && item.str.length);
  let images = [];
  if (opts?.embedImages !== false) {
    try {
      images = await extractPageImages(page, viewport.width, viewport.height);
    } catch {
      images = [];
    }
  }
  return {
    pageNumber,
    width: viewport.width,
    height: viewport.height,
    items,
    images,
    styles: content.styles || {},
    usableChars: usableText(items),
  };
}

// Tesseract reports a tight glyph box, not an em box. Estimate the real font
// size from which zones the word's characters occupy.
function emFactor(text) {
  const value = String(text || "");
  const ascender = /[A-Z0-9bdfhkltß|(){}[\]/\\]/.test(value);
  const descender = /[gjpqy,;µ]/.test(value);
  if (ascender && descender) return 1;
  if (ascender) return 0.74;
  if (descender) return 0.7;
  return 0.48;
}

function ocrWordsToItems(result, page) {
  const imageWidth = Number(result?.image?.width) || page.width;
  const imageHeight = Number(result?.image?.height) || page.height;
  const words = (result?.words || [])
    .filter((word) => word?.text && word?.bbox)
    .sort((a, b) => {
      const ay = Number(a.bbox.y0 ?? a.bbox.top ?? 0);
      const by = Number(b.bbox.y0 ?? b.bbox.top ?? 0);
      return Math.abs(ay - by) > 8
        ? ay - by
        : Number(a.bbox.x0 ?? a.bbox.left ?? 0) - Number(b.bbox.x0 ?? b.bbox.left ?? 0);
    });
  const scaleX = page.width / imageWidth;
  const scaleY = page.height / imageHeight;
  const lines = [];
  for (const word of words) {
    const top = Number(word.bbox.y0 ?? word.bbox.top ?? 0);
    const bottom = Number(word.bbox.y1 ?? ((word.bbox.top || 0) + (word.bbox.height || 0)));
    const height = Math.max(1, bottom - top);
    const current = lines.at(-1);
    if (!current || Math.abs(current.top - top) > height * 0.6) {
      lines.push({ top, words: [word] });
    } else {
      current.words.push(word);
    }
  }
  // Keep OCR words as individual items so gaps, tabs and table columns are
  // reconstructed from geometry exactly like a digital page.
  return lines.flatMap((line) => {
    const ordered = [...line.words].sort((a, b) => (
      Number(a.bbox.x0 ?? a.bbox.left ?? 0) - Number(b.bbox.x0 ?? b.bbox.left ?? 0)
    ));
    const y1 = Math.max(...ordered.map((word) => Number(word.bbox.y1 ?? ((word.bbox.top || 0) + (word.bbox.height || 0)))));
    const ems = ordered.map((word) => {
      const top = Number(word.bbox.y0 ?? word.bbox.top ?? 0);
      const bottom = Number(word.bbox.y1 ?? ((word.bbox.top || 0) + (word.bbox.height || 0)));
      return ((bottom - top) * scaleY) / emFactor(word.text);
    }).sort((a, b) => a - b);
    const height = Math.max(6, ems[Math.floor(ems.length / 2)] || 11);
    const hasDescender = ordered.some((word) => /[gjpqy,;µ]/.test(String(word.text || "")));
    const baseline = page.height - y1 * scaleY + (hasDescender ? height * 0.21 : 0);
    return ordered.map((word, index) => {
      const x0 = Number(word.bbox.x0 ?? word.bbox.left ?? 0) * scaleX;
      const x1 = Number(word.bbox.x1 ?? ((word.bbox.left || 0) + (word.bbox.width || 0))) * scaleX;
      return {
        str: index === 0 ? String(word.text).trim() : ` ${String(word.text).trim()}`,
        dir: "ltr",
        transform: [height, 0, 0, height, x0, baseline],
        width: Math.max(1, x1 - x0),
        height,
        fontName: "ocr",
        hasEOL: index === ordered.length - 1,
      };
    });
  });
}

async function canvasToPng(canvas) {
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((value) => value ? resolve(value) : reject(new Error("DOCX_PAGE_RENDER_FAILED")), "image/png");
  });
  return new Uint8Array(await blob.arrayBuffer());
}

async function defaultRenderPageImage(fileId, pageNumber, width, height) {
  const canvas = await PdfEngine.renderPage(fileId, pageNumber, width, 0);
  if (!canvas) throw new Error("DOCX_PAGE_RENDER_FAILED");
  return {
    data: await canvasToPng(canvas),
    width,
    height,
  };
}

export async function convertPdfToDocx(files, opts = {}, onProgress) {
  const record = PdfEngine.files.get(files[0]?.id);
  if (!record?.doc) throw new Error("PDF_SOURCE_MISSING");
  if (isEncrypted(record.bytes)) throw new Error("PDF_ALREADY_ENCRYPTED");
  if (opts.signal?.aborted) throw new Error("DOCX_CANCELLED");

  const pages = [];
  let ocrEngine = opts.ocrEngine || null;
  let ownsOcrEngine = false;
  try {
    for (let pageNumber = 1; pageNumber <= record.pageCount; pageNumber++) {
      if (opts.signal?.aborted) throw new Error("DOCX_CANCELLED");
      onProgress?.(((pageNumber - 1) / record.pageCount) * 70, {
        phase: "extract",
        page: pageNumber,
        total: record.pageCount,
      });
      const page = await extractNativePage(record, pageNumber, opts);
      const needsOcr = opts.ocrMode === "all" || (opts.ocrMode !== "off" && page.usableChars < 12);
      if (needsOcr) {
        try {
          if (!ocrEngine) {
            ocrEngine = await createTesseractOcrEngine({
              language: opts.language || "ind+eng",
              quality: opts.quality || "accurate",
              onStatus: (status) => {
                onProgress?.(((pageNumber - 1) / record.pageCount) * 70, {
                  phase: "ocr",
                  page: pageNumber,
                  total: record.pageCount,
                  status,
                });
              },
            });
            ownsOcrEngine = true;
          }
          onProgress?.(((pageNumber - 1) / record.pageCount) * 70, {
            phase: "ocr",
            page: pageNumber,
            total: record.pageCount,
          });
          const result = await ocrEngine.recognizePage(record.id, pageNumber, {
            rotation: 0,
          });
          if (opts.signal?.aborted) throw new Error("DOCX_CANCELLED");
          page.items = ocrWordsToItems(result, page);
          page.styles = { ocr: { fontFamily: "Arial" } };
          page.source = "ocr";
          page.usableChars = usableText(page.items);
          const confidences = (result?.words || [])
            .map((word) => Number(word.confidence))
            .filter(Number.isFinite);
          page.confidence = confidences.length
            ? confidences.reduce((sum, confidence) => sum + confidence, 0) / confidences.length
            : null;
        } catch (error) {
          if (opts.signal?.aborted || error?.message === "DOCX_CANCELLED" || error?.message === "OCR_CANCELLED") {
            throw error;
          }
          page.ocrError = error?.message || "OCR_PAGE_FAILED";
        }
      } else {
        page.source = "native";
      }
      if (!page.items.length) {
        const renderPageImage = opts.renderPageImage || defaultRenderPageImage;
        page.fallbackImage = await renderPageImage(record.id, pageNumber, page.width, page.height);
        page.source = "fallback";
      }
      pages.push(page);
    }
  } finally {
    if (ocrEngine && (ownsOcrEngine || opts.ocrEngine)) await ocrEngine.terminate?.();
  }

  const { Document, Packer } = await loadDocx();
  const document = new Document({
    sections: pages.map(pageSection),
    styles: {
      default: {
        document: {
          run: { font: "Arial", size: 22 },
          paragraph: { spacing: { before: 0, after: 0, line: 240, lineRule: docxApi.LineRuleType.AUTO } },
        },
      },
    },
  });
  onProgress?.(90, { phase: "pack", total: record.pageCount });
  const packed = await Packer.toBlob(document);
  const blob = new Blob([packed], { type: DOCX_MIME });
  onProgress?.(100, { phase: "done", total: record.pageCount });

  return {
    outputs: [{
      name: opts.outputName || record.name.replace(/\.pdf$/i, ".docx"),
      blob,
      size: blob.size,
      pages: record.pageCount,
    }],
    conversion: {
      nativePages: pages.filter((page) => page.source === "native").map((page) => page.pageNumber),
      ocrPages: pages.filter((page) => page.source === "ocr").map((page) => page.pageNumber),
      lowConfidencePages: pages.filter((page) => page.source === "ocr" && page.confidence !== null && page.confidence < 62).map((page) => page.pageNumber),
      fallbackPages: pages.filter((page) => page.source === "fallback").map((page) => page.pageNumber),
      imagePages: pages.filter((page) => page.images?.length).map((page) => page.pageNumber),
      fallbackRegions: [],
    },
  };
}
