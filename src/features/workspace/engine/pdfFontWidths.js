import { PDFArray, PDFDict, PDFName, PDFNumber, StandardFonts } from "pdf-lib";
import { cssFontStack, identifyFont } from "./fontCatalog.js";

// PDFin workspace — glyph width lookup for content-stream geometry.
//
// Redaction needs to know where each glyph sits, which means decoding the
// string bytes of a text-showing operator into codes and knowing each code's
// advance width. Anything we cannot resolve confidently reports
// `supported: false` so the caller can fall back to a method that is safe by
// construction (rasterizing the page) rather than guessing.

// WinAnsi code -> Unicode for the 0x80–0x9F block; every other printable code
// in WinAnsi matches Latin-1.
const WIN_ANSI_HIGH = {
  128: 0x20ac, 130: 0x201a, 131: 0x0192, 132: 0x201e, 133: 0x2026, 134: 0x2020,
  135: 0x2021, 136: 0x02c6, 137: 0x2030, 138: 0x0160, 139: 0x2039, 140: 0x0152,
  142: 0x017d, 145: 0x2018, 146: 0x2019, 147: 0x201c, 148: 0x201d, 149: 0x2022,
  150: 0x2013, 151: 0x2014, 152: 0x02dc, 153: 0x2122, 154: 0x0161, 155: 0x203a,
  156: 0x0153, 158: 0x017e, 159: 0x0178,
};

const STANDARD_FONT_BY_NAME = {
  helvetica: StandardFonts.Helvetica,
  "helvetica-bold": StandardFonts.HelveticaBold,
  "helvetica-oblique": StandardFonts.HelveticaOblique,
  "helvetica-boldoblique": StandardFonts.HelveticaBoldOblique,
  arial: StandardFonts.Helvetica,
  "arial-bold": StandardFonts.HelveticaBold,
  "times-roman": StandardFonts.TimesRoman,
  "times-bold": StandardFonts.TimesRomanBold,
  "times-italic": StandardFonts.TimesRomanItalic,
  "times-bolditalic": StandardFonts.TimesRomanBoldItalic,
  timesnewroman: StandardFonts.TimesRoman,
  courier: StandardFonts.Courier,
  "courier-bold": StandardFonts.CourierBold,
  "courier-oblique": StandardFonts.CourierOblique,
  "courier-boldoblique": StandardFonts.CourierBoldOblique,
};

export function winAnsiToUnicode(code) {
  if (code >= 32 && code <= 126) return code;
  if (code >= 160 && code <= 255) return code;
  return WIN_ANSI_HIGH[code] ?? null;
}

// Code <-> character maps for a simple font using a base encoding we can read.
// Used when a font has no ToUnicode CMap, which is the norm for the standard 14.
// `asciiOnly` is used for StandardEncoding, which agrees with WinAnsi over the
// printable ASCII range but diverges above it.
export function winAnsiMaps(asciiOnly = false) {
  const toUnicode = new Map();
  const fromUnicode = new Map();
  const last = asciiOnly ? 126 : 255;
  for (let code = 32; code <= last; code += 1) {
    const unicode = winAnsiToUnicode(code);
    if (unicode === null) continue;
    const char = String.fromCharCode(unicode);
    toUnicode.set(code, char);
    if (!fromUnicode.has(char)) fromUnicode.set(char, code);
  }
  return { toUnicode, fromUnicode, codeByteLength: 1 };
}

