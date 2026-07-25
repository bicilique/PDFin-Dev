import { PdfEngine } from "./pdfEngine.js";
import { createTesseractOcrEngine } from "./ocrEngine.js";
import { extractPageImages } from "./pdfPageImages.js";
import { colorLookup, extractPageGraphics, resolveFontNames } from "./pdfVector.js";
import { solidPng } from "./solidPng.js";
import {
  alignmentOf,
  buildBlocks,
  buildLines,
  contentBox,
  detectColumns,
  itemBaseline,
  itemFontSize,
  itemLeft,
  itemRight,
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

// The real font name (from the embedded font) beats the generic family that
// `getTextContent()` reports — headless-Chrome PDFs label every face
// "sans-serif", which would otherwise flatten bold and italic text.
function fontFamily(style = {}, psName = "") {
  const family = `${String(psName)} ${String(style.fontFamily || "")}`.toLowerCase();
  if (family.includes("times") || family.includes("serif") && !family.includes("sans")) return "Times New Roman";
  if (family.includes("courier") || family.includes("mono")) return "Courier New";
  if (family.includes("georgia")) return "Georgia";
  if (family.includes("calibri")) return "Calibri";
  if (family.includes("helvetica") || family.includes("arial") || family.includes("sans")) return "Arial";
  return "Arial";
}

function fontDescriptor(item, theme) {
  const style = theme?.styles?.[item?.fontName] || {};
  const psName = String(style.psName || "");
  const signature = `${psName} ${item?.fontName || ""} ${style.fontFamily || ""}`;
  return {
    font: fontFamily(style, psName),
    bold: /bold|black|heavy|semibold|demi/i.test(signature) || Number(style.fontWeight) >= 600,
    italics: /italic|oblique/i.test(signature) || style.italic === true,
  };
}

function runFor(item, theme, text) {
  const descriptor = fontDescriptor(item, theme);
  const color = theme?.colorAt?.(itemLeft(item), itemBaseline(item));
  // A fill that hugs the text (badge, pill, highlighted cell) rides along as run
  // shading instead of a floating shape, so it can never drift off the words.
  const shade = theme?.shading?.get(item);
  return new docxApi.TextRun({
    text,
    font: descriptor.font,
    size: Math.round(itemFontSize(item) * 2),
    bold: descriptor.bold,
    italics: descriptor.italics,
    ...(color && color !== "000000" ? { color } : {}),
    ...(shade ? { shading: { type: docxApi.ShadingType.CLEAR, color: "auto", fill: shade } } : {}),
  });
}

// Rebuild the readable text of a block, reflowing wrapped lines and undoing
// end-of-line hyphenation the way the source document reads.
function blockRuns(block, theme) {
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
    .map((part) => runFor(part.item, theme, part.text));
  return runs.length ? runs : [new docxApi.TextRun({ text: "" })];
}

function cellRuns(items, theme) {
  const runs = lineParts(items)
    .filter((part) => part.text.length)
    .map((part) => runFor(part.item, theme, part.text));
  return runs.length ? runs : [new docxApi.TextRun({ text: "" })];
}

// Single lines with wide internal gaps (signature blocks, "Nama : X" rows)
// keep their horizontal positions through real tab stops.
function tabbedParagraph(block, theme, box, spacing, alignment) {
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
    children.push(...cellRuns(cell.items, theme));
  });
  return new docxApi.Paragraph({
    alignment,
    tabStops,
    spacing,
    indent: { left: twips(clamp(block.left - box.left, 0, box.width)) },
    children,
  });
}

function blockParagraph(block, theme, box, bodySize, spacingBefore, leading) {
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
    // Keep the real vertical gap: page-anchored graphics sit at their PDF
    // coordinates, so squeezing the text flow would slide it off its backdrop.
    before: clamp(twips(spacingBefore), 0, twips(400)),
    after: 0,
    line: twips(clamp(blockLeading, block.maxFontSize, block.maxFontSize * 2.4)),
    lineRule: docxApi.LineRuleType.AT_LEAST,
  };

  if (block.lines.length === 1 && !block.marker && splitCells(block.lines[0]).length > 1) {
    return tabbedParagraph(block, theme, box, spacing, docxApi.AlignmentType.LEFT);
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
    children: blockRuns(block, theme),
  });
}

