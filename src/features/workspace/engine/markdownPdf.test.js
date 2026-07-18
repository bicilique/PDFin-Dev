import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { MARKDOWN_SAMPLE } from "./markdownEngine.js";
import { markdownToPdf, toWinAnsi } from "./markdownPdf.js";

async function loadOutput(result) {
  const bytes = new Uint8Array(await result.outputs[0].blob.arrayBuffer());
  return PDFDocument.load(bytes);
}

describe("toWinAnsi", () => {
  it("keeps Latin-1 and common typographic characters", () => {
    expect(toWinAnsi("Résumé — “kutipan” • café")).toBe("Résumé — “kutipan” • café");
  });

  it("strips diacritics that WinAnsi cannot encode", () => {
    expect(toWinAnsi("Wikipēdia")).toBe("Wikipedia");
  });

  it("substitutes characters with no safe fallback", () => {
    expect(toWinAnsi("汉字")).toBe("??");
    expect(toWinAnsi("a → b")).toBe("a -> b");
  });

  it("expands tabs so Courier layout stays measurable", () => {
    expect(toWinAnsi("a\tb")).toBe("a  b");
  });

  it("preserves newlines so code blocks keep their lines", () => {
    expect(toWinAnsi("baris satu\nbaris dua")).toBe("baris satu\nbaris dua");
  });
});

describe("markdownToPdf", () => {
  it("creates a valid single-output PDF from the sample document", async () => {
    const result = await markdownToPdf(MARKDOWN_SAMPLE, { outputName: "contoh.pdf", pageNumbers: true });
    expect(result.outputs).toHaveLength(1);
    expect(result.outputs[0].name).toBe("contoh.pdf");
    expect(result.outputs[0].pages).toBeGreaterThanOrEqual(1);
    expect(result.outputs[0].blob.type).toBe("application/pdf");

    const doc = await loadOutput(result);
    expect(doc.getPageCount()).toBe(result.outputs[0].pages);
    expect(doc.getTitle()).toBe("Laporan Rapat Tim");
  });

  it("reports progress and finishes at 100", async () => {
    const ticks = [];
    await markdownToPdf("# A\n\nB", { outputName: "x.pdf" }, (pct) => ticks.push(pct));
    expect(ticks.at(-1)).toBe(100);
    expect(ticks.every((pct) => pct >= 0 && pct <= 100)).toBe(true);
  });

  it("paginates long documents across multiple pages", async () => {
    const long = Array.from({ length: 120 }, (_, i) => `Paragraf ke-${i + 1} dengan teks yang cukup panjang untuk mengisi baris.`).join("\n\n");
    const result = await markdownToPdf(long, { outputName: "panjang.pdf", pageSize: "a4" });
    expect(result.outputs[0].pages).toBeGreaterThan(1);
  });

  it("still produces one empty page for empty input", async () => {
    const result = await markdownToPdf("", { outputName: "kosong.pdf" });
    expect(result.outputs[0].pages).toBe(1);
  });

  it("respects the selected page size", async () => {
    const result = await markdownToPdf("# Uji", { outputName: "letter.pdf", pageSize: "letter" });
    const doc = await loadOutput(result);
    const { width, height } = doc.getPage(0).getSize();
    expect(Math.round(width)).toBe(612);
    expect(Math.round(height)).toBe(792);
  });

  it("survives markdown with characters outside WinAnsi", async () => {
    const result = await markdownToPdf("# Uji 汉字 😀\n\nTeks → hasil", { outputName: "unicode.pdf" });
    expect(result.outputs[0].pages).toBeGreaterThanOrEqual(1);
  });

  it("adds a clickable link annotation for hyperlinks", async () => {
    const result = await markdownToPdf("Lihat [dokumen](https://example.com/doc).", { outputName: "tautan.pdf" });
    const doc = await loadOutput(result);
    const annots = doc.getPage(0).node.Annots();
    expect(annots?.size()).toBeGreaterThanOrEqual(1);
  });
});
