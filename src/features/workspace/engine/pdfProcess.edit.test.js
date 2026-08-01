import { afterEach, describe, expect, it } from "vitest";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { PdfEngine } from "./pdfEngine.js";
import { PdfProcess } from "./pdfProcess.js";
import { extractPageTextRuns } from "./pdfTextEdit.js";

// The Edit PDF tool applies two very different kinds of change in one run:
// rewriting the text a page already carries, and drawing new objects on top.

async function makePdf() {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([400, 300]);
  page.drawText("Harga lama", { x: 40, y: 200, size: 14, font, color: rgb(0, 0, 0) });
  return doc.save();
}

function seedFile(id, name, bytes) {
  PdfEngine.files.set(id, { id, name, size: bytes.length, bytes, pageCount: 1 });
}

// The operator index of a run is whatever the content stream happens to use, so
// the change is built from the run the engine reports.
async function changeFor(fileId, text) {
  const [run] = await extractPageTextRuns(fileId, 0);
  return { fileId, srcIndex: run.srcIndex, opIndex: run.opIndex, original: run.text, text };
}

async function textOf(blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const doc = await pdfjsLib.getDocument({ data: bytes, useWorkerFetch: false, isEvalSupported: false }).promise;
  const page = await doc.getPage(1);
  const content = await page.getTextContent();
  return content.items.map((item) => item.str).join(" ");
}

const textObject = {
  id: "o1", fileId: "e-1", srcIndex: 0, type: "text",
  rect: { x: 0.1, y: 0.6, w: 0.6, h: 0.1 },
  text: "Catatan tambahan", sizePct: 0.05, color: "#111827", fontFamily: "sans",
};

describe("PdfProcess.editDocument", () => {
  afterEach(() => {
    PdfEngine.files.clear();
  });

  it("applies a text change and a drawn object to the same document", async () => {
    seedFile("e-1", "surat.pdf", await makePdf());
    const result = await PdfProcess.editDocument([{ id: "e-1", name: "surat.pdf" }], {
      changes: [await changeFor("e-1", "Harga baru")],
      objects: [textObject],
      outputName: "hasil-edit",
    });

    expect(result.outputs).toHaveLength(1);
    const text = await textOf(result.outputs[0].blob);
    expect(text).toContain("Harga baru");
    expect(text).toContain("Catatan tambahan");
    expect(text).not.toContain("Harga lama");
    expect(result.outputs[0].name).toBe("hasil-edit.pdf");
    expect(result.sameFont).toBe(1);
  });

  it("only rewrites text when there is nothing to draw", async () => {
    seedFile("e-1", "surat.pdf", await makePdf());
    const result = await PdfProcess.editDocument([{ id: "e-1", name: "surat.pdf" }], {
      changes: [await changeFor("e-1", "Harga baru")],
      objects: [],
      outputName: "hasil-edit",
    });

    expect(result.sameFont).toBe(1);
    expect(await textOf(result.outputs[0].blob)).toContain("Harga baru");
  });

  it("only draws objects when no text was changed", async () => {
    seedFile("e-1", "surat.pdf", await makePdf());
    const result = await PdfProcess.editDocument([{ id: "e-1", name: "surat.pdf" }], {
      changes: [],
      objects: [textObject],
      outputName: "hasil-edit",
    });

    const text = await textOf(result.outputs[0].blob);
    expect(text).toContain("Harga lama");
    expect(text).toContain("Catatan tambahan");
    expect(result.sameFont).toBeUndefined();
  });

  it("reports progress once across both passes", async () => {
    seedFile("e-1", "surat.pdf", await makePdf());
    const seen = [];
    await PdfProcess.editDocument([{ id: "e-1", name: "surat.pdf" }], {
      changes: [await changeFor("e-1", "Harga baru")],
      objects: [textObject],
    }, (pct) => seen.push(pct));

    expect(seen[seen.length - 1]).toBe(100);
    expect(Math.min(...seen)).toBeGreaterThan(0);
    expect(seen.every((pct, index) => index === 0 || pct >= seen[index - 1])).toBe(true);
  });
});
