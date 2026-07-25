import React from "react";
import { Alert, Button, Switch } from "../../../components/index.js";
import { Field, TX, TOOL_DEFS, getOutputNameError, getPdfOutputName, outputNameValue, OutputNameField } from "./tools-1.jsx";
import { PdfProcess } from "../engine/pdfProcess.js";

// PDFin workspace — tool defs part 7: editing the text already inside a PDF.
//
// The engine reports one editable run per text-showing operator; the overlay
// turns those into clickable boxes over the rendered page and the panel edits
// the selected one.

// Parsing a page's content stream is not free, so results are cached per
// file+page for as long as the tab lives.
const runCache = new Map();

function cacheKey(fileId, srcIndex) {
  return `${fileId}:${srcIndex}`;
}

export function clearTextRunCache() {
  runCache.clear();
}

async function loadRuns(fileId, srcIndex) {
  const key = cacheKey(fileId, srcIndex);
  if (!runCache.has(key)) {
    runCache.set(key, import("../engine/pdfTextEdit.js")
      .then((engine) => engine.extractPageTextRuns(fileId, srcIndex))
      .catch(() => []));
  }
  return runCache.get(key);
}

function changeKey(change) {
  return `${change.fileId}:${change.srcIndex}:${change.opIndex}`;
}

function findChange(opts, run) {
  return (opts.changes || []).find((change) => changeKey(change) === run.id);
}

// The engine reports run heights as the full em box (ascent to descent), so the
// drawn glyph size is a fixed fraction of the box the overlay measures.
const EM_BOX = 1.15;

