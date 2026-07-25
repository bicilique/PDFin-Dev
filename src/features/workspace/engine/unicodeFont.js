import fontkit from "@pdf-lib/fontkit";

// PDFin workspace — Unicode text support for generated content.
//
// The 14 standard PDF fonts only cover WinAnsi, so anything outside Latin-1
// used to be dropped. When a piece of text needs more than that, we embed one
// of the app's own fonts instead — subset, so the output grows by a couple of
// kilobytes rather than the whole font file.
//
// Standard fonts stay the default whenever the text fits in WinAnsi: they need
// no embedding, and they carry real bold/italic/serif/monospace faces, which
// the variable fonts shipped here cannot all reproduce.

const FONT_FILES = {
  sans: "PlusJakartaSans[wght].ttf",
  sansItalic: "PlusJakartaSans-Italic[wght].ttf",
  mono: "JetBrainsMono[wght].ttf",
};

// The bundled fonts expose a weight axis; fontkit can instance it, and pdf-lib
// only ever calls `fontkit.create`, so a thin wrapper is enough to embed a
// bolder cut.
const BOLD_VARIATION = "Bold";

const byteCache = new Map();
const fontkitCache = new Map();
const embedCache = new WeakMap();

let loaderOverride = null;

async function loadFontBytes(fileName) {
  // `globalThis.__pdfinFontLoader` lets the test setup point at public/ without
  // importing this module (and therefore fontkit) into every test file.
  const override = loaderOverride || globalThis.__pdfinFontLoader;
  if (override) return override(fileName);
  const base = (typeof import.meta !== "undefined" && import.meta.env?.BASE_URL) || "/";
  const response = await fetch(`${base}fonts/${encodeURIComponent(fileName)}`);
  if (!response.ok) throw new Error(`FONT_FETCH_FAILED_${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
}

// Test seam for suites that need to simulate a specific loader outcome.
export function setUnicodeFontLoader(loader) {
  loaderOverride = loader;
  byteCache.clear();
  fontkitCache.clear();
}

export function resolveFontFile({ family = "sans", italic = false } = {}) {
  if (family === "mono") return FONT_FILES.mono;
  // No serif face ships with the app, so serif text falls back to the sans face.
  return italic ? FONT_FILES.sansItalic : FONT_FILES.sans;
}

async function fontBytes(fileName) {
  if (!byteCache.has(fileName)) byteCache.set(fileName, loadFontBytes(fileName));
  try {
    return await byteCache.get(fileName);
  } catch (error) {
    byteCache.delete(fileName);
    throw error;
  }
}

// Parsed font used for coverage questions ("can this face draw this character?").
async function fontkitFont(fileName) {
  if (!fontkitCache.has(fileName)) {
    fontkitCache.set(fileName, fontBytes(fileName).then((bytes) => fontkit.create(bytes)));
  }
  try {
    return await fontkitCache.get(fileName);
  } catch (error) {
    fontkitCache.delete(fileName);
    throw error;
  }
}

/**
 * Characters of `text` that the chosen embedded face cannot draw.
 * Returns every character when the font itself cannot be loaded, so callers
 * can fall back to the WinAnsi behaviour instead of silently producing blanks.
 */
export async function missingGlyphs(text, options = {}) {
  const characters = [...new Set([...String(text ?? "")])].filter((char) => char !== "\n" && char !== "\r");
  if (!characters.length) return [];
  let font;
  try {
    font = await fontkitFont(resolveFontFile(options));
  } catch {
    return characters;
  }
  return characters.filter((char) => {
    const codePoint = char.codePointAt(0);
    // Whitespace has no outline in some faces but is always renderable.
    if (codePoint === 32 || codePoint === 9) return false;
    return !font.hasGlyphForCodePoint(codePoint);
  });
}

/**
 * Embeds the app font into `doc` (subset) and returns a pdf-lib font, or null
 * when the font file cannot be loaded.
 */
export async function embedUnicodeFont(doc, options = {}) {
  const fileName = resolveFontFile(options);
  const bold = !!options.bold;
  const key = `${fileName}:${bold ? "bold" : "regular"}`;
  if (!embedCache.has(doc)) embedCache.set(doc, new Map());
  const perDoc = embedCache.get(doc);
  if (perDoc.has(key)) return perDoc.get(key);

  const embedding = (async () => {
    const bytes = await fontBytes(fileName);
    doc.registerFontkit({
      create: (data) => {
        const font = fontkit.create(data);
        if (!bold || typeof font.getVariation !== "function") return font;
        try {
          return font.getVariation(BOLD_VARIATION);
        } catch {
          return font;
        }
      },
    });
    return doc.embedFont(bytes, { subset: true });
  })().catch(() => null);

  perDoc.set(key, embedding);
  return embedding;
}

/**
 * Picks the font to draw `text` with.
 *
 * Returns `{ font, text, dropped, embedded }`: a standard font when the text
 * fits WinAnsi, an embedded subset when it does not, and — if neither can carry
 * a character — that character removed and counted in `dropped`.
 */
export async function resolveTextFont(doc, rawText, options, { standardFont, sanitize }) {
  const raw = String(rawText ?? "");
  const winAnsi = sanitize(raw);
  if (winAnsi.dropped === 0) {
    return { font: await standardFont(), text: winAnsi.text, dropped: 0, embedded: false };
  }

  const font = await embedUnicodeFont(doc, options);
  if (!font) return { font: await standardFont(), text: winAnsi.text, dropped: winAnsi.dropped, embedded: false };

  const missing = new Set(await missingGlyphs(raw, options));
  let text = "";
  let dropped = 0;
  for (const char of raw) {
    if (missing.has(char)) dropped += 1;
    else text += char;
  }
  return { font, text, dropped, embedded: true };
}