function blockTable(block, theme, box) {
  const anchors = block.columns;
  const widths = anchors.map((anchor, index) => {
    const next = index + 1 < anchors.length ? anchors[index + 1] : box.right;
    return twips(Math.max(24, next - anchor));
  });
  const noBorder = { style: docxApi.BorderStyle.NONE, size: 0, color: "auto" };
  const cellBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
  const tableBorders = { ...cellBorders, insideHorizontal: noBorder, insideVertical: noBorder };

  const rows = block.rows.map((row, index) => {
    // Rows keep the height the PDF gave them so the flowing text stays on top
    // of the page-anchored shading instead of drifting up the page. The band
    // measured is the one *above* the row's baseline, and the cell text is
    // bottom-aligned inside it, which puts the baseline back where it was.
    const previous = block.rows[index - 1];
    const height = previous
      ? Math.max(row.line.fontSize, previous.line.baseline - row.line.baseline)
      : row.line.fontSize * 1.3;
    const cells = [];
    for (let column = 0; column < anchors.length; column++) {
      const entry = row.cells.find((candidate) => candidate.column === column);
      cells.push(new docxApi.TableCell({
        width: { size: widths[column], type: docxApi.WidthType.DXA },
        borders: cellBorders,
        verticalAlign: docxApi.VerticalAlign.BOTTOM,
        margins: { top: 0, bottom: 0, left: 0, right: twips(4) },
        children: [
          new docxApi.Paragraph({
            spacing: { before: 0, after: 0 },
            children: entry ? cellRuns(entry.cell.items, theme) : [new docxApi.TextRun({ text: "" })],
          }),
        ],
      }));
    }
    return new docxApi.TableRow({
      height: { value: twips(height), rule: docxApi.HeightRule.ATLEAST },
      children: cells,
    });
  });

  return new docxApi.Table({
    width: { size: twips(box.width), type: docxApi.WidthType.DXA },
    columnWidths: widths,
    borders: tableBorders,
    rows,
  });
}

// Every drawing needs its own `wp:docPr` id: docx@9 restarts its generator per
// drawing, so without this all anchors claim id 1 and Word/LibreOffice keeps
// only the first one on the page.
let drawingId = 0;

function drawingProperties() {
  drawingId += 1;
  return { name: `drawing-${drawingId}`, id: String(drawingId) };
}

