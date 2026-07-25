import { describe, expect, it } from "vitest";
import * as pdfjsLib from "pdfjs-dist";
import { colorLookup, extractPageGraphics, resolveFontNames } from "./pdfVector.js";
import { solidPng } from "./solidPng.js";

const OPS = pdfjsLib.OPS;

function operatorPage(entries) {
  return {
    getOperatorList: async () => ({
      fnArray: entries.map((entry) => entry[0]),
      argsArray: entries.map((entry) => entry[1] ?? null),
    }),
  };
}

const rectangle = (x, y, width, height) => [OPS.constructPath, [[OPS.rectangle], [x, y, width, height], []]];

describe("extractPageGraphics", () => {
  it("returns a filled rectangle positioned from the top-left of the page", async () => {
    const page = operatorPage([
      [OPS.setFillRGBColor, [47, 49, 64]],
      rectangle(72, 700, 200, 20),
      [OPS.fill, null],
    ]);

    const { shapes } = await extractPageGraphics(page, 595, 842);

    expect(shapes).toEqual([{ left: 72, top: 122, width: 200, height: 20, color: "2F3140" }]);
  });

  it("trims fills to the active clip region and drops a white page backdrop", async () => {
    const page = operatorPage([
      [OPS.setFillRGBColor, [255, 255, 255]],
      rectangle(0, 0, 595, 842),
      [OPS.fill, null],
      [OPS.save, null],
      rectangle(50, 50, 200, 100),
      [OPS.eoClip, null],
      [OPS.endPath, null],
      [OPS.setFillRGBColor, [23, 28, 44]],
      rectangle(-45, -45, 900, 1000),
      [OPS.fill, null],
      [OPS.restore, null],
    ]);

    const { shapes } = await extractPageGraphics(page, 595, 842);

    expect(shapes).toEqual([{ left: 50, top: 692, width: 200, height: 100, color: "171C2C" }]);
  });

  it("ignores pattern fills, which have no flat colour to paint", async () => {
    const page = operatorPage([
      [OPS.setFillColorN, ["TilingPattern", null, {}]],
      rectangle(10, 10, 100, 100),
      [OPS.fill, null],
    ]);

    const { shapes } = await extractPageGraphics(page, 595, 842);

    expect(shapes).toEqual([]);
  });

  it("keeps a hairline stroke as a thin rule", async () => {
    const page = operatorPage([
      [OPS.setStrokeRGBColor, [200, 200, 200]],
      [OPS.setLineWidth, [0.75]],
      [OPS.constructPath, [[OPS.moveTo, OPS.lineTo], [72, 400, 500, 400], []]],
      [OPS.stroke, null],
    ]);

    const { shapes } = await extractPageGraphics(page, 595, 842);

    expect(shapes).toHaveLength(1);
    expect(shapes[0].width).toBeCloseTo(428, 5);
    expect(shapes[0].height).toBeCloseTo(0.75, 5);
    expect(shapes[0].color).toBe("C8C8C8");
  });

  it("skips glyph-sized polygons from vector wordmarks", async () => {
    const page = operatorPage([
      [OPS.setFillRGBColor, [250, 250, 250]],
      [OPS.constructPath, [[OPS.moveTo, OPS.lineTo, OPS.lineTo, OPS.lineTo, OPS.closePath], [100, 100, 102, 100, 102, 112, 100, 112], []]],
      [OPS.fill, null],
    ]);

    const { shapes } = await extractPageGraphics(page, 595, 842);

    expect(shapes).toEqual([]);
  });

  it("blends constant alpha towards white so the flat fill still reads correctly", async () => {
    const page = operatorPage([
      [OPS.setGState, [[["ca", 0.5]]]],
      [OPS.setFillRGBColor, [0, 0, 0]],
      rectangle(10, 10, 100, 100),
      [OPS.fill, null],
    ]);

    const { shapes } = await extractPageGraphics(page, 595, 842);

    expect(shapes[0].color).toBe("808080");
  });

  it("samples the fill colour in force while each text run is drawn", async () => {
    const page = operatorPage([
      [OPS.beginText, null],
      [OPS.setFillRGBColor, [184, 211, 185]],
      [OPS.setTextMatrix, [1, 0, 0, 1, 72, 600]],
      [OPS.showText, [[]]],
      [OPS.setFillRGBColor, [21, 25, 39]],
      [OPS.moveText, [0, -20]],
      [OPS.showText, [[]]],
      [OPS.endText, null],
    ]);

    const { textColors } = await extractPageGraphics(page, 595, 842);
    const colorAt = colorLookup(textColors);

    expect(colorAt(72, 600)).toBe("B8D3B9");
    expect(colorAt(72, 580)).toBe("151927");
    expect(colorAt(400, 300)).toBeNull();
  });

  it("skips invisible OCR text layers when sampling colours", async () => {
    const page = operatorPage([
      [OPS.beginText, null],
      [OPS.setTextRenderingMode, [3]],
      [OPS.setTextMatrix, [1, 0, 0, 1, 72, 600]],
      [OPS.showText, [[]]],
      [OPS.endText, null],
    ]);

    const { textColors } = await extractPageGraphics(page, 595, 842);

    expect(textColors).toEqual([]);
  });

  it("survives pages without an operator list", async () => {
    await expect(extractPageGraphics({}, 595, 842)).resolves.toEqual({ shapes: [], textColors: [] });
  });
});

describe("resolveFontNames", () => {
  it("reads the embedded PostScript name behind a pdf.js font id", () => {
    const page = {
      commonObjs: {
        has: (key) => key === "g_d0_f1",
        get: () => ({ name: "AAAAAA+Inter-Regular_Bold" }),
      },
    };

    expect(resolveFontNames(page, { g_d0_f1: {}, g_d0_f2: {} })).toEqual({
      g_d0_f1: "AAAAAA+Inter-Regular_Bold",
    });
  });
});

describe("solidPng", () => {
  it("emits a 1×1 PNG carrying the requested colour", () => {
    const png = solidPng("2F3140");

    expect([...png.slice(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(String.fromCharCode(...png.slice(12, 16))).toBe("IHDR");
    // Width and height are big-endian 32 bit values right after the IHDR tag.
    expect([...png.slice(16, 24)]).toEqual([0, 0, 0, 1, 0, 0, 0, 1]);
    expect(solidPng("2F3140")).toBe(png);
  });
});
