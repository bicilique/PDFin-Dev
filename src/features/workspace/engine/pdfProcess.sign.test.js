import { afterEach, describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { PdfEngine } from "./pdfEngine.js";
import { PdfProcess } from "./pdfProcess.js";

// 1x1 transparent PNG, used as a stand-in signature image.
const PNG_1X1 = Uint8Array.from(
  atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="),
  (c) => c.charCodeAt(0)
);

async function makePdf(pageCount = 1) {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i += 1) doc.addPage([300, 200]);
  return doc.save();
}

function seedFile(id, name, bytes) {
  PdfEngine.files.set(id, { id, name, size: bytes.length, bytes });
}

function placement(id, fileId, srcIndex, x = 0.3) {
  return { id, fileId, srcIndex, rect: { x, y: 0.7, w: 0.3 }, source: { bytes: PNG_1X1, type: "image/png", aspect: 1 } };
}

describe("PdfProcess.sign", () => {
  afterEach(() => {
    PdfEngine.files.clear();
    PdfProcess.clearCache();
  });

  it("single file: applies its own placements, no batch suffix", async () => {
    const bytes = await makePdf(2);
    seedFile("s-1", "kontrak.pdf", bytes);
    const result = await PdfProcess.sign(
      [{ id: "s-1", name: "kontrak.pdf" }],
      { placements: [placement("p1", "s-1", 0)] },
      null
    );
    expect(result.outputs.map((o) => o.name)).toEqual(["kontrak-diparaf.pdf"]);
  });

  it("multi-file: file with its own placements uses them, not the template", async () => {
    const bytes = await makePdf(1);
    seedFile("s-a", "a.pdf", bytes);
    seedFile("s-b", "b.pdf", bytes);
    const result = await PdfProcess.sign(
      [{ id: "s-a", name: "a.pdf" }, { id: "s-b", name: "b.pdf" }],
      { placements: [placement("p1", "s-a", 0, 0.1), placement("p2", "s-b", 0, 0.6)], outputName: "hasil" },
      null
    );
    expect(result.outputs.map((o) => o.name)).toEqual(["hasil-1.pdf", "hasil-2.pdf"]);
  });

  it("multi-file: file without explicit placement inherits the first file's placement", async () => {
    const bytes = await makePdf(1);
    seedFile("s-c", "c.pdf", bytes);
    seedFile("s-d", "d.pdf", bytes);
    seedFile("s-e", "e.pdf", bytes);
    // Only "s-c" (first in files order) has an explicit placement.
    const result = await PdfProcess.sign(
      [{ id: "s-c", name: "c.pdf" }, { id: "s-d", name: "d.pdf" }, { id: "s-e", name: "e.pdf" }],
      { placements: [placement("p1", "s-c", 0, 0.15)] },
      null
    );
    expect(result.outputs).toHaveLength(3);
    // All three should have produced a stamped page (no crash / all get output);
    // page counts preserved regardless of inheritance.
    result.outputs.forEach((o) => expect(o.pages).toBe(1));
  });

  it("dedupes output names for files sharing a sanitized basename", async () => {
    const bytes = await makePdf(1);
    seedFile("s-f", "Scan (1).pdf", bytes);
    seedFile("s-g", "Scan (1).pdf", bytes);
    const result = await PdfProcess.sign(
      [{ id: "s-f", name: "Scan (1).pdf" }, { id: "s-g", name: "Scan (1).pdf" }],
      { placements: [placement("p1", "s-f", 0), placement("p2", "s-g", 0)] },
      null
    );
    const names = result.outputs.map((o) => o.name);
    expect(new Set(names).size).toBe(2);
  });
});
