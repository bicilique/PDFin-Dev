import { describe, expect, it, vi } from "vitest";
import { renderArtRegions } from "./pdfArtRaster.js";

function rasterPage({ onRender } = {}) {
  return {
    getViewport: ({ scale }) => ({ width: 595 * scale, height: 842 * scale, scale }),
    render: vi.fn((options) => {
      onRender?.(options);
      return { promise: Promise.resolve() };
    }),
  };
}

describe("renderArtRegions", () => {
  it("crops one image per region at the region's position on the page", async () => {
    const page = rasterPage();

    const images = await renderArtRegions(page, [
      { left: 400, top: 58, width: 24, height: 24 },
      { left: 72, top: 300, width: 120, height: 40 },
    ], 595, 842);

    expect(images).toHaveLength(2);
    expect(images[0].left).toBeCloseTo(400, 1);
    expect(images[0].top).toBeCloseTo(58, 1);
    expect(images[0].width).toBeCloseTo(24, 1);
    expect(images[1].height).toBeCloseTo(40, 1);
    expect(images[0].data).toBeInstanceOf(Uint8Array);
  });

  it("renders on a transparent background so the crop carries only the artwork", async () => {
    let options = null;
    const page = rasterPage({ onRender: (value) => { options = value; } });

    await renderArtRegions(page, [{ left: 10, top: 10, width: 20, height: 20 }], 595, 842);

    expect(page.render).toHaveBeenCalledTimes(1);
    expect(options.background).toBe("rgba(0,0,0,0)");
  });

  it("suppresses text drawing, which the exporter re-creates as editable runs", async () => {
    let context = null;
    const page = rasterPage({ onRender: (value) => { context = value.canvasContext; } });
    const fillText = vi.fn();
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = () => ({ fillText, drawImage() {} });

    try {
      await renderArtRegions(page, [{ left: 10, top: 10, width: 20, height: 20 }], 595, 842);
      context.fillText("hello", 0, 0);
    } finally {
      HTMLCanvasElement.prototype.getContext = original;
    }

    expect(fillText).not.toHaveBeenCalled();
  });

  it("does nothing for a page that cannot be rendered", async () => {
    await expect(renderArtRegions({}, [{ left: 0, top: 0, width: 10, height: 10 }], 595, 842)).resolves.toEqual([]);
    await expect(renderArtRegions(rasterPage(), [], 595, 842)).resolves.toEqual([]);
  });

  it("keeps going when a single region fails to crop", async () => {
    const page = rasterPage();
    const original = HTMLCanvasElement.prototype.toBlob;
    let calls = 0;
    HTMLCanvasElement.prototype.toBlob = function toBlob(callback) {
      calls += 1;
      callback(calls === 1 ? null : new Blob(["png"], { type: "image/png" }));
    };

    try {
      const images = await renderArtRegions(page, [
        { left: 10, top: 10, width: 20, height: 20 },
        { left: 60, top: 10, width: 20, height: 20 },
      ], 595, 842);
      expect(images).toHaveLength(1);
    } finally {
      HTMLCanvasElement.prototype.toBlob = original;
    }
  });
});
