import { afterEach, describe, expect, it } from "vitest";
import { PDFDocument, StandardFonts } from "pdf-lib";
import {
  embedUnicodeFont,
  missingGlyphs,
  resolveFontFile,
  resolveTextFont,
  setUnicodeFontLoader,
} from "./unicodeFont.js";
import { sanitizeWinAnsiText } from "./pdfAnnotate.js";

afterEach(() => {
  // Hand control back to the loader the test setup installed globally.
  setUnicodeFontLoader(null);
});

describe("resolveFontFile", () => {
  it("maps families onto the fonts the app ships", () => {
    expect(resolveFontFile({ family: "sans" })).toBe("PlusJakartaSans[wght].ttf");
    expect(resolveFontFile({ family: "sans", italic: true })).toBe("PlusJakartaSans-Italic[wght].ttf");
    expect(resolveFontFile({ family: "mono" })).toBe("JetBrainsMono[wght].ttf");
    // No serif face ships, so serif borrows the sans one.
    expect(resolveFontFile({ family: "serif" })).toBe("PlusJakartaSans[wght].ttf");
  });
});

describe("missingGlyphs", () => {
  it("accepts Latin Extended and symbols, rejects scripts the font lacks", async () => {
    await expect(missingGlyphs("Halo → naïve ćčžšđ €", { family: "sans" })).resolves.toEqual([]);
    await expect(missingGlyphs("日本語 α", { family: "sans" })).resolves.toEqual(["日", "本", "語", "α"]);
  });

  it("reports every character when the font cannot be loaded", async () => {
    setUnicodeFontLoader(async () => { throw new Error("offline"); });
    await expect(missingGlyphs("ab", { family: "sans" })).resolves.toEqual(["a", "b"]);
  });
});

describe("embedUnicodeFont", () => {
  it("embeds a subset and reuses it for the same document", async () => {
    const doc = await PDFDocument.create();
    const first = await embedUnicodeFont(doc, { family: "sans" });
    const second = await embedUnicodeFont(doc, { family: "sans" });
    expect(first).toBe(second);
    expect(first.widthOfTextAtSize("A", 100)).toBeGreaterThan(0);
  });

  it("embeds a heavier cut when bold is requested", async () => {
    const doc = await PDFDocument.create();
    const regular = await embedUnicodeFont(doc, { family: "sans" });
    const bold = await embedUnicodeFont(doc, { family: "sans", bold: true });
    expect(bold).not.toBe(regular);
    // The bold instance of the variable font is wider than the regular one.
    expect(bold.widthOfTextAtSize("Halo dunia", 100)).toBeGreaterThan(regular.widthOfTextAtSize("Halo dunia", 100));
  });

  it("returns null instead of throwing when the font file is unavailable", async () => {
    setUnicodeFontLoader(async () => { throw new Error("offline"); });
    const doc = await PDFDocument.create();
    await expect(embedUnicodeFont(doc, { family: "sans" })).resolves.toBeNull();
  });
});

describe("resolveTextFont", () => {
  const standardFont = (doc) => () => doc.embedFont(StandardFonts.Helvetica);

  it("keeps the standard font for text that fits WinAnsi", async () => {
    const doc = await PDFDocument.create();
    const result = await resolveTextFont(doc, "Halo dunia", { family: "sans" }, { standardFont: standardFont(doc), sanitize: sanitizeWinAnsiText });
    expect(result.embedded).toBe(false);
    expect(result.dropped).toBe(0);
    expect(result.text).toBe("Halo dunia");
  });

  it("switches to the embedded font when the text needs it", async () => {
    const doc = await PDFDocument.create();
    const result = await resolveTextFont(doc, "Naïve → ćčžšđ", { family: "sans" }, { standardFont: standardFont(doc), sanitize: sanitizeWinAnsiText });
    expect(result.embedded).toBe(true);
    expect(result.dropped).toBe(0);
    expect(result.text).toBe("Naïve → ćčžšđ");
  });

  it("drops only what no font can draw", async () => {
    const doc = await PDFDocument.create();
    const result = await resolveTextFont(doc, "Rapat 日本 selesai →", { family: "sans" }, { standardFont: standardFont(doc), sanitize: sanitizeWinAnsiText });
    expect(result.embedded).toBe(true);
    expect(result.dropped).toBe(2);
    expect(result.text).toBe("Rapat  selesai →");
  });

  it("falls back to WinAnsi when the font file cannot be fetched", async () => {
    setUnicodeFontLoader(async () => { throw new Error("offline"); });
    const doc = await PDFDocument.create();
    const result = await resolveTextFont(doc, "Naïve → ćčžšđ", { family: "sans" }, { standardFont: standardFont(doc), sanitize: sanitizeWinAnsiText });
    expect(result.embedded).toBe(false);
    expect(result.dropped).toBe(6);
  });
});