// Covering an edited run needs the page's actual background, which is not
// always white (letterheads, coloured tables). Sampling the rendered canvas
// just outside the run's box gets it right without guessing.
function sampleBackground(canvas, rect) {
  try {
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context?.getImageData) return null;
    const left = rect.x * canvas.width;
    const top = rect.y * canvas.height;
    const right = (rect.x + rect.w) * canvas.width;
    const bottom = (rect.y + rect.h) * canvas.height;
    const pad = Math.max(2, canvas.height * 0.004);
    const points = [
      [left, top - pad], [(left + right) / 2, top - pad], [right, top - pad],
      [left - pad, (top + bottom) / 2], [right + pad, (top + bottom) / 2],
      [left, bottom + pad], [(left + right) / 2, bottom + pad], [right, bottom + pad],
    ];
    const counts = new Map();
    for (const [x, y] of points) {
      if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) continue;
      const [r, g, b] = context.getImageData(Math.round(x), Math.round(y), 1, 1).data;
      const key = `${r},${g},${b}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    let best = null;
    let bestCount = 0;
    for (const [key, count] of counts) {
      if (count > bestCount) { best = key; bestCount = count; }
    }
    return best ? `rgb(${best})` : null;
  } catch {
    return null;
  }
}

function RunBox({ run, change, selected, pageHeight, background, onSelect, lang }) {
  const rect = run.rect;
  const base = {
    position: "absolute",
    left: `${rect.x * 100}%`,
    top: `${rect.y * 100}%`,
    width: `${rect.w * 100}%`,
    height: `${rect.h * 100}%`,
    padding: 0,
    boxSizing: "border-box",
  };

  if (!run.editable) {
    return (
      <span aria-hidden="true" title={TX(lang, "Teks ini tidak dapat diedit.", "This text cannot be edited.")} style={{
        ...base, border: "1px dashed var(--border-default)", opacity: 0.5, pointerEvents: "none",
      }} />
    );
  }

  const fontSize = Math.max(5, (rect.h * pageHeight) / EM_BOX);
  const family = run.style?.family === "serif"
    ? '"Times New Roman", Times, serif'
    : run.style?.family === "mono" ? '"Courier New", Courier, monospace' : "Helvetica, Arial, sans-serif";
  return (
    <button type="button" onClick={onSelect} aria-label={run.text} style={{
      ...base,
      cursor: "text",
      textAlign: "left",
      whiteSpace: "pre",
      overflow: "hidden",
      pointerEvents: "auto",
      font: `${run.style?.italic ? "italic " : ""}${run.style?.bold ? 700 : 400} ${fontSize}px/1 ${family}`,
      color: change ? "var(--text-heading)" : "transparent",
      // An edited run is painted over the original so the preview shows the
      // replacement text; untouched runs stay fully transparent.
      background: change ? (background || "var(--color-pdf-page)") : (selected ? "color-mix(in srgb, var(--action-primary) 12%, transparent)" : "transparent"),
      border: selected ? "1.5px solid var(--border-brand)" : "1px solid transparent",
      outline: "none",
    }}>{change ? change.text : run.text}</button>
  );
}

function TextRunLayer({ page, opts, setOpts, lang }) {
  const ref = React.useRef(null);
  const [runs, setRuns] = React.useState([]);
  const [height, setHeight] = React.useState(0);

  React.useEffect(() => {
    let alive = true;
    loadRuns(page.fileId, page.srcIndex).then((loaded) => {
      if (alive) setRuns(loaded);
    });
    return () => { alive = false; };
  }, [page.fileId, page.srcIndex]);

  React.useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(() => setHeight(element.getBoundingClientRect().height));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Sampled lazily and only for runs that are actually being replaced.
  const backgrounds = React.useRef(new Map());
  const backgroundFor = (run) => {
    if (!findChange(opts, run)) return null;
    if (!backgrounds.current.has(run.id)) {
      const canvas = ref.current?.parentElement?.querySelector("canvas");
      backgrounds.current.set(run.id, canvas ? sampleBackground(canvas, run.rect) : null);
    }
    return backgrounds.current.get(run.id);
  };

  return (
    <div ref={ref} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {runs.map((run) => (
        <RunBox key={run.id} run={run} lang={lang} pageHeight={height}
          change={findChange(opts, run)}
          background={backgroundFor(run)}
          selected={opts.selectedId === run.id}
          onSelect={() => setOpts({ ...opts, selectedId: run.id, selectedRun: run })} />
      ))}
    </div>
  );
}

function summarizeReason(lang, reason) {
  const map = {
    "rotated-text": TX(lang, "teks diputar atau dimiringkan", "rotated or skewed text"),
    "invisible-text": TX(lang, "lapisan teks tak terlihat (hasil OCR)", "invisible text layer (OCR output)"),
    "unmapped-characters": TX(lang, "font tidak menyertakan peta karakter", "the font carries no character map"),
    "type3-font": TX(lang, "font Type3", "Type3 font"),
    "encoding-differences": TX(lang, "encoding khusus", "custom encoding"),
    "cmap-encoding": TX(lang, "CMap tidak didukung", "unsupported CMap"),
  };
  return map[reason] || TX(lang, "format teks tidak didukung", "unsupported text format");
}

TOOL_DEFS.textedit = {
  view: "preview",
  previewKind: "processed",
  defaults: { changes: [], selectedId: null, selectedRun: null, fitWidth: true, outputName: "", loadedFor: null },
  Panel: ({ lang, opts, setOpts, ctx }) => {
    const file = ctx.files[0];
    const changes = opts.changes || [];
    const run = opts.selectedRun;
    const currentChange = run ? changes.find((change) => changeKey(change) === run.id) : null;
    const [draft, setDraft] = React.useState("");

    React.useEffect(() => {
      if (file?.id && opts.loadedFor !== file.id) {
        clearTextRunCache();
        setOpts((next) => next.loadedFor === file.id
          ? next
          : { ...next, outputName: outputNameValue(ctx, "teks-diedit"), loadedFor: file.id, changes: [], selectedId: null, selectedRun: null });
      }
    }, [file?.id]);
    React.useEffect(() => { setOpts((next) => (next.lang === lang ? next : { ...next, lang })); }, [lang]);
    React.useEffect(() => {
      setDraft(currentChange ? currentChange.text : (run?.text ?? ""));
    }, [opts.selectedId]);

    const commitDraft = (text) => {
      setDraft(text);
      if (!run) return;
      const rest = changes.filter((change) => changeKey(change) !== run.id);
      const next = text === run.text
        ? rest
        : [...rest, { fileId: run.fileId, srcIndex: run.srcIndex, opIndex: run.opIndex, original: run.text, text }];
      setOpts({ ...opts, changes: next });
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Alert tone="info">{TX(lang,
          "Klik teks pada halaman untuk mengeditnya. PDFin menulis ulang teks dengan font aslinya bila font itu punya semua karakter yang Anda ketik; jika tidak, teks digambar ulang dengan font pengganti yang paling mirip.",
          "Click text on the page to edit it. PDFin rewrites the text with its original font when that font has every character you type; otherwise the text is redrawn with the closest substitute font.")}</Alert>
        {run ? (
          <Field label={TX(lang, "Teks terpilih", "Selected text")}
            hint={TX(lang, `Halaman ${run.srcIndex + 1} · ${run.fontSize}pt`, `Page ${run.srcIndex + 1} · ${run.fontSize}pt`)}>
            <textarea value={draft} rows={3} aria-label={TX(lang, "Isi teks", "Text content")}
              onChange={(event) => commitDraft(event.target.value)}
              style={{
                padding: "9px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)",
                background: "var(--surface-card)", color: "var(--text-heading)", font: "var(--type-body)", resize: "vertical",
              }} />
            {currentChange && (
              <Button variant="ghost" size="sm" onClick={() => commitDraft(run.text)}>
                {TX(lang, "Kembalikan teks asli", "Restore original text")}
              </Button>
            )}
          </Field>
        ) : (
          <Field label={TX(lang, "Teks terpilih", "Selected text")}>
            <span style={{ font: "var(--type-caption)", color: "var(--text-faint)" }}>
              {TX(lang, "Belum ada teks dipilih. Klik teks di halaman.", "No text selected yet. Click some text on the page.")}
            </span>
          </Field>
        )}
        <Switch label={TX(lang, "Pertahankan lebar asli", "Keep the original width")} checked={opts.fitWidth !== false}
          onChange={(fitWidth) => setOpts({ ...opts, fitWidth })} />
        <Field label={TX(lang, "Perubahan", "Changes")}>
          <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
            <Button variant="ghost" size="sm" disabled={!changes.length}
              onClick={() => setOpts({ ...opts, changes: [], selectedId: null, selectedRun: null })}>
              {TX(lang, "Kosongkan", "Clear")}
            </Button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 220, overflowY: "auto" }}>
            {changes.length ? changes.map((change) => (
              <div key={changeKey(change)} style={{
                display: "flex", flexDirection: "column", gap: 2, padding: "8px 10px",
                borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", background: "var(--surface-card)",
              }}>
                <span style={{ font: "var(--type-caption)", color: "var(--text-faint)", textDecoration: "line-through" }}>{change.original}</span>
                <span style={{ font: "var(--type-caption)", color: "var(--text-heading)" }}>{change.text || TX(lang, "(dikosongkan)", "(emptied)")}</span>
              </div>
            )) : <span style={{ font: "var(--type-caption)", color: "var(--text-faint)" }}>{TX(lang, "Belum ada perubahan.", "No changes yet.")}</span>}
          </div>
        </Field>
        {run && !run.editable && (
          <Alert tone="warning">{TX(lang,
            `Teks ini tidak dapat diedit: ${summarizeReason(lang, run.reason)}.`,
            `This text cannot be edited: ${summarizeReason(lang, run.reason)}.`)}</Alert>
        )}
        <OutputNameField lang={lang} value={opts.outputName || outputNameValue(ctx, "teks-diedit")} inputId="textedit-output-name"
          onChange={(outputName) => setOpts({ ...opts, outputName })} batchCount={ctx.files.length} />
      </div>
    );
  },
  overlay: (opts, setOpts) => (page) => (
    <TextRunLayer page={page} opts={opts} setOpts={setOpts} lang={opts.lang || "id"} />
  ),
  disabled: (ctx, opts, lang = "id") => !(opts.changes || []).length || !!getOutputNameError(opts.outputName || outputNameValue(ctx, "teks-diedit"), lang),
  disabledReason: (ctx, opts, t, lang) => getOutputNameError(opts.outputName || outputNameValue(ctx, "teks-diedit"), lang)
    || TX(lang, "Klik teks di halaman lalu ubah isinya.", "Click text on the page and change it."),
  actionLabel: (ctx, opts, t, lang) => TX(lang, "Terapkan perubahan teks", "Apply text changes"),
  nextAction: (ctx, opts, t, lang) => TX(lang, "Perubahan teks diterapkan secara lokal di browser Anda.", "Text changes are applied locally in your browser."),
  successSummary: (result, ctx, opts, t, lang) => {
    const parts = [
      result.sameFont ? TX(lang, `${result.sameFont} teks ditulis ulang dengan font aslinya.`, `${result.sameFont} text run${result.sameFont === 1 ? "" : "s"} rewritten with the original font.`) : "",
      result.redrawn ? TX(lang, `${result.redrawn} teks digambar ulang dengan font pengganti.`, `${result.redrawn} text run${result.redrawn === 1 ? "" : "s"} redrawn with a substitute font.`) : "",
      result.skipped ? TX(lang, `${result.skipped} perubahan dilewati karena teksnya tidak dapat diedit.`, `${result.skipped} change${result.skipped === 1 ? "" : "s"} skipped because the text could not be edited.`) : "",
      result.droppedCharacters ? TX(lang, `${result.droppedCharacters} karakter tidak didukung font pengganti dan dilewati.`, `${result.droppedCharacters} character${result.droppedCharacters === 1 ? "" : "s"} are unsupported by the substitute font and were skipped.`) : "",
    ].filter(Boolean);
    return parts.length ? parts.join(" ") : TX(lang, "Tidak ada perubahan yang diterapkan.", "No changes were applied.");
  },
  outName: (lang, opts = {}) => getPdfOutputName(opts.outputName || TX(lang, "dokumen-teks-diedit", "text-edited-document"), lang),
  process: (ctx, opts, onProgress, lang) => PdfProcess.editText(ctx.files, {
    changes: opts.changes,
    fitWidth: opts.fitWidth !== false,
    outputName: getPdfOutputName(opts.outputName || outputNameValue(ctx, "teks-diedit"), lang),
  }, onProgress),
};
