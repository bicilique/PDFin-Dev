import JSZip from "jszip";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PdfEngine } from "./pdfEngine.js";
import { PdfProcess } from "./pdfProcess.js";

function addPdfRecord({ name = "surat.pdf", pages, bytes = new Uint8Array([37, 80, 68, 70]) }) {
  const id = 9001;
  PdfEngine.files.set(id, {
    id,
    name,
    size: 1024,
    bytes,
    pageCount: pages.length,
    doc: {
      async getPage(pageNumber) {
        return pages[pageNumber - 1];
      },
    },
  });
  return { id, name, size: 1024, pages: pages.length };
}

function digitalPage(items, { width = 595, height = 842 } = {}) {
  return {
    getViewport: () => ({ width, height }),
    getTextContent: vi.fn(async () => ({
      items,
      styles: {
        body: { fontFamily: "Helvetica", ascent: 0.8, descent: -0.2 },
      },
    })),
  };
}

async function readDocumentXml(blob) {
  const zip = await JSZip.loadAsync(await blob.arrayBuffer());
  return zip.file("word/document.xml").async("string");
}

afterEach(() => {
  PdfEngine.files.delete(9001);
});

describe("PdfProcess.pdfToDocx", () => {
  it("converts a digital PDF into an editable DOCX without invoking OCR", async () => {
    const file = addPdfRecord({
      pages: [
        digitalPage([
          {
            str: "SURAT PERNYATAAN",
            dir: "ltr",
            transform: [16, 0, 0, 16, 72, 770],
            width: 170,
            height: 16,
            fontName: "body",
            hasEOL: true,
          },
          {
            str: "Dokumen ini diproses secara lokal.",
            dir: "ltr",
            transform: [11, 0, 0, 11, 72, 730],
            width: 190,
            height: 11,
            fontName: "body",
            hasEOL: true,
          },
        ]),
      ],
    });
    const ocrEngine = {
      recognizePage: vi.fn(),
      terminate: vi.fn(),
    };

    const result = await PdfProcess.pdfToDocx([file], {
      outputName: "surat.docx",
      ocrMode: "auto",
      ocrEngine,
    });

    expect(result.outputs).toHaveLength(1);
    expect(result.outputs[0].name).toBe("surat.docx");
    expect(result.outputs[0].blob.type).toBe(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    expect(result.conversion.nativePages).toEqual([1]);
    expect(result.conversion.ocrPages).toEqual([]);
    expect(ocrEngine.recognizePage).not.toHaveBeenCalled();

    const xml = await readDocumentXml(result.outputs[0].blob);
    expect(xml).toContain("SURAT PERNYATAAN");
    expect(xml).toContain("Dokumen ini diproses secara lokal.");
  });

  it("detects a scanned page and converts OCR words into editable text", async () => {
    const file = addPdfRecord({
      pages: [digitalPage([])],
    });
    const ocrEngine = {
      recognizePage: vi.fn(async () => ({
        text: "Hasil pindai akurat",
        image: { width: 1200, height: 1600 },
        words: [
          { text: "Hasil", confidence: 91, bbox: { x0: 100, y0: 120, x1: 220, y1: 160 } },
          { text: "pindai", confidence: 88, bbox: { x0: 240, y0: 120, x1: 380, y1: 160 } },
          { text: "akurat", confidence: 90, bbox: { x0: 400, y0: 120, x1: 540, y1: 160 } },
        ],
      })),
      terminate: vi.fn(),
    };

    const result = await PdfProcess.pdfToDocx([file], {
      outputName: "scan.docx",
      ocrMode: "auto",
      ocrEngine,
    });

    expect(result.conversion.nativePages).toEqual([]);
    expect(result.conversion.ocrPages).toEqual([1]);
    expect(ocrEngine.recognizePage).toHaveBeenCalledOnce();
    expect(ocrEngine.terminate).toHaveBeenCalledOnce();
    expect(await readDocumentXml(result.outputs[0].blob)).toContain("Hasil pindai akurat");
  });

  it("keeps a scanned page visible as an image when OCR is disabled", async () => {
    const file = addPdfRecord({
      pages: [digitalPage([])],
    });
    const renderPageImage = vi.fn(async () => ({
      data: Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]),
      width: 595,
      height: 842,
    }));

    const result = await PdfProcess.pdfToDocx([file], {
      outputName: "tanpa-ocr.docx",
      ocrMode: "off",
      renderPageImage,
    });

    expect(result.conversion.fallbackPages).toEqual([1]);
    expect(renderPageImage).toHaveBeenCalledWith(9001, 1, 595, 842);
    const zip = await JSZip.loadAsync(await result.outputs[0].blob.arrayBuffer());
    expect(Object.keys(zip.files).some((path) => path.startsWith("word/media/"))).toBe(true);
  });

  it("reconstructs consistently aligned office rows as an editable table", async () => {
    const row = (left, right, y) => [
      { str: left, transform: [11, 0, 0, 11, 72, y], width: 120, height: 11, fontName: "body", hasEOL: false },
      { str: right, transform: [11, 0, 0, 11, 280, y], width: 120, height: 11, fontName: "body", hasEOL: true },
    ];
    const file = addPdfRecord({
      pages: [digitalPage([
        ...row("Nama", "Jabatan", 740),
        ...row("Ayu", "Analis", 716),
        ...row("Budi", "Manajer", 692),
      ])],
    });

    const result = await PdfProcess.pdfToDocx([file], {
      outputName: "tabel.docx",
      ocrMode: "auto",
    });

    const xml = await readDocumentXml(result.outputs[0].blob);
    expect(xml).toContain("<w:tbl>");
    expect(xml).toContain("Ayu");
    expect(xml).toContain("Manajer");
  });

  it("stops after the active OCR page when conversion is cancelled", async () => {
    const file = addPdfRecord({ pages: [digitalPage([])] });
    const controller = new AbortController();
    const ocrEngine = {
      recognizePage: vi.fn(async () => {
        controller.abort();
        return { image: { width: 1, height: 1 }, words: [] };
      }),
      terminate: vi.fn(),
    };

    await expect(PdfProcess.pdfToDocx([file], {
      ocrMode: "auto",
      ocrEngine,
      signal: controller.signal,
    })).rejects.toThrow("DOCX_CANCELLED");
    expect(ocrEngine.terminate).toHaveBeenCalledOnce();
  });

  it("rejects an encrypted PDF before reading page contents", async () => {
    const page = digitalPage([]);
    const file = addPdfRecord({
      pages: [page],
      bytes: new TextEncoder().encode("%PDF-1.7\n/Encrypt 4 0 R\n%%EOF"),
    });

    await expect(PdfProcess.pdfToDocx([file], {
      ocrMode: "auto",
    })).rejects.toThrow("PDF_ALREADY_ENCRYPTED");
    expect(page.getTextContent).not.toHaveBeenCalled();
  });
});
