import { afterEach, describe, expect, it } from "vitest";
import { PDFDocument, degrees } from "pdf-lib";
import { PdfEngine } from "./pdfEngine.js";
import {
  annotatePdfs,
  countUnsupportedCharacters,
  sanitizeWinAnsiText,
  visibleSize,
  visibleToUserMatrix,
} from "./pdfAnnotate.js";

// 1x1 transparent PNG, used as a stand-in placed image.
const PNG_1X1 = Uint8Array.from(
  atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="),
  (c) => c.charCodeAt(0)
);

async function makePdf(pageCount = 1, rotation = 0) {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i += 1) {
    const page = doc.addPage([300, 200]);
    if (rotation) page.setRotation(degrees(rotation));
  }
  return doc.save();
}

function seedFile(id, name, bytes) {
  PdfEngine.files.set(id, { id, name, size: bytes.length, bytes });
}

function textObject(overrides = {}) {
  return {
    id: "o1", fileId: "e-1", srcIndex: 0, type: "text",
    rect: { x: 0.1, y: 0.1, w: 0.6, h: 0.1 },
    text: "Halo dunia", sizePct: 0.05, color: "#111827", fontFamily: "sans",
    ...overrides,
  };
}

describe("sanitizeWinAnsiText", () => {
  it("folds typographic look-alikes to WinAnsi-safe ASCII", () => {
    const { text, dropped } = sanitizeWinAnsiText("“Halo” — dunia…");
    expect(text).toBe('"Halo" - dunia...');
    expect(dropped).toBe(0);
  });

  it("keeps Latin-1 accents but reports unsupported code points", () => {
    const { text, dropped } = sanitizeWinAnsiText("Café 日本語");
    expect(text).toBe("Café ");
    expect(dropped).toBe(3);
  });

  it("counts only characters the embedded font also lacks", async () => {
    // "日本" is outside both WinAnsi and the bundled font; "é" and "→" are not
    // WinAnsi-drawable everywhere but the embedded font covers them.
    const objects = [textObject({ text: "日本 é →" }), { type: "rect", rect: {} }];
    await expect(countUnsupportedCharacters(objects)).resolves.toBe(2);
  });

  it("reports nothing unsupported for text the standard fonts already cover", async () => {
    await expect(countUnsupportedCharacters([textObject({ text: "Halo dunia" })])).resolves.toBe(0);
  });
});

describe("visible page mapping", () => {
  it("swaps dimensions for quarter-turn rotations", () => {
    expect(visibleSize(300, 200, 90)).toEqual({ width: 200, height: 300, angle: 90 });
    expect(visibleSize(300, 200, 180)).toEqual({ width: 300, height: 200, angle: 180 });
    expect(visibleSize(300, 200, -90)).toEqual({ width: 200, height: 300, angle: 270 });
  });

  it("maps visible-space corners onto user space for each rotation", () => {
    const apply = ([a, b, c, d, e, f], x, y) => [a * x + c * y + e, b * x + d * y + f];
    // Visible bottom-left corner of a 90°-rotated 300x200 page (visible box is
    // 200 wide, 300 tall) is the user-space bottom-right corner.
    expect(apply(visibleToUserMatrix(300, 200, 90), 0, 0)).toEqual([300, 0]);
    expect(apply(visibleToUserMatrix(300, 200, 180), 0, 0)).toEqual([300, 200]);
    expect(apply(visibleToUserMatrix(300, 200, 270), 0, 0)).toEqual([0, 200]);
    expect(apply(visibleToUserMatrix(300, 200, 0), 12, 34)).toEqual([12, 34]);
  });
});

