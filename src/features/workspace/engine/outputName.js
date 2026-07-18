// PDFin workspace — shared output-filename helpers (sanitize, validate, dedupe).
// Pure module: no React/JSX, importable by both the engine (pdfProcess.js) and tool defs.

const tx = (lang, id, en) => (lang === "id" ? id : en);

export function sanitizePdfBaseName(raw) {
  return String(raw || "")
    .trim()
    .replace(/(?:\.pdf)+$/i, "")
    .replace(/[/\\:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .replace(/[-\s]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();
}

export function getOutputNameError(raw, lang) {
  return sanitizePdfBaseName(raw)
    ? ""
    : tx(lang, "Nama file tidak boleh kosong.", "File name cannot be empty.");
}

export function getPdfOutputName(raw, lang, extension = "pdf") {
  const base = sanitizePdfBaseName(raw) || tx(lang, "hasil-gabungan", "merged");
  return `${base}.${extension}`;
}

// Returns a `dedupe(name) => uniqueName` closure that guarantees every name
// returned so far is unique (case-insensitive), appending "-2", "-3", … before
// the extension on collision.
export function createNameDeduper() {
  const seen = new Map();
  return function dedupe(name) {
    const key = name.toLowerCase();
    if (!seen.has(key)) {
      seen.set(key, 1);
      return name;
    }
    const dotIndex = name.lastIndexOf(".");
    const stem = dotIndex > 0 ? name.slice(0, dotIndex) : name;
    const ext = dotIndex > 0 ? name.slice(dotIndex) : "";
    let n = seen.get(key) + 1;
    let candidate = `${stem}-${n}${ext}`;
    while (seen.has(candidate.toLowerCase())) {
      n += 1;
      candidate = `${stem}-${n}${ext}`;
    }
    seen.set(key, n);
    seen.set(candidate.toLowerCase(), 1);
    return candidate;
  };
}

// Example filenames shown in the UI to preview how a custom base name will be
// suffixed across a batch of `count` outputs.
export function previewBatchNames(base, count, extension = "pdf") {
  const safeBase = sanitizePdfBaseName(base) || "file";
  const n = Math.max(1, count);
  if (n <= 1) return [`${safeBase}.${extension}`];
  const shown = Math.min(2, n);
  const names = [];
  for (let i = 1; i <= shown; i += 1) names.push(`${safeBase}-${i}.${extension}`);
  return names;
}