function floatingImageParagraph(images) {
  return new docxApi.Paragraph({
    spacing: { before: 0, after: 0, line: 1, lineRule: docxApi.LineRuleType.EXACT },
    children: images.map((image) => new docxApi.ImageRun({
      data: image.data,
      type: "png",
      altText: drawingProperties(),
      transformation: {
        width: Math.max(1, Math.round(image.width * PX_PER_PT)),
        height: Math.max(1, Math.round(image.height * PX_PER_PT)),
      },
      floating: {
        // Without an explicit z-order docx derives one from the image height,
        // which would hide every small fill under the page-sized ones.
        zIndex: drawingId,
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
            altText: drawingProperties(),
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

/**
 * Recover table column boundaries from the fills the PDF painted: a header
 * ruling is a row of same-height rectangles sitting side by side. Text tables
 * with tight columns defeat the gap heuristic, but this ruling is exact.
 * @returns {(baseline: number) => number[] | null}
 */
function gridLookup(page) {
  const bands = new Map();
  for (const shape of page.shapes || []) {
    const key = `${Math.round(shape.top)}:${Math.round(shape.height)}`;
    const band = bands.get(key) || [];
    band.push(shape);
    bands.set(key, band);
  }

  const grids = [];
  for (const band of bands.values()) {
    if (band.length < 3) continue;
    const ordered = [...band].sort((a, b) => a.left - b.left);
    const edges = [ordered[0].left];
    let adjacent = true;
    for (const shape of ordered) {
      if (Math.abs(shape.left - edges.at(-1)) > 3) {
        adjacent = false;
        break;
      }
      edges.push(shape.left + shape.width);
    }
    const span = edges.at(-1) - edges[0];
    if (!adjacent || span < page.width * 0.4) continue;
    const headerTop = ordered[0].top;
    const top = page.height - headerTop;
    // The banded row fills below the header mark where the table ends; without
    // them the grid would keep slicing the body text that follows.
    const body = (page.shapes || [])
      .filter((shape) => (
        shape.top >= headerTop
        && Math.abs(shape.left - edges[0]) <= 3
        && Math.abs(shape.width - span) <= 6
      ))
      .sort((a, b) => a.top - b.top);
    const headerHeight = ordered[0].height;
    let deepest = headerTop + headerHeight;
    for (const shape of body) {
      // Rows must stay contiguous with the header; a band further down the page
      // belongs to something else and would stretch the grid over body text.
      if (shape.top - deepest > headerHeight * 2.5) break;
      deepest = Math.max(deepest, shape.top + shape.height);
    }
    // Every painted row of the same table reports the same edges; merge them so
    // the table is one continuous region instead of a stack of striped gaps.
    const key = edges.map((edge) => Math.round(edge)).join(",");
    const merged = grids.find((grid) => grid.key === key);
    if (merged) {
      merged.top = Math.max(merged.top, top);
      merged.bottom = Math.min(merged.bottom, page.height - deepest);
    } else {
      grids.push({ key, top, bottom: page.height - deepest, edges });
    }
  }

  if (!grids.length) return () => null;
  return (baseline) => grids.find((grid) => baseline <= grid.top && baseline >= grid.bottom)?.edges || null;
}

/**
 * Split the page's vector fills into text highlights and page backdrop.
 * A fill that closely wraps a run of text (a status pill, a shaded label) is
 * better expressed as run shading, which stays glued to the words when the
 * text reflows; everything larger stays a page-anchored drawing.
 */
function splitShading(page, lines) {
  const shading = new Map();
  const backdrop = [];
  for (const shape of page.shapes || []) {
    const bottom = page.height - (shape.top + shape.height);
    const top = page.height - shape.top;
    const covered = [];
    for (const line of lines) {
      if (line.baseline < bottom - 1 || line.baseline > top + 1) continue;
      for (const item of line.items) {
        if (itemLeft(item) >= shape.left - 1 && itemRight(item) <= shape.left + shape.width + 1) {
          covered.push(item);
        }
      }
    }
    const maxSize = covered.length ? Math.max(...covered.map(itemFontSize)) : 0;
    const span = covered.length
      ? Math.max(...covered.map(itemRight)) - Math.min(...covered.map(itemLeft))
      : 0;
    if (covered.length && shape.height <= maxSize * 2.5 && shape.width <= span * 1.8 + maxSize * 2) {
      for (const item of covered) shading.set(item, shape.color);
    } else {
      backdrop.push(shape);
    }
  }
  return { shading, backdrop };
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
  const { blocks, leading } = buildBlocks(orderedLines(lines, columns), box, bodySize, gridLookup(page));

  const { shading, backdrop: shapes } = splitShading(page, lines);
  const theme = { ...page.theme, shading };

  // Vector fills first, then raster art: later drawings sit on top, and both
  // stay behind the text the way the PDF paints them.
  const backdrop = [
    ...shapes.map((shape) => ({ ...shape, data: solidPng(shape.color) })),
    ...(page.images || []),
  ];

  const children = [];
  if (backdrop.length) children.push(floatingImageParagraph(backdrop));

  let previousBottom = null;
  for (const block of blocks) {
    const top = block.type === "table" ? block.top : block.lines[0].baseline;
    const gap = previousBottom === null ? 0 : previousBottom - top - leading;
    if (block.type === "table") {
      // A table cannot carry "space before", so the gap the PDF left above it
      // becomes a spacer paragraph. The first row already contributes a band of
      // its own above the first baseline, so that band comes out of the spacer.
      const spacer = gap - block.rows[0].line.fontSize * 1.3;
      if (spacer > 1) {
        children.push(new docxApi.Paragraph({
          spacing: { before: 0, after: 0, line: twips(spacer), lineRule: docxApi.LineRuleType.EXACT },
          children: [],
        }));
      }
      children.push(blockTable(block, theme, box));
      children.push(new docxApi.Paragraph({ spacing: { before: 0, after: 0, line: 1, lineRule: docxApi.LineRuleType.EXACT }, children: [] }));
      previousBottom = block.rows.at(-1).line.baseline;
    } else {
      children.push(blockParagraph(block, theme, box, bodySize, Math.max(0, gap), leading));
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
  const wantsVisuals = opts?.embedImages !== false;
  let images = [];
  let graphics = { shapes: [], textColors: [] };
  if (wantsVisuals) {
    try {
      graphics = await extractPageGraphics(page, viewport.width, viewport.height, opts);
    } catch {
      graphics = { shapes: [], textColors: [] };
    }
    try {
      images = await extractPageImages(page, viewport.width, viewport.height);
    } catch {
      images = [];
    }
  }

  const styles = { ...(content.styles || {}) };
  const psNames = resolveFontNames(page, styles);
  for (const [key, psName] of Object.entries(psNames)) {
    styles[key] = { ...styles[key], psName };
  }

  return {
    pageNumber,
    width: viewport.width,
    height: viewport.height,
    items,
    images,
    shapes: graphics.shapes,
    styles,
    theme: { styles, colorAt: colorLookup(graphics.textColors) },
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

  drawingId = 0;
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
          page.theme = { styles: page.styles, colorAt: null };
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
      shapePages: pages.filter((page) => page.shapes?.length).map((page) => page.pageNumber),
      fallbackRegions: [],
    },
  };
}
