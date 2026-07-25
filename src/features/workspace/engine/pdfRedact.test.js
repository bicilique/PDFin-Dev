import { afterEach, describe, expect, it, vi } from "vitest";
import { PDFArray, PDFDocument, PDFName, PDFRawStream, StandardFonts, decodePDFRawStream, degrees, rgb } from "pdf-lib";
import { PdfEngine } from "./pdfEngine.js";
import { redactPdfs, areaToUserBox } from "./pdfRedact.js";
import { tokenizeContentStream } from "./contentStream.js";

const PAGE_WIDTH = 400;
const PAGE_HEIGHT = 300;

async function makeTextPdf({ rotation = 0, lines = [["RAHASIA 12345", 40, 200], ["Publik biasa", 40, 100]] } = {}) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  if (rotation) page.setRotation(degrees(rotation));
  for (const [text, x, y] of lines) page.drawText(text, { x, y, size: 14, font, color: rgb(0, 0, 0) });
  return doc.save();
}

function seedFile(id, name, bytes) {
  PdfEngine.files.set(id, { id, name, size: bytes.length, bytes, pageCount: 1 });
}

// Pulls every byte shown by a text operator back out of the produced PDF, which
// is what a copy/paste or text extractor would see.
async function extractShownText(blob) {
  const doc = await PDFDocument.load(new Uint8Array(await blob.arrayBuffer()));
  const page = doc.getPage(0);
  const contents = page.node.Contents();
  if (!contents) return "";
  const streams = contents instanceof PDFArray
    ? contents.asArray().map((ref) => doc.context.lookup(ref))
    : [contents];
  let text = "";
  for (const stream of streams) {
    if (!(stream instanceof PDFRawStream)) continue;
    const bytes = decodePDFRawStream(stream).decode();
    for (const { operator, operands } of tokenizeContentStream(bytes)) {
      if (operator !== "Tj" && operator !== "TJ" && operator !== "'" && operator !== "\"") continue;
      const last = operands[operands.length - 1];
      const items = last?.type === "array" ? last.items : [last];
      for (const item of items) {
        if (item?.type === "string") text += String.fromCharCode(...item.bytes);
      }
    }
  }
  return text;
}

// A rect covering the top-left region in visible space, where "RAHASIA 12345"
// sits on an unrotated page (y is measured from the top).
const SECRET_AREA = { fileId: "r-1", srcIndex: 0, rect: { x: 0.05, y: 0.25, w: 0.6, h: 0.15 } };

describe("areaToUserBox", () => {
  it("maps a visible-space rect to user space on an unrotated page", () => {
    const box = areaToUserBox({ rect: { x: 0, y: 0, w: 0.5, h: 0.5 } }, 400, 300, 0);
    expect(box.x0).toBeCloseTo(0, 5);
    expect(box.x1).toBeCloseTo(200 + 400 * 0.004, 5);
    expect(box.y1).toBeCloseTo(300, 5);
    expect(box.y0).toBeCloseTo(150 - 300 * 0.004, 5);
  });

  it("accounts for page rotation", () => {
    // On a 90°-rotated page the visible box is 300x400; the top-left quadrant
    // in visible space lands on the left edge in user space.
    const box = areaToUserBox({ rect: { x: 0, y: 0, w: 0.5, h: 0.5 } }, 400, 300, 90);
    expect(box.x0).toBeCloseTo(0, 5);
    expect(box.x1).toBeCloseTo(200 + 400 * 0.004, 5);
  });
});

