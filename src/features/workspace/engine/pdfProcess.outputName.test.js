import { afterEach, describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { PdfEngine } from "./pdfEngine.js";
import { PdfProcess } from "./pdfProcess.js";
import { sanitizePdfBaseName, getOutputNameError, createNameDeduper } from "./outputName.js";

async function makePdf(pageCount = 1) {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i += 1) doc.addPage([300, 200]);
  return doc.save();
}

function seedFile(id, name, bytes, pageCount = 1) {
  PdfEngine.files.set(id, { id, name, size: bytes.length, bytes, pageCount });
}

describe("sanitizePdfBaseName", () => {
  it("strips illegal path characters", () => {
    expect(sanitizePdfBaseName('a/b\\c:d*e?f"g<h>i|j')).toBe("a-b-c-d-e-f-g-h-i-j");
  });
  it("strips repeated .pdf extensions", () => {
    expect(sanitizePdfBaseName("laporan.pdf.pdf")).toBe("laporan");
  });
  it("collapses whitespace and dashes", () => {
    expect(sanitizePdfBaseName("  laporan   bulanan -- final  ")).toBe("laporan-bulanan-final");
  });
  it("trims leading/trailing dashes", () => {
    expect(sanitizePdfBaseName("--laporan--")).toBe("laporan");
  });
});

describe("getOutputNameError", () => {
  it("errors on empty or whitespace-only input", () => {
    expect(getOutputNameError("", "id")).not.toBe("");
    expect(getOutputNameError("   ", "id")).not.toBe("");
  });
  it("accepts a valid name", () => {
    expect(getOutputNameError("laporan", "id")).toBe("");
  });
});

describe("createNameDeduper", () => {
  it("returns unique names on collision", () => {
    const dedupe = createNameDeduper();
    expect(dedupe("a.pdf")).toBe("a.pdf");
    expect(dedupe("a.pdf")).toBe("a-2.pdf");
    expect(dedupe("a.pdf")).toBe("a-3.pdf");
  });
  it("is case-insensitive", () => {
    const dedupe = createNameDeduper();
    expect(dedupe("Scan.pdf")).toBe("Scan.pdf");
    expect(dedupe("scan.pdf")).toBe("scan-2.pdf");
  });
});

describe("PdfProcess multi-output naming", () => {
  afterEach(() => {
    PdfEngine.files.clear();
    PdfProcess.clearCache();
  });

  it("watermark: dedupes two files with identical sanitized basenames", async () => {
    const bytes = await makePdf(1);
    seedFile("wm-1", "Scan (1).pdf", bytes);
    seedFile("wm-2", "Scan (1).pdf", bytes);
    const result = await PdfProcess.watermark(
      [{ id: "wm-1", name: "Scan (1).pdf" }, { id: "wm-2", name: "Scan (1).pdf" }],
      { kind: "text", text: "RAHASIA", opacity: 24, rotation: 0, size: 40, align: "middle-center", scope: "all" },
      null
    );
    const names = result.outputs.map((o) => o.name);
    expect(new Set(names).size).toBe(2);
    expect(names.every((n) => /^Scan-\(1\)-watermark(-2)?\.pdf$/.test(n))).toBe(true);
  });

  it("watermark: custom outputName + multi-file suffixes by index", async () => {
    const bytes = await makePdf(1);
    seedFile("wm-3", "a.pdf", bytes);
    seedFile("wm-4", "b.pdf", bytes);
    const result = await PdfProcess.watermark(
      [{ id: "wm-3", name: "a.pdf" }, { id: "wm-4", name: "b.pdf" }],
      { kind: "text", text: "X", opacity: 24, rotation: 0, size: 40, align: "middle-center", scope: "all", outputName: "hasil" },
      null
    );
    expect(result.outputs.map((o) => o.name)).toEqual(["hasil-1.pdf", "hasil-2.pdf"]);
  });

  it("split: sanitizes a messy raw base name and keeps groups distinct", async () => {
    const bytes = await makePdf(4);
    seedFile("split-1", "src.pdf", bytes);
    const pages = Array.from({ length: 4 }, (_, i) => ({ fileId: "split-1", srcIndex: i, uid: `p${i}`, rotation: 0, deleted: false }));
    const result = await PdfProcess.split(pages, { mode: "every", n: 2 }, "  laporan / final  ", null);
    const names = result.outputs.map((o) => o.name);
    expect(names).toEqual(["laporan-final-1.pdf", "laporan-final-2.pdf"]);
    expect(names.every((n) => !/[/\\:*?"<>|]/.test(n))).toBe(true);
  });

  it("pageNumbers: two files with identical basename produce distinct outputs", async () => {
    const bytes = await makePdf(1);
    seedFile("pn-1", "Dokumen.pdf", bytes);
    seedFile("pn-2", "Dokumen.pdf", bytes);
    const result = await PdfProcess.pageNumbers(
      [{ id: "pn-1", name: "Dokumen.pdf" }, { id: "pn-2", name: "Dokumen.pdf" }],
      { scope: "all", startAt: 1, position: "bottom-center", format: "n", font: "helvetica", fontSize: 11, color: "ink", margin: 28 },
      null
    );
    const names = result.outputs.map((o) => o.name);
    expect(new Set(names).size).toBe(2);
  });
});
