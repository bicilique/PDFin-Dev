import { describe, expect, it } from "vitest";
import { cssFontStack, fontDisplayName, identifyFont, normalizeFontName, stripSubsetTag } from "./fontCatalog.js";

describe("identifyFont", () => {
  it("reads the families office documents actually use", () => {
    expect(identifyFont("Calibri").id).toBe("calibri");
    expect(identifyFont("SegoeUI").id).toBe("segoeui");
    expect(identifyFont("Verdana").id).toBe("verdana");
    expect(identifyFont("TrebuchetMS").id).toBe("trebuchet");
    expect(identifyFont("Georgia").family).toBe("serif");
    expect(identifyFont("Consolas").family).toBe("mono");
  });

  it("looks through subset tags and foundry suffixes", () => {
    const arial = identifyFont("ABCDEF+ArialMT");
    expect(arial.id).toBe("arial");
    expect(arial.matched).toBe(true);
    expect(arial.weight).toBe(400);

    const times = identifyFont("XYZABC+TimesNewRomanPS-BoldItalicMT");
    expect(times.id).toBe("times");
    expect(times.family).toBe("serif");
    expect(times.bold).toBe(true);
    expect(times.italic).toBe(true);
    expect(times.styleLabel).toBe("Bold Italic");
  });

  it("reads weight words rather than only bold", () => {
    expect(identifyFont("Calibri-Light").weight).toBe(300);
    expect(identifyFont("SegoeUI-Semibold").weight).toBe(600);
    expect(identifyFont("Roboto-Medium").weight).toBe(500);
    expect(identifyFont("OpenSans-ExtraBold").weight).toBe(800);
    expect(identifyFont("Lato-Black").weight).toBe(900);
    // A light face is not a bold face, however emphatic the name looks.
    expect(identifyFont("Montserrat-Light").bold).toBe(false);
    expect(identifyFont("Montserrat-Bold").bold).toBe(true);
  });

  it("recognises italic spelled several ways", () => {
    expect(identifyFont("Helvetica-Oblique").italic).toBe(true);
    expect(identifyFont("Georgia,Italic").italic).toBe(true);
    expect(identifyFont("MinionPro-It").italic).toBe(true);
    expect(identifyFont("Verdana").italic).toBe(false);
  });

  it("keeps width variants out of the weight", () => {
    const narrow = identifyFont("ArialNarrow-Bold");
    expect(narrow.id).toBe("arial");
    expect(narrow.stretch).toBe("condensed");
    expect(narrow.weight).toBe(700);
  });

  it("gives every recognised family a CSS stack that names it", () => {
    expect(identifyFont("Calibri").css).toMatch(/Calibri/);
    expect(identifyFont("CourierNew").css).toMatch(/Courier/);
    expect(cssFontStack(identifyFont("JetBrainsMono"))).toMatch(/JetBrains/);
  });

  it("still describes fonts it does not know", () => {
    const unknown = identifyFont("AcmeGrotesk-Bold");
    expect(unknown.matched).toBe(false);
    expect(unknown.id).toBe("");
    expect(unknown.label).toBe("Acme Grotesk Bold");
    expect(unknown.bold).toBe(true);
    expect(unknown.family).toBe("sans");
    expect(unknown.css).toMatch(/sans-serif/);

    // Shape hints in the name are still worth reading.
    expect(identifyFont("SomethingMono").family).toBe("mono");
    expect(identifyFont("OldStyleSerif").family).toBe("serif");
  });

  it("flags symbol faces", () => {
    expect(identifyFont("Wingdings-Regular").symbolic).toBe(true);
    expect(identifyFont("ZapfDingbats").symbolic).toBe(true);
    expect(identifyFont("Arial").symbolic).toBe(false);
  });
});

describe("fontDisplayName", () => {
  it("names the typeface the way a reader would", () => {
    expect(fontDisplayName(identifyFont("Calibri-Bold"))).toBe("Calibri Bold");
    expect(fontDisplayName(identifyFont("Arial"))).toBe("Arial");
    expect(fontDisplayName({})).toBe("");
  });
});

describe("name helpers", () => {
  it("normalizes and strips subset tags", () => {
    expect(normalizeFontName("Times New Roman")).toBe("timesnewroman");
    expect(stripSubsetTag("ABCDEF+Calibri")).toBe("Calibri");
    expect(stripSubsetTag("Calibri")).toBe("Calibri");
  });
});
