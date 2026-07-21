import { PdfEngine } from "./pdfEngine.js";
import { createTesseractOcrEngine } from "./ocrEngine.js";

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const DEFAULT_MARGIN_PT = 72;
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

function fontFamily(style = {}) {
  const family = String(style.fontFamily || "").toLowerCase();
  if (family.includes("times")) return "Times New Roman";
  if (family.includes("courier") || family.includes("mono")) return "Courier New";
  if (family.includes("helvetica") || family.includes("arial")) return "Arial";
  return "Arial";
}

function itemFontSize(item) {
  const transformSize = Math.hypot(Number(item?.transform?.[0]) || 0, Number(item?.transform?.[1]) || 0);
  return Math.max(6, Number(item?.height) || transformSize || 11);
}

function groupTextLines(items) {
  const lines = [];
  let current = [];

  for (const item of items) {
    const text = String(item?.str || "");
    if (!text) continue;
    current.push(item);
    if (item.hasEOL) {
      lines.push(current);
      current = [];
    }
  }
  if (current.length) lines.push(current);
  return lines;
}

function alignmentForLine(line, pageWidth) {
  const left = Math.min(...line.map((item) => Number(item.transform?.[4]) || 0));
  const right = Math.max(...line.map((item) => (Number(item.transform?.[4]) || 0) + (Number(item.width) || 0)));
  const center = (left + right) / 2;
  if (Math.abs(center - pageWidth / 2) <= pageWidth * 0.05 && left > pageWidth * 0.12) {
    return docxApi.AlignmentType.CENTER;
  }
  return docxApi.AlignmentType.LEFT;
}

function lineToParagraph(line, styles, pageWidth, bodySize) {
  const largestSize = Math.max(...line.map(itemFontSize));
  const textLength = line.reduce((total, item) => total + String(item.str || "").length, 0);
  const heading = largestSize >= bodySize * 1.2 && textLength <= 120;
  return new docxApi.Paragraph({
    heading: heading ? docxApi.HeadingLevel.HEADING_1 : undefined,
    alignment: alignmentForLine(line, pageWidth),
    spacing: {
      after: Math.round(Math.max(4, largestSize * 0.35) * 20),
      line: Math.round(largestSize * 1.22 * 20),
    },
    children: line.map((item) => {
      const size = itemFontSize(item);
      const style = styles[item.fontName] || {};
      return new docxApi.TextRun({
        text: String(item.str || ""),
        font: fontFamily(style),
        size: Math.round(size * 2),
        bold: /bold|black|heavy/i.test(`${item.fontName || ""} ${style.fontFamily || ""}`),
        italics: /italic|oblique/i.test(`${item.fontName || ""} ${style.fontFamily || ""}`),
      });
    }),
  });
}

function linesFormTable(lines) {
  if (lines.length < 2) return false;
  const columns = lines[0].length;
  if (columns < 2 || lines.some((line) => line.length !== columns)) return false;
  const anchors = lines[0].map((item) => Number(item.transform?.[4]) || 0);
  return lines.every((line) => line.every((item, column) => (
    Math.abs((Number(item.transform?.[4]) || 0) - anchors[column]) <= 4
  )));
}

function linesToTable(lines, styles, pageWidth) {
  return new docxApi.Table({
    width: { size: 100, type: docxApi.WidthType.PERCENTAGE },
    rows: lines.map((line, rowIndex) => new docxApi.TableRow({
      tableHeader: rowIndex === 0,
      children: line.map((item) => {
        const style = styles[item.fontName] || {};
        return new docxApi.TableCell({
          children: [
            new docxApi.Paragraph({
              children: [
                new docxApi.TextRun({
                  text: String(item.str || ""),
                  font: fontFamily(style),
                  size: Math.round(itemFontSize(item) * 2),
                  bold: rowIndex === 0 || /bold|black|heavy/i.test(`${item.fontName || ""} ${style.fontFamily || ""}`),
                }),
              ],
            }),
          ],
        });
      }),
    })),
    columnWidths: lines[0].map((item, index) => {
      const nextX = Number(lines[0][index + 1]?.transform?.[4]);
      const currentX = Number(item.transform?.[4]) || 0;
      const width = Number.isFinite(nextX) ? nextX - currentX : pageWidth - currentX - DEFAULT_MARGIN_PT;
      return Math.round(Math.max(36, width) * 20);
    }),
  });
}

async function extractNativePage(record, pageNumber) {
  const page = await record.doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1 });
  const content = await page.getTextContent();
  const items = (content.items || []).filter((item) => typeof item?.str === "string" && item.str.length);
  return {
    pageNumber,
    width: viewport.width,
    height: viewport.height,
    items,
    styles: content.styles || {},
    usableChars: usableText(items),
  };
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
  const lines = [];
  for (const word of words) {
    const top = Number(word.bbox.y0 ?? word.bbox.top ?? 0);
    const current = lines.at(-1);
    if (!current || Math.abs(current.top - top) > 10) {
      lines.push({ top, words: [word] });
    } else {
      current.words.push(word);
    }
  }
  return lines.map((line) => {
    const first = line.words[0].bbox;
    const last = line.words.at(-1).bbox;
    const x0 = Number(first.x0 ?? first.left ?? 0);
    const y0 = Math.min(...line.words.map((word) => Number(word.bbox.y0 ?? word.bbox.top ?? 0)));
    const x1 = Number(last.x1 ?? ((last.left || 0) + (last.width || 0)));
    const y1 = Math.max(...line.words.map((word) => Number(word.bbox.y1 ?? ((word.bbox.top || 0) + (word.bbox.height || 0)))));
    const height = Math.max(8, ((y1 - y0) / imageHeight) * page.height);
    return {
      str: line.words.map((word) => String(word.text).trim()).filter(Boolean).join(" "),
      dir: "ltr",
      transform: [
        height,
        0,
        0,
        height,
        (x0 / imageWidth) * page.width,
        page.height - (y1 / imageHeight) * page.height,
      ],
      width: Math.max(1, ((x1 - x0) / imageWidth) * page.width),
      height,
      fontName: "ocr",
      hasEOL: true,
    };
  });
}

function pageSection(page) {
  if (page.fallbackImage) {
    return {
      properties: {
        page: {
          size: {
            width: Math.round(page.width * 20),
            height: Math.round(page.height * 20),
          },
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
  const lines = groupTextLines(page.items);
  const sizes = page.items.map(itemFontSize).sort((a, b) => a - b);
  const bodySize = sizes[Math.floor(sizes.length / 2)] || 11;
  const children = linesFormTable(lines)
    ? [linesToTable(lines, page.styles, page.width)]
    : lines.map((line) => lineToParagraph(line, page.styles, page.width, bodySize));
  return {
    properties: {
      page: {
        size: {
          width: Math.round(page.width * 20),
          height: Math.round(page.height * 20),
        },
        margin: {
          top: DEFAULT_MARGIN_PT * 20,
          right: DEFAULT_MARGIN_PT * 20,
          bottom: DEFAULT_MARGIN_PT * 20,
          left: DEFAULT_MARGIN_PT * 20,
        },
      },
    },
    children,
  };
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
      const page = await extractNativePage(record, pageNumber);
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
  const document = new Document({ sections: pages.map(pageSection) });
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
      fallbackRegions: [],
    },
  };
}
