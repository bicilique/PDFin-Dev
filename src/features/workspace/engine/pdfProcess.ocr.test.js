import { afterEach, describe, expect, it, vi } from "vitest";
import { inflateSync } from "node:zlib";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { PdfEngine } from "./pdfEngine.js";
import { PdfProcess } from "./pdfProcess.js";

async function makeTwoPagePdf() {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  doc.addPage([300, 200]);
  const textPage = doc.addPage([300, 200]);
  textPage.drawText("Existing digital text", { x: 24, y: 120, size: 14, font });
  return doc.save();
}

function pdfText(bytes) {
  const raw = new TextDecoder("latin1").decode(bytes);
  const inflated = [];
  const matches = raw.matchAll(/stream\r?\n([\s\S]*?)\r?\nendstream/g);
  for (const match of matches) {
    const start = raw.indexOf(match[1]);
    const end = start + match[1].length;
    try {
      inflated.push(new TextDecoder("latin1").decode(inflateSync(bytes.slice(start, end))));
    } catch {
      inflated.push(match[1]);
    }
  }
  return `${raw}\n${inflated.join("\n")}`;
}

describe("PdfProcess.ocr", () => {
  afterEach(() => {
    PdfEngine.files.clear();
    PdfProcess.clearCache();
    vi.restoreAllMocks();
  });

  it("copies original pages and appends an invisible OCR text layer only to scanned pages by default", async () => {
    const bytes = await makeTwoPagePdf();
    PdfEngine.files.set("ocr-source", {
      id: "ocr-source",
      name: "scan.pdf",
      size: bytes.length,
      bytes,
      pageCount: 2,
      doc: {
        getPage: vi.fn(),
      },
    });

    const progress = [];
    const result = await PdfProcess.ocr([{ id: "ocr-source", name: "scan.pdf" }], {
      outputName: "scan-ocr.pdf",
      pageMode: "scanned",
      language: "ind+eng",
      quality: "balanced",
      engine: {
        analyzePageText: vi.fn(async (fileId, pageNo) => pageNo === 2),
        recognizePage: vi.fn(async (fileId, pageNo) => ({
          page: pageNo,
          image: { width: 1200, height: 800 },
          words: [
            {
              text: "Nomor",
              confidence: 91,
              bbox: { x0: 96, y0: 160, x1: 276, y1: 210 },
            },
            {
              text: "Surat",
              confidence: 88,
              bbox: { x0: 292, y0: 160, x1: 450, y1: 210 },
            },
          ],
        })),
        terminate: vi.fn(async () => {}),
      },
    }, (pct, detail) => progress.push({ pct, detail }));

    const output = result.outputs[0];
    const outBytes = new Uint8Array(await output.blob.arrayBuffer());
    const outDoc = await PDFDocument.load(outBytes);
    const serialized = pdfText(outBytes);

    expect(output.name).toBe("scan-ocr.pdf");
    expect(outDoc.getPageCount()).toBe(2);
    expect(result.ocr.processedPages).toEqual([1]);
    expect(result.ocr.skippedTextPages).toEqual([2]);
    expect(serialized).toContain("3 Tr");
    expect(serialized).toMatch(/<[^>]+> Tj/);
    expect(progress.some((item) => item.detail?.page === 1)).toBe(true);
  });

  it("supports cancellation before OCR recognition mutates the output", async () => {
    const bytes = await makeTwoPagePdf();
    PdfEngine.files.set("cancel-source", {
      id: "cancel-source",
      name: "cancel.pdf",
      size: bytes.length,
      bytes,
      pageCount: 2,
      doc: {
        getPage: vi.fn(),
      },
    });
    const signal = AbortSignal.abort();

    await expect(PdfProcess.ocr([{ id: "cancel-source", name: "cancel.pdf" }], {
      outputName: "cancel-ocr.pdf",
      signal,
      engine: {
        analyzePageText: vi.fn(async () => false),
        recognizePage: vi.fn(),
        terminate: vi.fn(async () => {}),
      },
    })).rejects.toThrow("OCR_CANCELLED");
  });
});
