// PDFin workspace — recognising the fonts a PDF actually uses.
//
// A PDF only tells us a BaseFont name such as `ABCDEF+TimesNewRomanPS-BoldMT`.
// Reading that name well is what lets the editor preview an edit in something
// close to the real typeface and pick a sensible substitute when the embedded
// font cannot carry the characters someone types.
//
// The catalog below covers the families that actually turn up in office and
// web-generated documents. Everything is plain data, so the table can grow
// without touching the matching logic.

const FAMILY_STACK = {
  sans: 'Helvetica, Arial, "Liberation Sans", sans-serif',
  serif: '"Times New Roman", Times, "Liberation Serif", serif',
  mono: '"Courier New", Courier, "Liberation Mono", monospace',
};

// `aliases` are compared against the font name with every separator removed, so
// "Times New Roman", "TimesNewRomanPSMT" and "Times-Roman" all reach the same
// entry. Longer aliases are tried first, which keeps "arialnarrow" from being
// swallowed by "arial".
const FONT_CATALOG = [
  // ---- Sans-serif: system and office ----
  { id: "helvetica", label: "Helvetica", family: "sans", css: 'Helvetica, "Helvetica Neue", Arial, sans-serif', aliases: ["helveticaneue", "helveticanow", "helvetica", "nimbussans", "swiss721"] },
  { id: "arial", label: "Arial", family: "sans", css: 'Arial, "Helvetica Neue", Helvetica, sans-serif', aliases: ["arialunicodems", "arialmt", "arial", "liberationsans", "arimo"] },
  { id: "arialblack", label: "Arial Black", family: "sans", weight: 900, css: '"Arial Black", Arial, sans-serif', aliases: ["arialblack"] },
  { id: "calibri", label: "Calibri", family: "sans", css: 'Calibri, Carlito, "Segoe UI", sans-serif', aliases: ["calibri", "carlito"] },
  { id: "segoeui", label: "Segoe UI", family: "sans", css: '"Segoe UI", Tahoma, sans-serif', aliases: ["segoeuivariable", "segoeui", "segoe"] },
  { id: "tahoma", label: "Tahoma", family: "sans", css: 'Tahoma, Verdana, sans-serif', aliases: ["tahoma"] },
  { id: "verdana", label: "Verdana", family: "sans", css: 'Verdana, Geneva, "DejaVu Sans", sans-serif', aliases: ["verdana", "dejavusans", "bitstreamverasans"] },
  { id: "trebuchet", label: "Trebuchet MS", family: "sans", css: '"Trebuchet MS", Tahoma, sans-serif', aliases: ["trebuchetms", "trebuchet"] },
  { id: "candara", label: "Candara", family: "sans", css: 'Candara, "Segoe UI", sans-serif', aliases: ["candara"] },
  { id: "corbel", label: "Corbel", family: "sans", css: 'Corbel, "Segoe UI", sans-serif', aliases: ["corbel"] },
  { id: "centurygothic", label: "Century Gothic", family: "sans", css: '"Century Gothic", "URW Gothic", sans-serif', aliases: ["centurygothic", "urwgothic"] },
  { id: "franklingothic", label: "Franklin Gothic", family: "sans", css: '"Franklin Gothic", "Libre Franklin", sans-serif', aliases: ["franklingothic", "librefranklin", "itcfranklingothic"] },
  { id: "gillsans", label: "Gill Sans", family: "sans", css: '"Gill Sans", "Gill Sans MT", sans-serif', aliases: ["gillsansmt", "gillsans"] },
  { id: "futura", label: "Futura", family: "sans", css: 'Futura, "Century Gothic", sans-serif', aliases: ["futura"] },
  { id: "avenir", label: "Avenir", family: "sans", css: 'Avenir, "Avenir Next", sans-serif', aliases: ["avenirnext", "avenir"] },
  { id: "optima", label: "Optima", family: "sans", css: 'Optima, Candara, sans-serif', aliases: ["optima"] },
  { id: "myriad", label: "Myriad Pro", family: "sans", css: '"Myriad Pro", Myriad, sans-serif', aliases: ["myriadpro", "myriad"] },
  { id: "frutiger", label: "Frutiger", family: "sans", css: 'Frutiger, "Segoe UI", sans-serif', aliases: ["frutiger"] },
  { id: "univers", label: "Univers", family: "sans", css: 'Univers, Helvetica, sans-serif', aliases: ["universltstd", "univers"] },
  { id: "lucidasans", label: "Lucida Sans", family: "sans", css: '"Lucida Sans", "Lucida Grande", sans-serif', aliases: ["lucidasansunicode", "lucidagrande", "lucidasans"] },
  { id: "comicsans", label: "Comic Sans MS", family: "sans", css: '"Comic Sans MS", "Comic Neue", cursive', aliases: ["comicsansms", "comicsans", "comicneue"] },
  { id: "impact", label: "Impact", family: "sans", weight: 700, css: 'Impact, Haettenschweiler, sans-serif', aliases: ["impact", "haettenschweiler"] },

  // ---- Sans-serif: web and product fonts ----
  { id: "roboto", label: "Roboto", family: "sans", css: 'Roboto, Arial, sans-serif', aliases: ["roboto"] },
  { id: "opensans", label: "Open Sans", family: "sans", css: '"Open Sans", "Segoe UI", sans-serif', aliases: ["opensans"] },
  { id: "lato", label: "Lato", family: "sans", css: 'Lato, "Segoe UI", sans-serif', aliases: ["lato"] },
  { id: "montserrat", label: "Montserrat", family: "sans", css: 'Montserrat, "Segoe UI", sans-serif', aliases: ["montserrat"] },
  { id: "poppins", label: "Poppins", family: "sans", css: 'Poppins, "Century Gothic", sans-serif', aliases: ["poppins"] },
  { id: "inter", label: "Inter", family: "sans", css: 'Inter, "Segoe UI", sans-serif', aliases: ["intertight", "intervariable", "inter"] },
  { id: "nunito", label: "Nunito", family: "sans", css: 'Nunito, "Nunito Sans", sans-serif', aliases: ["nunitosans", "nunito"] },
  { id: "raleway", label: "Raleway", family: "sans", css: 'Raleway, "Segoe UI", sans-serif', aliases: ["raleway"] },
  { id: "worksans", label: "Work Sans", family: "sans", css: '"Work Sans", "Segoe UI", sans-serif', aliases: ["worksans"] },
  { id: "sourcesans", label: "Source Sans", family: "sans", css: '"Source Sans 3", "Source Sans Pro", sans-serif', aliases: ["sourcesanspro", "sourcesans"] },
  { id: "notosans", label: "Noto Sans", family: "sans", css: '"Noto Sans", "Open Sans", sans-serif', aliases: ["notosans"] },
  { id: "ptsans", label: "PT Sans", family: "sans", css: '"PT Sans", "Segoe UI", sans-serif', aliases: ["ptsans"] },
  { id: "ubuntu", label: "Ubuntu", family: "sans", css: 'Ubuntu, "Segoe UI", sans-serif', aliases: ["ubuntu"] },
  { id: "oswald", label: "Oswald", family: "sans", css: 'Oswald, "Arial Narrow", sans-serif', aliases: ["oswald"] },
  { id: "firasans", label: "Fira Sans", family: "sans", css: '"Fira Sans", "Segoe UI", sans-serif', aliases: ["firasans", "firago"] },
  { id: "ibmplexsans", label: "IBM Plex Sans", family: "sans", css: '"IBM Plex Sans", "Segoe UI", sans-serif', aliases: ["ibmplexsans"] },
  { id: "rubik", label: "Rubik", family: "sans", css: 'Rubik, "Segoe UI", sans-serif', aliases: ["rubik"] },
  { id: "barlow", label: "Barlow", family: "sans", css: 'Barlow, "Segoe UI", sans-serif', aliases: ["barlow"] },
  { id: "manrope", label: "Manrope", family: "sans", css: 'Manrope, "Segoe UI", sans-serif', aliases: ["manrope"] },
  { id: "mulish", label: "Mulish", family: "sans", css: 'Mulish, Muli, sans-serif', aliases: ["mulish", "muli"] },
  { id: "karla", label: "Karla", family: "sans", css: 'Karla, "Segoe UI", sans-serif', aliases: ["karla"] },
  { id: "quicksand", label: "Quicksand", family: "sans", css: 'Quicksand, "Century Gothic", sans-serif', aliases: ["quicksand"] },
  { id: "dmsans", label: "DM Sans", family: "sans", css: '"DM Sans", "Segoe UI", sans-serif', aliases: ["dmsans"] },
  { id: "figtree", label: "Figtree", family: "sans", css: 'Figtree, "Segoe UI", sans-serif', aliases: ["figtree"] },
  { id: "plusjakarta", label: "Plus Jakarta Sans", family: "sans", css: '"Plus Jakarta Sans", "Segoe UI", sans-serif', aliases: ["plusjakartasans", "plusjakartadisplay"] },

  // ---- Serif ----
  { id: "times", label: "Times New Roman", family: "serif", css: '"Times New Roman", Times, "Liberation Serif", serif', aliases: ["timesnewroman", "timesroman", "times", "liberationserif", "tinos", "nimbusroman"] },
  { id: "georgia", label: "Georgia", family: "serif", css: 'Georgia, "Times New Roman", serif', aliases: ["georgia", "gelasio"] },
  { id: "garamond", label: "Garamond", family: "serif", css: 'Garamond, "EB Garamond", "Times New Roman", serif', aliases: ["ebgaramond", "adobegaramond", "garamondpremier", "garamond"] },
  { id: "cambria", label: "Cambria", family: "serif", css: 'Cambria, Caladea, Georgia, serif', aliases: ["cambria", "caladea"] },
  { id: "constantia", label: "Constantia", family: "serif", css: 'Constantia, Georgia, serif', aliases: ["constantia"] },
  { id: "palatino", label: "Palatino", family: "serif", css: 'Palatino, "Palatino Linotype", "Book Antiqua", serif', aliases: ["palatinolinotype", "bookantiqua", "palatino", "urwpalladio"] },
  { id: "bookman", label: "Bookman", family: "serif", css: 'Bookman, "Bookman Old Style", serif', aliases: ["bookmanoldstyle", "bookman", "urwbookman"] },
  { id: "baskerville", label: "Baskerville", family: "serif", css: 'Baskerville, "Libre Baskerville", serif', aliases: ["librebaskerville", "baskerville"] },
  { id: "centuryschoolbook", label: "Century Schoolbook", family: "serif", css: '"Century Schoolbook", "New Century Schoolbook", serif', aliases: ["newcenturyschlbk", "centuryschoolbook", "schoolbook", "century"] },
  { id: "cambriamath", label: "Cambria Math", family: "serif", symbolic: true, css: '"Cambria Math", Cambria, serif', aliases: ["cambriamath"] },
  { id: "didot", label: "Didot", family: "serif", css: 'Didot, "Bodoni MT", serif', aliases: ["bodonimt", "didot", "bodoni"] },
  { id: "rockwell", label: "Rockwell", family: "serif", css: 'Rockwell, "Roboto Slab", serif', aliases: ["rockwell", "robotoslab"] },
  { id: "merriweather", label: "Merriweather", family: "serif", css: 'Merriweather, Georgia, serif', aliases: ["merriweather"] },
  { id: "playfair", label: "Playfair Display", family: "serif", css: '"Playfair Display", Georgia, serif', aliases: ["playfairdisplay", "playfair"] },
  { id: "ptserif", label: "PT Serif", family: "serif", css: '"PT Serif", Georgia, serif', aliases: ["ptserif"] },
  { id: "sourceserif", label: "Source Serif", family: "serif", css: '"Source Serif 4", "Source Serif Pro", serif', aliases: ["sourceserifpro", "sourceserif"] },
  { id: "notoserif", label: "Noto Serif", family: "serif", css: '"Noto Serif", Georgia, serif', aliases: ["notoserif"] },
  { id: "lora", label: "Lora", family: "serif", css: 'Lora, Georgia, serif', aliases: ["lora"] },
  { id: "crimson", label: "Crimson", family: "serif", css: '"Crimson Pro", "Crimson Text", Georgia, serif', aliases: ["crimsonpro", "crimsontext", "crimson"] },
  { id: "ibmplexserif", label: "IBM Plex Serif", family: "serif", css: '"IBM Plex Serif", Georgia, serif', aliases: ["ibmplexserif"] },
  { id: "minion", label: "Minion Pro", family: "serif", css: '"Minion Pro", Minion, "Times New Roman", serif', aliases: ["minionpro", "minion"] },
  { id: "charter", label: "Charter", family: "serif", css: 'Charter, "Bitstream Charter", Georgia, serif', aliases: ["bitstreamcharter", "charter", "charis"] },
  { id: "utopia", label: "Utopia", family: "serif", css: 'Utopia, "Times New Roman", serif', aliases: ["utopia"] },
  { id: "dejavuserif", label: "DejaVu Serif", family: "serif", css: '"DejaVu Serif", Georgia, serif', aliases: ["dejavuserif", "bitstreamveraserif"] },
  { id: "computermodern", label: "Computer Modern", family: "serif", css: '"Latin Modern Roman", "Computer Modern", serif', aliases: ["computermodern", "latinmodernroman", "cmr", "nimbusromno9l"] },

  // ---- Monospace ----
  { id: "courier", label: "Courier New", family: "mono", css: '"Courier New", Courier, "Liberation Mono", monospace', aliases: ["couriernew", "courierstd", "courierprime", "courier", "liberationmono", "cousine", "nimbusmono"] },
  { id: "consolas", label: "Consolas", family: "mono", css: 'Consolas, "Cascadia Mono", monospace', aliases: ["consolas", "inconsolata"] },
  { id: "menlo", label: "Menlo", family: "mono", css: 'Menlo, Monaco, monospace', aliases: ["menlo", "monaco", "sfmono"] },
  { id: "cascadia", label: "Cascadia Code", family: "mono", css: '"Cascadia Code", "Cascadia Mono", monospace', aliases: ["cascadiacode", "cascadiamono", "cascadia"] },
  { id: "lucidaconsole", label: "Lucida Console", family: "mono", css: '"Lucida Console", "Lucida Sans Typewriter", monospace', aliases: ["lucidaconsole", "lucidasanstypewriter"] },
  { id: "andalemono", label: "Andale Mono", family: "mono", css: '"Andale Mono", monospace', aliases: ["andalemono"] },
  { id: "dejavumono", label: "DejaVu Sans Mono", family: "mono", css: '"DejaVu Sans Mono", monospace', aliases: ["dejavusansmono", "bitstreamverasansmono"] },
  { id: "sourcecode", label: "Source Code Pro", family: "mono", css: '"Source Code Pro", monospace', aliases: ["sourcecodepro", "sourcecode"] },
  { id: "firacode", label: "Fira Code", family: "mono", css: '"Fira Code", "Fira Mono", monospace', aliases: ["firacode", "firamono"] },
  { id: "jetbrainsmono", label: "JetBrains Mono", family: "mono", css: '"JetBrains Mono", monospace', aliases: ["jetbrainsmono"] },
  { id: "ibmplexmono", label: "IBM Plex Mono", family: "mono", css: '"IBM Plex Mono", monospace', aliases: ["ibmplexmono"] },
  { id: "robotomono", label: "Roboto Mono", family: "mono", css: '"Roboto Mono", monospace', aliases: ["robotomono"] },
  { id: "spacemono", label: "Space Mono", family: "mono", css: '"Space Mono", monospace', aliases: ["spacemono"] },
  { id: "ptmono", label: "PT Mono", family: "mono", css: '"PT Mono", monospace', aliases: ["ptmono", "ubuntumono"] },

  // ---- Symbol faces: recognised so the UI can explain why editing is limited ----
  { id: "symbol", label: "Symbol", family: "serif", symbolic: true, css: 'Symbol, serif', aliases: ["symbolmt", "symbol"] },
  { id: "zapfdingbats", label: "ZapfDingbats", family: "sans", symbolic: true, css: '"Zapf Dingbats", sans-serif', aliases: ["zapfdingbats", "dingbats"] },
  { id: "wingdings", label: "Wingdings", family: "sans", symbolic: true, css: 'Wingdings, sans-serif', aliases: ["wingdings"] },
  { id: "webdings", label: "Webdings", family: "sans", symbolic: true, css: 'Webdings, sans-serif', aliases: ["webdings"] },
];