export function nameOf(value) {
  if (value instanceof PDFName) return value.asString().replace(/^\//, "");
  return null;
}

function numberOf(value) {
  if (value instanceof PDFNumber) return value.asNumber();
  return null;
}

function stripSubsetPrefix(baseFont) {
  return String(baseFont || "").replace(/^[A-Z]{6}\+/, "");
}

// Simple fonts may name their encoding directly or via a dictionary that can
// remap individual codes; a Differences array means code->glyph is no longer
// the base encoding, which we do not attempt to resolve.
export function readSimpleEncoding(fontDict) {
  const encoding = fontDict.lookup(PDFName.of("Encoding"));
  if (!encoding) return { name: "StandardEncoding", hasDifferences: false };
  const direct = nameOf(encoding);
  if (direct) return { name: direct, hasDifferences: false };
  if (encoding instanceof PDFDict) {
    const base = nameOf(encoding.lookup(PDFName.of("BaseEncoding"))) || "StandardEncoding";
    const differences = encoding.lookup(PDFName.of("Differences"));
    return { name: base, hasDifferences: differences instanceof PDFArray && differences.size() > 0 };
  }
  return { name: "StandardEncoding", hasDifferences: false };
}

function readWidthsArray(fontDict) {
  const widths = fontDict.lookup(PDFName.of("Widths"));
  const firstChar = numberOf(fontDict.lookup(PDFName.of("FirstChar")));
  if (!(widths instanceof PDFArray) || firstChar === null) return null;
  const table = new Map();
  for (let index = 0; index < widths.size(); index += 1) {
    const width = numberOf(widths.lookup(index));
    if (width !== null) table.set(firstChar + index, width / 1000);
  }
  return table.size ? table : null;
}

function readMissingWidth(fontDict) {
  const descriptor = fontDict.lookup(PDFName.of("FontDescriptor"));
  if (!(descriptor instanceof PDFDict)) return null;
  const missing = numberOf(descriptor.lookup(PDFName.of("MissingWidth")));
  return missing === null ? null : missing / 1000;
}

// CID font widths: W is [ c [w1 w2 …] | cFirst cLast w ]*
function readCidWidths(descendant) {
  const table = new Map();
  const widths = descendant.lookup(PDFName.of("W"));
  if (widths instanceof PDFArray) {
    let index = 0;
    while (index < widths.size()) {
      const first = numberOf(widths.lookup(index));
      const second = widths.lookup(index + 1);
      if (first === null) break;
      if (second instanceof PDFArray) {
        for (let offset = 0; offset < second.size(); offset += 1) {
          const width = numberOf(second.lookup(offset));
          if (width !== null) table.set(first + offset, width / 1000);
        }
        index += 2;
        continue;
      }
      const last = numberOf(second);
      const width = numberOf(widths.lookup(index + 2));
      if (last === null || width === null) break;
      // Guard against absurd ranges in malformed files.
      const span = Math.min(last - first, 65535);
      for (let code = 0; code <= span; code += 1) table.set(first + code, width / 1000);
      index += 3;
    }
  }
  const defaultWidth = numberOf(descendant.lookup(PDFName.of("DW")));
  return { table, defaultWidth: defaultWidth === null ? 1 : defaultWidth / 1000 };
}

const EMPTY_DESCRIPTION = {
  subtype: "", baseFont: "", serif: false, bold: false, italic: false, fixedPitch: false,
  family: "sans", id: "", label: "", styleLabel: "", css: cssFontStack({ family: "sans" }),
  weight: 400, symbolic: false, matched: false,
};

// Summary used to preview an edit in something close to the original typeface
// and to pick a visually close replacement font when an edit cannot be
// re-encoded into the font the page already carries.
//
// The BaseFont name is read against the popular-font catalog first, because it
// is the only place a document says "this is Calibri Light" or "this is Georgia
// Bold Italic". The descriptor's own flags then fill in or override whatever the
// name did not say — they are authoritative when present.
export function describeFont(fontDict) {
  if (!(fontDict instanceof PDFDict)) return { ...EMPTY_DESCRIPTION };
  const baseFont = stripSubsetPrefix(nameOf(fontDict.lookup(PDFName.of("BaseFont"))) || "");
  const identified = identifyFont(baseFont);
  let descriptor = fontDict.lookup(PDFName.of("FontDescriptor"));
  if (!(descriptor instanceof PDFDict)) {
    const descendants = fontDict.lookup(PDFName.of("DescendantFonts"));
    const descendant = descendants instanceof PDFArray ? descendants.lookup(0) : null;
    descriptor = descendant instanceof PDFDict ? descendant.lookup(PDFName.of("FontDescriptor")) : null;
  }
  const hasDescriptor = descriptor instanceof PDFDict;
  const flags = hasDescriptor ? (numberOf(descriptor.lookup(PDFName.of("Flags"))) || 0) : 0;
  const italicAngle = hasDescriptor ? (numberOf(descriptor.lookup(PDFName.of("ItalicAngle"))) || 0) : 0;
  const stemV = hasDescriptor ? (numberOf(descriptor.lookup(PDFName.of("StemV"))) || 0) : 0;
  const declaredWeight = hasDescriptor ? (numberOf(descriptor.lookup(PDFName.of("FontWeight"))) || 0) : 0;

  // Flag bit 2 is serif, bit 1 is fixed pitch, bit 7 is italic, bit 3 is
  // symbolic (1-based).
  const fixedPitch = !!(flags & 0b1) || identified.fixedPitch;
  const serif = !fixedPitch && (!!(flags & 0b10) || identified.serif);
  const weight = declaredWeight || (identified.weight !== 400 ? identified.weight : stemV >= 120 ? 700 : 400);
  const family = fixedPitch ? "mono" : serif ? "serif" : identified.family === "mono" || identified.family === "serif" ? "sans" : identified.family;

  return {
    subtype: nameOf(fontDict.lookup(PDFName.of("Subtype"))) || "",
    baseFont,
    serif,
    fixedPitch,
    bold: weight >= 600,
    italic: !!(flags & 0b1000000) || italicAngle !== 0 || identified.italic,
    // Everything the catalog could tell us about the typeface itself.
    family,
    id: identified.id,
    label: identified.label,
    styleLabel: identified.styleLabel,
    css: identified.matched ? identified.css : cssFontStack({ family }),
    weight,
    symbolic: identified.symbolic || !!(flags & 0b100),
    matched: identified.matched,
  };
}

function unsupported(reason) {
  return { supported: false, reason, decode: () => [] };
}

/**
 * Builds a decoder for one font resource.
 *
 * `standardFontWidth(baseFont, unicode)` supplies fallback metrics for the 14
 * standard fonts, which are routinely embedded without a /Widths array.
 * Returns `{ supported, reason, decode(bytes) }` where decode yields
 * `[{ code, width, isSingleByteSpace }]` with width in text-space units.
 */
export function buildFontDecoder(fontDict, standardFontWidth) {
  if (!(fontDict instanceof PDFDict)) return unsupported("missing-font");
  const subtype = nameOf(fontDict.lookup(PDFName.of("Subtype")));
  if (subtype === "Type3") return unsupported("type3-font");

  if (subtype === "Type0") {
    const encoding = nameOf(fontDict.lookup(PDFName.of("Encoding")));
    if (encoding !== "Identity-H" && encoding !== "Identity-V") return unsupported("cmap-encoding");
    const descendants = fontDict.lookup(PDFName.of("DescendantFonts"));
    const descendant = descendants instanceof PDFArray ? descendants.lookup(0) : null;
    if (!(descendant instanceof PDFDict)) return unsupported("missing-descendant");
    const { table, defaultWidth } = readCidWidths(descendant);
    return {
      supported: true,
      reason: "",
      decode(bytes) {
        const glyphs = [];
        for (let index = 0; index + 1 < bytes.length; index += 2) {
          const code = (bytes[index] << 8) | bytes[index + 1];
          glyphs.push({ code, width: table.has(code) ? table.get(code) : defaultWidth, isSingleByteSpace: false });
        }
        return glyphs;
      },
    };
  }

  const widths = readWidthsArray(fontDict);
  const missingWidth = readMissingWidth(fontDict);
  if (widths) {
    return {
      supported: true,
      reason: "",
      decode(bytes) {
        return Array.from(bytes, (code) => ({
          code,
          width: widths.has(code) ? widths.get(code) : (missingWidth ?? 0.5),
          isSingleByteSpace: code === 32,
        }));
      },
    };
  }

  // No /Widths: only the standard 14 fonts are safe to reconstruct, and only
  // when the code->glyph mapping is an encoding we can read.
  const baseFont = stripSubsetPrefix(nameOf(fontDict.lookup(PDFName.of("BaseFont"))));
  const standardFont = STANDARD_FONT_BY_NAME[String(baseFont).toLowerCase()];
  if (!standardFont) return unsupported("unknown-font-metrics");
  const encoding = readSimpleEncoding(fontDict);
  if (encoding.hasDifferences) return unsupported("encoding-differences");
  if (encoding.name !== "WinAnsiEncoding" && encoding.name !== "StandardEncoding") return unsupported("encoding-unsupported");
  if (!standardFontWidth) return unsupported("no-standard-metrics");

  return {
    supported: true,
    reason: "",
    decode(bytes) {
      return Array.from(bytes, (code) => {
        const unicode = winAnsiToUnicode(code);
        const width = unicode === null ? null : standardFontWidth(standardFont, String.fromCharCode(unicode));
        return {
          code,
          width: width === null || width === undefined ? 0.5 : width,
          isSingleByteSpace: code === 32,
        };
      });
    },
  };
}

// Cached width probe over pdf-lib's standard-font metrics.
export function createStandardFontWidthProvider(doc) {
  const fonts = new Map();
  const widths = new Map();
  return (standardFont, char) => {
    const cacheKey = `${standardFont}:${char}`;
    if (widths.has(cacheKey)) return widths.get(cacheKey);
    try {
      if (!fonts.has(standardFont)) fonts.set(standardFont, doc.embedStandardFont(standardFont));
      const width = fonts.get(standardFont).widthOfTextAtSize(char, 1000) / 1000;
      widths.set(cacheKey, width);
      return width;
    } catch {
      widths.set(cacheKey, null);
      return null;
    }
  };
}
