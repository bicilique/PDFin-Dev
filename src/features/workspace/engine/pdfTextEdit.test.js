import { afterEach, describe, expect, it } from "vitest";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { PDFDocument, PDFName, StandardFonts, degrees, rgb } from "pdf-lib";
import { PdfEngine } from "./pdfEngine.js";
import { extractPageTextRuns, applyTextEdits } from "./pdfTextEdit.js";
import { parseToUnicodeCMap, encodeWithCMap } from "./pdfCMap.js";

const PAGE_WIDTH = 400;
const PAGE_HEIGHT = 300;

async function makePdf({ rotation = 0, lines = [["Harga lama", 40, 200], ["Baris kedua", 40, 100]], size = 14 } = {}) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  if (rotation) page.setRotation(degrees(rotation));
  for (const [text, x, y] of lines) page.drawText(text, { x, y, size, font, color: rgb(0.1, 0.2, 0.3) });
  return doc.save();
}

// A hand-built PDF using a subset font whose ToUnicode map only covers A, B,
// and C — the shape real embedded subsets have, and the only way to exercise
// the "character has no glyph in this font" path without a TTF embedder.
async function makeSubsetFontPdf({ content = "BT /F1 14 Tf 40 200 Td <4142> Tj ET" } = {}) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const cmap = `/CIDInit /ProcSet findresource begin
1 begincodespacerange
<00> <FF>
endcodespacerange
3 beginbfchar
<41> <0041>
<42> <0042>
<43> <0043>
endbfchar
end`;
  const toUnicode = doc.context.register(doc.context.flateStream(cmap));
  const font = doc.context.register(doc.context.obj({
    Type: "Font",
    Subtype: "TrueType",
    BaseFont: PDFName.of("ABCDEF+Uji"),
    FirstChar: 65,
    LastChar: 67,
    Widths: doc.context.obj([600, 600, 600]),
    Encoding: PDFName.of("WinAnsiEncoding"),
    ToUnicode: toUnicode,
  }));
  page.node.set(PDFName.of("Resources"), doc.context.obj({ Font: doc.context.obj({ F1: font }) }));
  page.node.set(PDFName.of("Contents"), doc.context.register(doc.context.flateStream(content)));
  return doc.save();
}

function seedFile(id, name, bytes) {
  PdfEngine.files.set(id, { id, name, size: bytes.length, bytes, pageCount: 1 });
}

async function extractedText(blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const doc = await pdfjsLib.getDocument({ data: bytes, useWorkerFetch: false, isEvalSupported: false }).promise;
  const page = await doc.getPage(1);
  const content = await page.getTextContent();
  return content.items.map((item) => item.str).join(" ");
}

async function itemsOf(blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const doc = await pdfjsLib.getDocument({ data: bytes, useWorkerFetch: false, isEvalSupported: false }).promise;
  const page = await doc.getPage(1);
  const content = await page.getTextContent();
  return content.items;
}

describe("parseToUnicodeCMap", () => {
  const cmap = new TextEncoder().encode(`
/CIDInit /ProcSet findresource begin
1 begincodespacerange
<0000> <FFFF>
endcodespacerange
2 beginbfchar
<0003> <0041>
<0004> <00E9>
endbfchar
1 beginbfrange
<0010> <0012> <0061>
endbfrange
end
`);

  it("reads bfchar and bfrange entries in both directions", () => {
    const { toUnicode, fromUnicode, codeByteLength } = parseToUnicodeCMap(cmap);
    expect(codeByteLength).toBe(2);
    expect(toUnicode.get(0x0003)).toBe("A");
    expect(toUnicode.get(0x0004)).toBe("é");
    expect(toUnicode.get(0x0012)).toBe("c");
    expect(fromUnicode.get("A")).toBe(0x0003);
    expect(fromUnicode.get("b")).toBe(0x0011);
  });

  it("encodes only characters the font actually has", () => {
    const { fromUnicode, codeByteLength } = parseToUnicodeCMap(cmap);
    expect(Array.from(encodeWithCMap("Ab", fromUnicode, codeByteLength))).toEqual([0, 3, 0, 0x11]);
    expect(encodeWithCMap("AZ", fromUnicode, codeByteLength)).toBeNull();
  });
});