// alias -> entry, longest alias first so the most specific name wins.
const ALIAS_INDEX = FONT_CATALOG
  .flatMap((entry) => entry.aliases.map((alias) => [alias, entry]))
  .sort((a, b) => b[0].length - a[0].length);

// Weight words, longest first: "semibold" must be consumed before "bold".
const WEIGHT_TOKENS = [
  ["extrablack", 900], ["ultrablack", 900], ["extrabold", 800], ["ultrabold", 800],
  ["semibold", 600], ["demibold", 600], ["extralight", 200], ["ultralight", 200],
  ["hairline", 100], ["regular", 400], ["medium", 500], ["normal", 400],
  ["black", 900], ["heavy", 900], ["light", 300], ["roman", 400], ["book", 400],
  ["thin", 100], ["demi", 600], ["bold", 700], ["bd", 700],
];

const STRETCH_TOKENS = [
  ["semicondensed", "condensed"], ["extracondensed", "condensed"], ["condensed", "condensed"],
  ["narrow", "condensed"], ["cond", "condensed"],
  ["semiexpanded", "expanded"], ["extended", "expanded"], ["expanded", "expanded"], ["wide", "expanded"],
];

// Foundry and format noise that carries no style information.
const NOISE_TOKENS = ["psmt", "mt", "ps", "std", "pro", "ttf", "otf", "identityh", "identity", "unicodems", "ms", "lt", "com", "sc", "osf"];

