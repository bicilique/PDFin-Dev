import { beforeAll, describe, expect, it } from "vitest";
import { getSvgDimensions, renderMermaidSvg } from "./mermaidRenderer.js";

describe("renderMermaidSvg", () => {
  beforeAll(() => {
    // Mermaid measures SVG text in browsers; jsdom does not implement these APIs.
    SVGElement.prototype.getBBox ||= () => ({ x: 0, y: 0, width: 80, height: 20 });
    SVGElement.prototype.getComputedTextLength ||= () => 80;
  });

  it("renders a valid diagram to a self-contained SVG", async () => {
    const svg = await renderMermaidSvg("flowchart LR\n  A --> B");

    expect(svg).toMatch(/^<svg[^>]*[\s>]/);
    expect(svg).toContain("flowchart");
    expect(svg).not.toMatch(/<script/i);
  });

  it("rejects invalid Mermaid syntax", async () => {
    await expect(renderMermaidSvg("this is not a diagram"))
      .rejects.toThrow();
  });
});

describe("getSvgDimensions", () => {
  it("fits a diagram to the available width while preserving its aspect ratio", () => {
    const svg = '<svg viewBox="0 0 1200 480" width="1200" height="480"></svg>';

    expect(getSvgDimensions(svg, 500)).toEqual({ width: 500, height: 200 });
  });

  it("uses explicit dimensions when the SVG has no viewBox", () => {
    const svg = '<svg width="320px" height="180px"></svg>';

    expect(getSvgDimensions(svg, 500)).toEqual({ width: 320, height: 180 });
  });
});