describe("extractPageTextRuns", () => {
  afterEach(() => {
    PdfEngine.files.clear();
  });

  it("lists each text run with its readable text and position", async () => {
    seedFile("t-1", "surat.pdf", await makePdf());
    const runs = await extractPageTextRuns("t-1", 0);
    expect(runs.map((run) => run.text)).toEqual(["Harga lama", "Baris kedua"]);
    expect(runs.every((run) => run.editable)).toBe(true);
    expect(runs[0].fontSize).toBe(14);
    // First line sits near the top of a 300pt page: y=200 -> ~0.30 from the top.
    expect(runs[0].rect.y).toBeGreaterThan(0.25);
    expect(runs[0].rect.y).toBeLessThan(0.36);
    expect(runs[0].rect.x).toBeCloseTo(0.1, 1);
  });

  it("names the typeface and colour a run is drawn with", async () => {
    seedFile("t-1", "surat.pdf", await makePdf());
    const [run] = await extractPageTextRuns("t-1", 0);
    expect(run.style.name).toBe("Helvetica");
    expect(run.style.known).toBe(true);
    expect(run.style.family).toBe("sans");
    expect(run.style.weight).toBe(400);
    expect(run.style.css).toMatch(/Helvetica/);
    expect(run.color).toBe("rgb(26, 51, 77)");
  });

  it("reports rotated-page runs in visible coordinates", async () => {
    seedFile("t-1", "scan.pdf", await makePdf({ rotation: 90 }));
    const runs = await extractPageTextRuns("t-1", 0);
    expect(runs[0].text).toBe("Harga lama");
    expect(runs[0].rect.x).toBeGreaterThan(0.5);
    expect(runs[0].rect.w).toBeGreaterThan(0);
  });

  it("marks invisible OCR text as read-only", async () => {
    seedFile("t-1", "ocr.pdf", await makeSubsetFontPdf({
      // Render mode 3 is the invisible layer OCR output puts under the scan.
      content: "BT /F1 14 Tf 40 200 Td <4142> Tj 3 Tr 40 100 Td <4143> Tj ET",
    }));
    const runs = await extractPageTextRuns("t-1", 0);
    expect(runs).toHaveLength(2);
    expect(runs[0]).toMatchObject({ text: "AB", editable: true });
    expect(runs[1]).toMatchObject({ text: "AC", editable: false, reason: "invisible-text" });
  });
});