const WEIGHT_LABELS = {
  100: "Thin", 200: "ExtraLight", 300: "Light", 400: "", 500: "Medium",
  600: "SemiBold", 700: "Bold", 800: "ExtraBold", 900: "Black",
};

export function normalizeFontName(name) {
  return String(name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Drops the `ABCDEF+` prefix a subset-embedded font carries. */
export function stripSubsetTag(name) {
  return String(name || "").replace(/^[A-Z]{6}\+/, "");
}

function takeTokens(text, tokens) {
  let rest = text;
  const found = [];
  for (const [token, value] of tokens) {
    const at = rest.indexOf(token);
    if (at < 0) continue;
    found.push(value);
    rest = rest.slice(0, at) + rest.slice(at + token.length);
  }
  return { rest, found };
}

/**
 * Reads a PDF BaseFont name.
 *
 * Returns `{ id, label, family, serif, fixedPitch, symbolic, css, weight, bold,
 * italic, stretch, styleLabel, matched }`. `matched` is false when the name is
 * not a family we know, in which case the shape fields are best-effort guesses
 * the caller can override with the font descriptor's own flags.
 */
export function identifyFont(baseFont) {
  const raw = stripSubsetTag(baseFont);
  const normalized = normalizeFontName(raw);
  const [matchedAlias, entry] = ALIAS_INDEX.find(([alias]) => normalized.includes(alias)) || ["", null];
  // Style words live in whatever the family name did not claim.
  let rest = entry ? normalized.replace(matchedAlias, "") : normalized;

  const italic = /italic|oblique|kursiv/.test(rest) || rest === "it" || /(?:^|[a-z])it$/.test(rest);
  rest = rest.replace(/italic|oblique|kursiv/g, "");

  const weights = takeTokens(rest, WEIGHT_TOKENS);
  rest = weights.rest;
  const stretches = takeTokens(rest, STRETCH_TOKENS);
  rest = stretches.rest;
  for (const noise of NOISE_TOKENS) rest = rest.split(noise).join("");

  const weight = weights.found.length ? Math.max(...weights.found) : (entry?.weight || 400);
  const stretch = stretches.found[0] || (entry?.stretch || "normal");
  const family = entry?.family || guessFamily(normalized);
  const styleLabel = [WEIGHT_LABELS[weight] || "", stretch !== "normal" ? capitalize(stretch) : "", italic ? "Italic" : ""]
    .filter(Boolean)
    .join(" ");

  return {
    id: entry?.id || "",
    label: entry?.label || prettyName(raw) || "",
    family,
    serif: family === "serif",
    fixedPitch: family === "mono",
    symbolic: !!entry?.symbolic,
    css: entry?.css || FAMILY_STACK[family],
    weight,
    bold: weight >= 600,
    italic,
    stretch,
    styleLabel,
    matched: !!entry,
  };
}

function guessFamily(normalized) {
  if (/mono|courier|typewriter|console|code/.test(normalized)) return "mono";
  if (/serif|times|roman|georgia|garamond|book|slab|minion|caslon|didone/.test(normalized) && !/sansserif/.test(normalized)) return "serif";
  return "sans";
}

function capitalize(text) {
  return text ? text[0].toUpperCase() + text.slice(1) : text;
}

// "TimesNewRomanPS-BoldMT" -> "Times New Roman PS Bold MT": only used as a
// label for families the catalog does not know.
function prettyName(raw) {
  return String(raw || "")
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

/** CSS font stack for a description produced by `identifyFont`/`describeFont`. */
export function cssFontStack(description = {}) {
  if (description.css) return description.css;
  return FAMILY_STACK[description.family] || (description.fixedPitch ? FAMILY_STACK.mono : description.serif ? FAMILY_STACK.serif : FAMILY_STACK.sans);
}

/** Human label such as "Calibri Bold" or "Arial" for the inspector. */
export function fontDisplayName(description = {}) {
  const label = description.label || "";
  if (!label) return "";
  return [label, description.styleLabel].filter(Boolean).join(" ");
}

export const FONT_CATALOG_SIZE = FONT_CATALOG.length;
