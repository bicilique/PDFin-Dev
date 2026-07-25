import { describe, expect, it } from "vitest";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { PdfEngine } from "./pdfEngine.js";
import { redactPdfs } from "./pdfRedact.js";

async function textOf(bytes) {
  const doc = await pdfjsLib.getDocument({ data: bytes, useWorkerFetch: false, isEvalSupported: false }).promise;
  const page = await doc.getPage(1);
  const content = await page.getTextContent();
  return content.items.map((item) => item.str).join(" ");
}

// End-to-end check with an independent extractor: pdf.js sees what a reader,
// a copy/paste, or a text-scraping script would see, so this is the assertion
// that actually proves the redaction removed the content.
describe("pdf.js extraction after redaction", () => {
  it("cannot find the redacted string", async () => {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const page = doc.addPage([400, 300]);
    page.drawText("RAHASIA 12345", { x: 40, y: 200, size: 14, font });
    page.drawText("Publik biasa", { x: 40, y: 100, size: 14, font });
    const original = await doc.save();

    expect(await textOf(original.slice())).toContain("RAHASIA 12345");

    PdfEngine.files.set("x", { id: "x", name: "a.pdf", size: original.length, bytes: original, pageCount: 1 });
    const result = await redactPdfs([{ id: "x", name: "a.pdf" }], {
      areas: [{ fileId: "x", srcIndex: 0, rect: { x: 0.05, y: 0.25, w: 0.6, h: 0.15 } }],
    }, null);
    const out = new Uint8Array(await result.outputs[0].blob.arrayBuffer());
    const after = await textOf(out);
    expect(after).not.toContain("RAHASIA");
    expect(after).not.toContain("12345");
    expect(after).toContain("Publik biasa");
  });
});