describe("run merging", () => {
  afterEach(() => {
    PdfEngine.files.clear();
  });

  // Each glyph of the test font is 600/1000 em, so at 14pt "AB" advances 16.8pt.
  it("joins fragments of the same line into one editable run", async () => {
    seedFile("t-1", "pecah.pdf", await makeSubsetFontPdf({
      content: "BT /F1 14 Tf 40 200 Td <4142> Tj 16.8 0 Td <4143> Tj ET",
    }));
    const runs = await extractPageTextRuns("t-1", 0);
    expect(runs).toHaveLength(1);
    expect(runs[0].text).toBe("ABAC");
  });

  it("inserts a space where the fragments were visually separated", async () => {
    seedFile("t-1", "spasi.pdf", await makeSubsetFontPdf({
      content: "BT /F1 14 Tf 40 200 Td <4142> Tj 21 0 Td <4143> Tj ET",
    }));
    const runs = await extractPageTextRuns("t-1", 0);
    expect(runs[0].text).toBe("AB AC");
  });

  it("keeps fragments apart when they are on different lines or too far away", async () => {
    seedFile("t-1", "jauh.pdf", await makeSubsetFontPdf({
      content: "BT /F1 14 Tf 40 200 Td <4142> Tj 0 -20 Td <4143> Tj ET",
    }));
    const runs = await extractPageTextRuns("t-1", 0);
    expect(runs.map((run) => run.text)).toEqual(["AB", "AC"]);
  });

  it("edits a merged run by filling the first operator and emptying the rest", async () => {
    seedFile("t-1", "pecah.pdf", await makeSubsetFontPdf({
      content: "BT /F1 14 Tf 40 200 Td <4142> Tj 16.8 0 Td <4143> Tj ET",
    }));
    const runs = await extractPageTextRuns("t-1", 0);

    const result = await applyTextEdits([{ id: "t-1", name: "pecah.pdf" }], {
      edits: { "t-1": { [`0:${runs[0].opIndex}`]: "CABA" } },
    }, null);

    expect(result.sameFont).toBe(1);
    const items = await itemsOf(result.outputs[0].blob);
    expect(items.map((item) => item.str).join("")).toBe("CABA");
    // The whole replacement starts where the first fragment did.
    const drawn = items.find((item) => item.str.includes("CABA"));
    expect(drawn.transform[4]).toBeCloseTo(40, 1);
  });
});