describe("redactPdfs", () => {
  afterEach(() => {
    PdfEngine.files.clear();
  });

  it("removes covered glyphs from the content stream and keeps the rest", async () => {
    seedFile("r-1", "kontrak.pdf", await makeTextPdf());
    const result = await redactPdfs([{ id: "r-1", name: "kontrak.pdf" }], { areas: [SECRET_AREA] }, null);

    expect(result.outputs.map((o) => o.name)).toEqual(["kontrak-redaksi.pdf"]);
    expect(result.rasterizedPages).toEqual([]);
    expect(result.removedGlyphs).toBe("RAHASIA 12345".length);

    const shown = await extractShownText(result.outputs[0].blob);
    expect(shown).not.toContain("RAHASIA");
    expect(shown).not.toContain("12345");
    expect(shown).toContain("Publik biasa");
  });

  it("leaves the document untouched when no area covers text", async () => {
    seedFile("r-1", "kontrak.pdf", await makeTextPdf());
    const result = await redactPdfs(
      [{ id: "r-1", name: "kontrak.pdf" }],
      { areas: [{ fileId: "r-1", srcIndex: 0, rect: { x: 0.8, y: 0.85, w: 0.1, h: 0.1 } }] },
      null
    );
    expect(result.removedGlyphs).toBe(0);
    const shown = await extractShownText(result.outputs[0].blob);
    expect(shown).toContain("RAHASIA 12345");
    expect(shown).toContain("Publik biasa");
  });

  it("redacts the matching region on a rotated page", async () => {
    seedFile("r-1", "scan.pdf", await makeTextPdf({ rotation: 90 }));
    // With /Rotate 90 the visible box is 300x400 and the user-space text at
    // (40,200)-(x) appears along the visible right edge.
    const result = await redactPdfs(
      [{ id: "r-1", name: "scan.pdf" }],
      { areas: [{ fileId: "r-1", srcIndex: 0, rect: { x: 0.6, y: 0.05, w: 0.35, h: 0.6 } }] },
      null
    );
    expect(result.rasterizedPages).toEqual([]);
    const shown = await extractShownText(result.outputs[0].blob);
    expect(shown).not.toContain("RAHASIA");
    expect(shown).toContain("Publik biasa");
  });

  it("rasterizes the page when the caller asks for raster mode", async () => {
    seedFile("r-1", "kontrak.pdf", await makeTextPdf());
    const canvas = {
      toBlob: (callback) => callback(new Blob([PNG_1X1], { type: "image/png" })),
    };
    const renderPage = vi.fn(async () => canvas);
    const result = await redactPdfs(
      [{ id: "r-1", name: "kontrak.pdf" }],
      { areas: [SECRET_AREA], mode: "raster", renderPage },
      null
    );
    expect(renderPage).toHaveBeenCalledTimes(1);
    expect(result.rasterizedPages).toEqual([{ fileId: "r-1", pageIndex: 0, reason: "mode" }]);
    // Flattening drops every text operator, not just the covered ones.
    expect(await extractShownText(result.outputs[0].blob)).toBe("");
  });

  it("escalates to raster when a font's metrics cannot be resolved", async () => {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    page.drawText("RAHASIA 12345", { x: 40, y: 200, size: 14, font });
    const saved = await doc.save();

    // Rewrite the font resource into a Type3 font, which the walker refuses to
    // reason about.
    const reloaded = await PDFDocument.load(saved);
    const fonts = reloaded.getPage(0).node.Resources().lookup(PDFName.of("Font"));
    for (const [key] of fonts.asMap()) {
      fonts.lookup(key).set(PDFName.of("Subtype"), PDFName.of("Type3"));
    }
    seedFile("r-1", "aneh.pdf", await reloaded.save());

    const renderPage = vi.fn(async () => ({ toBlob: (callback) => callback(new Blob([PNG_1X1], { type: "image/png" })) }));
    const result = await redactPdfs([{ id: "r-1", name: "aneh.pdf" }], { areas: [SECRET_AREA], renderPage }, null);
    expect(result.rasterizedPages[0].reason).toBe("type3-font");
    expect(await extractShownText(result.outputs[0].blob)).toBe("");
  });

  it("drops annotations that overlap a redacted area", async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    const annots = doc.context.obj([
      doc.context.register(doc.context.obj({ Type: "Annot", Subtype: "Square", Rect: [40, 190, 200, 220] })),
      doc.context.register(doc.context.obj({ Type: "Annot", Subtype: "Square", Rect: [40, 20, 200, 50] })),
    ]);
    page.node.set(PDFName.of("Annots"), annots);
    seedFile("r-1", "beranotasi.pdf", await doc.save());

    const result = await redactPdfs([{ id: "r-1", name: "beranotasi.pdf" }], { areas: [SECRET_AREA] }, null);
    expect(result.removedAnnotations).toBe(1);
    const out = await PDFDocument.load(new Uint8Array(await result.outputs[0].blob.arrayBuffer()));
    expect(out.getPage(0).node.Annots().size()).toBe(1);
  });
});

// 1x1 transparent PNG used as the stand-in raster render.
const PNG_1X1 = Uint8Array.from(
  atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="),
  (c) => c.charCodeAt(0)
);