describe("annotatePdfs", () => {
  afterEach(() => {
    PdfEngine.files.clear();
  });

  it("stamps objects and keeps the page count", async () => {
    seedFile("e-1", "kontrak.pdf", await makePdf(2));
    const result = await annotatePdfs(
      [{ id: "e-1", name: "kontrak.pdf" }],
      { objects: [textObject()] },
      null
    );
    expect(result.outputs.map((o) => o.name)).toEqual(["kontrak-diedit.pdf"]);
    expect(result.outputs[0].pages).toBe(2);
    expect(result.droppedCharacters).toBe(0);
  });

  it("embeds a Unicode font so text beyond WinAnsi is drawn, not dropped", async () => {
    seedFile("e-1", "kontrak.pdf", await makePdf(1));
    const plain = await annotatePdfs(
      [{ id: "e-1", name: "kontrak.pdf" }],
      { objects: [textObject({ text: "Ringkasan" })] },
      null
    );
    const unicode = await annotatePdfs(
      [{ id: "e-1", name: "kontrak.pdf" }],
      { objects: [textObject({ text: "Ringkasan → naïve ćčžšđ" })] },
      null
    );
    expect(unicode.droppedCharacters).toBe(0);
    // The subset font only rides along when the text actually needs it.
    expect(unicode.outputs[0].size).toBeGreaterThan(plain.outputs[0].size);
  });

  it("still reports characters no bundled font can draw", async () => {
    seedFile("e-1", "kontrak.pdf", await makePdf(1));
    const result = await annotatePdfs(
      [{ id: "e-1", name: "kontrak.pdf" }],
      { objects: [textObject({ text: "Ringkasan 日本語" })] },
      null
    );
    expect(result.droppedCharacters).toBe(3);
    expect(result.outputs).toHaveLength(1);
  });

  it("draws every object type on a rotated page without failing", async () => {
    seedFile("e-1", "scan.pdf", await makePdf(1, 90));
    const objects = [
      textObject(),
      { id: "o2", fileId: "e-1", srcIndex: 0, type: "image", rect: { x: 0.1, y: 0.5, w: 0.2, h: 0.2 }, source: { bytes: PNG_1X1, type: "image/png", aspect: 1 } },
      { id: "o3", fileId: "e-1", srcIndex: 0, type: "rect", rect: { x: 0.2, y: 0.2, w: 0.3, h: 0.1 }, fill: "#ffffff", stroke: "#000000", strokeWidth: 1 },
      { id: "o4", fileId: "e-1", srcIndex: 0, type: "ellipse", rect: { x: 0.3, y: 0.3, w: 0.2, h: 0.2 }, stroke: "#e11d48", strokeWidth: 2 },
      { id: "o5", fileId: "e-1", srcIndex: 0, type: "highlight", rect: { x: 0.1, y: 0.7, w: 0.4, h: 0.04 }, fill: "#ffe066" },
      { id: "o6", fileId: "e-1", srcIndex: 0, type: "line", from: { x: 0.1, y: 0.9 }, to: { x: 0.8, y: 0.9 }, stroke: "#111827", strokeWidth: 2, arrow: true },
      { id: "o7", fileId: "e-1", srcIndex: 0, type: "draw", points: [{ x: 0.1, y: 0.5 }, { x: 0.2, y: 0.55 }, { x: 0.3, y: 0.5 }], stroke: "#128fa6", strokeWidth: 3 },
    ];
    const result = await annotatePdfs([{ id: "e-1", name: "scan.pdf" }], { objects }, null);
    expect(result.outputs).toHaveLength(1);
    const reloaded = await PDFDocument.load(await result.outputs[0].blob.arrayBuffer());
    // Rotation must survive the CTM wrapper we push around the drawn objects.
    expect(reloaded.getPage(0).getRotation().angle).toBe(90);
  });

  it("clamps out-of-range page indexes and ignores unknown object types", async () => {
    seedFile("e-1", "satu.pdf", await makePdf(1));
    const result = await annotatePdfs(
      [{ id: "e-1", name: "satu.pdf" }],
      { objects: [textObject({ srcIndex: 9 }), { id: "x", fileId: "e-1", srcIndex: 0, type: "bogus" }] },
      null
    );
    expect(result.outputs[0].pages).toBe(1);
  });

  it("uses the custom output name and suffixes batches", async () => {
    const bytes = await makePdf(1);
    seedFile("e-1", "a.pdf", bytes);
    seedFile("e-2", "b.pdf", bytes);
    const result = await annotatePdfs(
      [{ id: "e-1", name: "a.pdf" }, { id: "e-2", name: "b.pdf" }],
      { objects: [textObject()], outputName: "hasil" },
      null
    );
    expect(result.outputs.map((o) => o.name)).toEqual(["hasil-1.pdf", "hasil-2.pdf"]);
  });
});