describe("applyTextEdits", () => {
  afterEach(() => {
    PdfEngine.files.clear();
  });

  it("rewrites a run with the original font when every character fits", async () => {
    seedFile("t-1", "surat.pdf", await makePdf());
    const runs = await extractPageTextRuns("t-1", 0);
    const target = runs.find((run) => run.text === "Harga lama");

    const result = await applyTextEdits([{ id: "t-1", name: "surat.pdf" }], {
      edits: { "t-1": { [`0:${target.opIndex}`]: "Harga baru" } },
    }, null);

    expect(result.sameFont).toBe(1);
    expect(result.redrawn).toBe(0);
    expect(result.outputs[0].name).toBe("surat-teks-diedit.pdf");

    const text = await extractedText(result.outputs[0].blob);
    expect(text).toContain("Harga baru");
    expect(text).not.toContain("Harga lama");
    expect(text).toContain("Baris kedua");

    // "Same font" has to mean exactly that: the rewritten run must still be
    // drawn with the original font resource, at the original position.
    const before = await itemsOf(new Blob([PdfEngine.files.get("t-1").bytes], { type: "application/pdf" }));
    const after = await itemsOf(result.outputs[0].blob);
    const original = before.find((item) => item.str.includes("Harga lama"));
    const edited = after.find((item) => item.str.includes("Harga baru"));
    // pdf.js font ids are per-document, so the comparison is against the
    // untouched run in the same output, which used the same font resource.
    const untouched = after.find((item) => item.str.includes("Baris kedua"));
    expect(edited.fontName).toBe(untouched.fontName);
    expect(edited.height).toBeCloseTo(original.height, 5);
    expect(edited.transform[4]).toBeCloseTo(original.transform[4], 5);
    expect(edited.transform[5]).toBeCloseTo(original.transform[5], 5);
  });

  it("keeps the following text in place when the replacement is shorter", async () => {
    seedFile("t-1", "surat.pdf", await makePdf());
    const runs = await extractPageTextRuns("t-1", 0);
    const before = await itemsOf(new Blob([PdfEngine.files.get("t-1").bytes], { type: "application/pdf" }));
    const secondBefore = before.find((item) => item.str.includes("Baris"));

    const result = await applyTextEdits([{ id: "t-1", name: "surat.pdf" }], {
      edits: { "t-1": { [`0:${runs[0].opIndex}`]: "X" } },
    }, null);

    const after = await itemsOf(result.outputs[0].blob);
    const secondAfter = after.find((item) => item.str.includes("Baris"));
    expect(secondAfter.transform[4]).toBeCloseTo(secondBefore.transform[4], 3);
    expect(secondAfter.transform[5]).toBeCloseTo(secondBefore.transform[5], 3);
  });

  it("condenses the replacement so a longer edit keeps the original width", async () => {
    seedFile("t-1", "surat.pdf", await makePdf());
    const runs = await extractPageTextRuns("t-1", 0);
    const originalWidth = runs[0].rect.w;

    const result = await applyTextEdits([{ id: "t-1", name: "surat.pdf" }], {
      edits: { "t-1": { [`0:${runs[0].opIndex}`]: "Harga baru yang jauh lebih panjang" } },
      fitWidth: true,
    }, null);

    const out = new Uint8Array(await result.outputs[0].blob.arrayBuffer());
    PdfEngine.files.set("t-2", { id: "t-2", name: "o.pdf", size: out.length, bytes: out, pageCount: 1 });
    const editedRuns = await extractPageTextRuns("t-2", 0);
    const edited = editedRuns.find((run) => run.text.startsWith("Harga baru"));
    expect(edited.rect.w).toBeLessThanOrEqual(originalWidth * 1.02);
  });

  it("rewrites in place while the subset font still covers the new text", async () => {
    seedFile("t-1", "subset.pdf", await makeSubsetFontPdf());
    const runs = await extractPageTextRuns("t-1", 0);
    expect(runs[0].text).toBe("AB");
    expect(runs[0].editable).toBe(true);

    const result = await applyTextEdits([{ id: "t-1", name: "subset.pdf" }], {
      edits: { "t-1": { [`0:${runs[0].opIndex}`]: "CAB" } },
    }, null);
    expect(result.sameFont).toBe(1);
    expect(result.redrawn).toBe(0);
    expect(await extractedText(result.outputs[0].blob)).toContain("CAB");
  });

  it("falls back to redrawing when the subset font lacks the typed character", async () => {
    seedFile("t-1", "subset.pdf", await makeSubsetFontPdf());
    const runs = await extractPageTextRuns("t-1", 0);

    // "D" is outside the font's ToUnicode map, so it has no glyph to reuse.
    const result = await applyTextEdits([{ id: "t-1", name: "subset.pdf" }], {
      edits: { "t-1": { [`0:${runs[0].opIndex}`]: "AD" } },
    }, null);

    expect(result.sameFont).toBe(0);
    expect(result.redrawn).toBe(1);
    const items = await itemsOf(result.outputs[0].blob);
    const drawn = items.find((item) => item.str.includes("AD"));
    expect(drawn).toBeTruthy();
    // Redrawn text keeps the original baseline position.
    expect(drawn.transform[4]).toBeCloseTo(40, 1);
    expect(drawn.transform[5]).toBeCloseTo(200, 1);
    expect(await extractedText(result.outputs[0].blob)).not.toContain("AB");
  });

  it("redraws with an embedded font when the text leaves WinAnsi behind", async () => {
    seedFile("t-1", "subset.pdf", await makeSubsetFontPdf());
    const runs = await extractPageTextRuns("t-1", 0);

    const result = await applyTextEdits([{ id: "t-1", name: "subset.pdf" }], {
      edits: { "t-1": { [`0:${runs[0].opIndex}`]: "Naïve → ćčžšđ" } },
    }, null);

    expect(result.redrawn).toBe(1);
    expect(result.droppedCharacters).toBe(0);
    const text = await extractedText(result.outputs[0].blob);
    expect(text).toContain("Naïve → ćčžšđ");
  });

  it("ignores edits that target a run it cannot edit", async () => {
    seedFile("t-1", "surat.pdf", await makePdf());
    const result = await applyTextEdits([{ id: "t-1", name: "surat.pdf" }], {
      edits: { "t-1": { "0:9999": "tidak ada" } },
    }, null);
    expect(result.sameFont).toBe(0);
    expect(result.redrawn).toBe(0);
    const text = await extractedText(result.outputs[0].blob);
    expect(text).toContain("Harga lama");
  });
});
