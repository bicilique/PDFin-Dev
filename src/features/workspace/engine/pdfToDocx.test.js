import JSZip from "jszip";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as pdfjsLib from "pdfjs-dist";
import { PdfEngine } from "./pdfEngine.js";
import { PdfProcess } from "./pdfProcess.js";

const OPS = pdfjsLib.OPS;

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

// Text is emitted as one run per source item, so assertions read the joined
// run text rather than a single XML node.
function runText(xml) {
  return [...xml.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)]
    .map((match) => match[1])
    .join("");
}

async function readDocumentText(blob) {
  return runText(await readDocumentXml(blob));
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

  it("carries text colour, bold faces and vector fills into the DOCX", async () => {
    const page = digitalPage([
      {
        str: "Ringkasan Hasil",
        dir: "ltr",
        transform: [14, 0, 0, 14, 72, 700],
        width: 120,
        height: 14,
        fontName: "body",
        hasEOL: true,
      },
    ]);
    // A card fill behind the heading, drawn with the same colour the heading
    // text uses, exactly as a print-to-PDF generator emits it.
    page.getOperatorList = vi.fn(async () => ({
      fnArray: [OPS.setFillRGBColor, OPS.constructPath, OPS.fill, OPS.beginText, OPS.setFillRGBColor, OPS.setTextMatrix, OPS.showText, OPS.endText],
      argsArray: [
        [242, 244, 247],
        [[OPS.rectangle], [60, 680, 300, 60], []],
        null,
        null,
        [47, 49, 64],
        [1, 0, 0, 1, 72, 700],
        [[]],
        null,
      ],
    }));
    page.commonObjs = {
      has: (key) => key === "body",
      get: () => ({ name: "AAAAAA+Inter-Regular_Bold" }),
    };
    const file = addPdfRecord({ pages: [page] });

    const result = await PdfProcess.pdfToDocx([file], { ocrMode: "off" });
    const xml = await readDocumentXml(result.outputs[0].blob);

    expect(result.conversion.shapePages).toEqual([1]);
    expect(xml).toContain('<w:color w:val="2F3140"/>');
    expect(xml).toContain("<w:b/>");
    expect(xml).toContain("<w:drawing>");
    expect(xml).toContain('<w:rFonts w:ascii="Arial"');
  });

  it("rasterises a vector icon that no rectangle could reproduce", async () => {
    const page = digitalPage([
      {
        str: "Terverifikasi",
        dir: "ltr",
        transform: [11, 0, 0, 11, 120, 700],
        width: 80,
        height: 11,
        fontName: "body",
        hasEOL: true,
      },
    ]);
    // A round check badge: a curve-built path plus a stencil mask, neither of
    // which the flat-rectangle reader can express.
    page.getOperatorList = vi.fn(async () => ({
      fnArray: [OPS.setFillRGBColor, OPS.constructPath, OPS.fill, OPS.save, OPS.transform, OPS.paintImageMaskXObject, OPS.restore],
      argsArray: [
        [32, 160, 90],
        [[OPS.moveTo, OPS.curveTo, OPS.curveTo], [90, 700, 90, 712, 108, 712, 108, 700, 108, 688, 90, 688, 90, 700], []],
        null,
        null,
        [12, 0, 0, 12, 93, 694],
        [{ width: 16, height: 16 }],
        null,
      ],
    }));
    page.render = vi.fn(() => ({ promise: Promise.resolve() }));
    const file = addPdfRecord({ pages: [page] });

    const result = await PdfProcess.pdfToDocx([file], { ocrMode: "off" });
    const xml = await readDocumentXml(result.outputs[0].blob);

    expect(result.conversion.vectorArtPages).toEqual([1]);
    expect(page.render).toHaveBeenCalledTimes(1);
    expect(xml).toContain("<w:drawing>");
    expect(await readDocumentText(result.outputs[0].blob)).toContain("Terverifikasi");
  });

  it("splits gap-free table rows along the column grid the PDF painted", async () => {
    // Chrome print-to-PDF emits each row as one text chunk with the spacing
    // baked in, so only the painted header cells reveal the column edges.
    const cell = (text, x, width, y) => ({
      str: text,
      dir: "ltr",
      transform: [9, 0, 0, 9, x, y],
      width,
      height: 9,
      fontName: "body",
      hasEOL: false,
    });
    // Each chunk runs right up to the next one, so no gap betrays the columns.
    const row = (a, b, c, y) => [cell(a, 40, 136, y), cell(b, 178, 126, y), cell(c, 306, 126, y)];
    const page = digitalPage([
      ...row("Metrik", "Run 1", "Run 2", 800),
      ...row("Cold start", "485", "474", 780),
      ...row("Warm start", "203", "209", 760),
    ]);
    const headerCell = (left, width) => [
      [OPS.setFillRGBColor, [47, 49, 64]],
      [OPS.constructPath, [[OPS.rectangle], [left, 806, width, 20], []]],
      [OPS.fill, null],
    ];
    const rowBand = (bottom) => [
      [OPS.setFillRGBColor, [242, 244, 247]],
      [OPS.constructPath, [[OPS.rectangle], [36, bottom, 400, 20], []]],
      [OPS.fill, null],
    ];
    const operators = [...headerCell(36, 140), ...headerCell(176, 130), ...headerCell(306, 130), ...rowBand(786), ...rowBand(766)];
    page.getOperatorList = vi.fn(async () => ({
      fnArray: operators.map((entry) => entry[0]),
      argsArray: operators.map((entry) => entry[1]),
    }));
    const file = addPdfRecord({ pages: [page] });

    const result = await PdfProcess.pdfToDocx([file], { ocrMode: "off" });
    const xml = await readDocumentXml(result.outputs[0].blob);
    const texts = [...xml.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((match) => match[1].trim());

    expect(xml).toContain("<w:tbl>");
    // Each column lands in its own cell instead of one merged run per row.
    expect(texts).toEqual(expect.arrayContaining(["Metrik", "Run 1", "Run 2", "Cold start", "485", "474"]));
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
    expect(await readDocumentText(result.outputs[0].blob)).toContain("Hasil pindai akurat");
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

  it("restores word spacing that the PDF encoded as positioning", async () => {
    const word = (str, x, width) => ({
      str,
      transform: [11, 0, 0, 11, x, 700],
      width,
      height: 11,
      fontName: "body",
      hasEOL: false,
    });
    const file = addPdfRecord({
      pages: [digitalPage([
        word("Surat", 72, 28),
        word("ini", 103, 12),
        word("sah", 118, 18),
      ])],
    });

    const result = await PdfProcess.pdfToDocx([file], { ocrMode: "auto" });

    expect(await readDocumentText(result.outputs[0].blob)).toContain("Surat ini sah");
  });

  it("merges wrapped lines back into one paragraph and undoes hyphenation", async () => {
    const line = (str, y, width) => ({
      str,
      transform: [11, 0, 0, 11, 72, y],
      width,
      height: 11,
      fontName: "body",
      hasEOL: true,
    });
    const file = addPdfRecord({
      pages: [digitalPage([
        line("Dokumen ini dibuat untuk keperluan admi-", 700, 451),
        line("nistrasi kantor wilayah.", 686, 140),
      ])],
    });

    const result = await PdfProcess.pdfToDocx([file], { ocrMode: "auto" });
    const xml = await readDocumentXml(result.outputs[0].blob);

    expect(runText(xml)).toContain("keperluan administrasi kantor wilayah.");
    expect((xml.match(/<w:p>/g) || []).length).toBe(1);
  });

  it("keeps a centered heading centered and a right-aligned line right", async () => {
    const file = addPdfRecord({
      pages: [digitalPage([
        { str: "BERITA ACARA", transform: [18, 0, 0, 18, 212, 780], width: 171, height: 18, fontName: "body", hasEOL: true },
        { str: "Jakarta, 1 Mei 2026", transform: [11, 0, 0, 11, 380, 740], width: 143, height: 11, fontName: "body", hasEOL: true },
        { str: "Isi dokumen berada pada margin kiri halaman ini.", transform: [11, 0, 0, 11, 72, 700], width: 451, height: 11, fontName: "body", hasEOL: true },
      ])],
    });

    const result = await PdfProcess.pdfToDocx([file], { ocrMode: "auto" });
    const xml = await readDocumentXml(result.outputs[0].blob);

    expect(xml).toContain('<w:jc w:val="center"/>');
    expect(xml).toContain('<w:jc w:val="right"/>');
  });

  it("preserves aligned label columns with tab stops instead of collapsing them", async () => {
    const file = addPdfRecord({
      pages: [digitalPage([
        { str: "Nama", transform: [11, 0, 0, 11, 72, 700], width: 30, height: 11, fontName: "body", hasEOL: false },
        { str: ": Ayu Lestari", transform: [11, 0, 0, 11, 200, 700], width: 70, height: 11, fontName: "body", hasEOL: true },
      ])],
    });

    const result = await PdfProcess.pdfToDocx([file], { ocrMode: "auto" });
    const xml = await readDocumentXml(result.outputs[0].blob);

    expect(xml).toContain("<w:tabs>");
    expect(xml).toContain("<w:tab/>");
  });

  it("derives page margins from the real content box", async () => {
    const file = addPdfRecord({
      pages: [digitalPage([
        { str: "Konten rapat", transform: [11, 0, 0, 11, 40, 800], width: 80, height: 11, fontName: "body", hasEOL: true },
      ])],
    });

    const result = await PdfProcess.pdfToDocx([file], { ocrMode: "auto" });
    const margins = /<w:pgMar[^>]*w:left="(\d+)"/.exec(await readDocumentXml(result.outputs[0].blob));

    expect(Number(margins[1])).toBe(800);
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
