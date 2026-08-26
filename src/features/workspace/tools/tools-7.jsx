import React from "react";
import { IconArrowsMove } from "@tabler/icons-react";
import { Alert, Button, Switch } from "../../../components/index.js";
import { Field, TX } from "./tools-1.jsx";
import { redoEditor, undoEditor } from "./editorHistory.js";

// PDFin workspace — editing the text already inside a PDF.
//
// The engine reports one editable run per text-showing operator; the overlay
// turns those into boxes over the rendered page. Clicking a box swaps it for a
// real text input sitting exactly where the words are, so an edit is typed on
// the page itself rather than in a side panel. The panel mirrors the same value
// for anyone who prefers it (or needs a larger target).
//
// Both this layer and the annotation layer belong to the one Edit PDF tool; see
// `tools-5.jsx` for the tool definition that hosts them.

// Parsing a page's content stream is not free, so results are cached per
// file+page for as long as the tab lives.
const runCache = new Map();
// Kept so the cache can be dropped without pulling the engine into the bundle
// for people who never open the text mode.
let loadedEngine = null;

function cacheKey(fileId, srcIndex) {
  return `${fileId}:${srcIndex}`;
}

export function clearTextRunCache() {
  runCache.clear();
  loadedEngine?.clearTextRunReaders?.();
}

async function loadRuns(fileId, srcIndex) {
  const key = cacheKey(fileId, srcIndex);
  if (!runCache.has(key)) {
    runCache.set(key, import("../engine/pdfTextEdit.js")
      .then((engine) => {
        loadedEngine = engine;
        return engine.extractPageTextRuns(fileId, srcIndex);
      })
      .catch(() => []));
  }
  return runCache.get(key);
}

export function changeKey(change) {
  return `${change.fileId}:${change.srcIndex}:${change.opIndex}`;
}

function findChange(opts, run) {
  return (opts.changes || []).find((change) => changeKey(change) === run.id);
}

// Applies (or clears) the replacement text of one run.
export function commitRunText(setOpts, run, text) {
  setOpts((current) => {
    const existing = findChange(current, run);
    const rest = (current.changes || []).filter((change) => changeKey(change) !== run.id);
    const moved = Math.abs(existing?.offset?.x || 0) > 1e-6 || Math.abs(existing?.offset?.y || 0) > 1e-6;
    const next = text === run.text && !moved
      ? rest
      : [...rest, {
        fileId: run.fileId,
        srcIndex: run.srcIndex,
        opIndex: run.opIndex,
        original: run.text,
        text,
        ...(moved ? { offset: existing.offset } : null),
      }];
    return { ...current, changes: next };
  });
}

function withRunOffset(changes, run, offset) {
  const existing = changes.find((change) => changeKey(change) === run.id);
  const rest = changes.filter((change) => changeKey(change) !== run.id);
  const moved = Math.abs(offset.x) > 1e-6 || Math.abs(offset.y) > 1e-6;
  if (!moved && (!existing || existing.text === run.text)) return rest;
  return [...rest, {
    fileId: run.fileId,
    srcIndex: run.srcIndex,
    opIndex: run.opIndex,
    original: run.text,
    text: existing?.text ?? run.text,
    ...(moved ? { offset } : null),
  }];
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

function runFont(run, pageHeight) {
  const fontSize = Math.max(5, (run.rect.h * pageHeight) / EM_BOX);
  const family = run.style?.css || "Helvetica, Arial, sans-serif";
  const weight = run.style?.weight || (run.style?.bold ? 700 : 400);
  return `${run.style?.italic ? "italic " : ""}${weight} ${fontSize}px/1 ${family}`;
}

function RunBox({ run, change, selected, interactive, pageHeight, background, onSelect, onChange, onKeyDown, onDragStart, lang }) {
  const rect = run.rect;
  const offset = change?.offset || { x: 0, y: 0 };
  const percent = (value) => `${Number((value * 100).toFixed(6))}%`;
  const base = {
    position: "absolute",
    left: percent(rect.x + offset.x),
    top: percent(rect.y + offset.y),
    width: `${rect.w * 100}%`,
    height: `${rect.h * 100}%`,
    padding: 0,
    boxSizing: "border-box",
  };

  if (!run.editable) {
    return (
      <span aria-hidden="true" title={TX(lang, "Teks ini tidak dapat diedit.", "This text cannot be edited.")} style={{
        ...base, border: "1px dashed var(--border-default)", opacity: interactive ? 0.5 : 0, pointerEvents: "none",
      }} />
    );
  }

  const font = runFont(run, pageHeight);
  const color = run.color || "var(--text-heading)";
  const fontSize = Math.max(5, (rect.h * pageHeight) / EM_BOX);
  const value = change ? change.text : run.text;
  const expandedSize = {
    width: `${Math.ceil(value.length * fontSize * 0.58)}px`,
    minWidth: `${rect.w * 100}%`,
    maxWidth: `${(1 - rect.x) * 100}%`,
  };

  // The selected run becomes a real input placed over the words themselves, so
  // the next keystroke lands in the document instead of in a side panel.
  if (selected && interactive) {
    // Longer replacements grow the field rather than scrolling inside it, so
    // what you typed stays readable; the export squeezes it back to the run's
    // own width when "keep the original width" is on.
    return (
      <div style={{ ...base, ...expandedSize, pointerEvents: "auto" }}>
        <input
          type="text"
          autoFocus
          value={value}
          aria-label={TX(lang, `Ubah teks: ${run.text}`, `Edit text: ${run.text}`)}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          style={{
            width: "100%",
            height: "100%",
            padding: "0 20px 0 0",
            boxSizing: "border-box",
            font,
            color,
            background: background || "var(--color-pdf-page)",
            border: "1.5px solid var(--border-brand)",
            borderRadius: 2,
            outline: "none",
            whiteSpace: "pre",
            overflow: "hidden",
          }}
        />
        <button type="button" aria-label={TX(lang, "Geser teks", "Move text")}
          onPointerDown={(event) => onDragStart(event, event.currentTarget.parentElement)}
          title={TX(lang, "Geser teks", "Move text")}
          style={{
            position: "absolute", top: "50%", right: 2, width: 16, height: 16,
            transform: "translateY(-50%)",
            display: "grid", placeItems: "center", padding: 0,
            color: "var(--text-brand)", background: "var(--surface-card)",
            border: "1px solid var(--border-brand)", borderRadius: 2,
            cursor: "grab", touchAction: "none",
          }}>
          <IconArrowsMove size={11} stroke={2} aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <button type="button" onClick={onSelect} onPointerDown={onDragStart} aria-label={run.text} tabIndex={interactive ? 0 : -1} style={{
      ...base,
      ...(change ? expandedSize : null),
      cursor: change ? "grab" : "text",
      touchAction: "none",
      textAlign: "left",
      whiteSpace: "pre",
      overflow: "hidden",
      pointerEvents: interactive ? "auto" : "none",
      font,
      color: change ? color : "transparent",
      // An edited run is painted over the original so the preview shows the
      // replacement text; untouched runs stay fully transparent.
      background: change ? (background || "var(--color-pdf-page)") : "transparent",
      border: "1px solid transparent",
      outline: "none",
    }}>{change ? change.text : run.text}</button>
  );
}

/**
 * Text-run overlay for one preview page.
 *
 * `interactive` is false while another editor tool is active: edited runs are
 * still painted so the preview stays truthful, but nothing is clickable.
 */
export function TextRunLayer({ page, opts, setOpts, lang, interactive = true }) {
  const ref = React.useRef(null);
  const [runs, setRuns] = React.useState([]);
  const [height, setHeight] = React.useState(0);
  const [visible, setVisible] = React.useState(false);
  const drag = React.useRef(null);
  const suppressClick = React.useRef(null);

  const pageChanges = (opts.changes || []).filter((change) => change.fileId === page.fileId && change.srcIndex === page.srcIndex);
  // Pages far from the viewport are never parsed, and a page nobody can edit
  // right now is only parsed when it has edits to draw.
  const wanted = visible && (interactive || pageChanges.length > 0);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) setVisible(true);
    }, { rootMargin: "400px 0px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!wanted) return undefined;
    let alive = true;
    loadRuns(page.fileId, page.srcIndex).then((loaded) => {
      if (alive) setRuns(loaded);
    });
    return () => { alive = false; };
  }, [wanted, page.fileId, page.srcIndex]);

  React.useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(() => setHeight(element.getBoundingClientRect().height));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Sampled lazily and only for runs that are being replaced or typed into.
  const backgrounds = React.useRef(new Map());
  const backgroundFor = (run, active) => {
    if (!active && !findChange(opts, run)) return null;
    if (!backgrounds.current.has(run.id)) {
      const canvas = ref.current?.parentElement?.querySelector("canvas");
      backgrounds.current.set(run.id, canvas ? sampleBackground(canvas, run.rect) : null);
    }
    return backgrounds.current.get(run.id);
  };

  const editable = runs.filter((run) => run.editable);
  const step = (run, delta) => {
    const index = editable.findIndex((item) => item.id === run.id);
    const next = editable[index + delta];
    if (!next) return false;
    setOpts((current) => ({ ...current, selectedId: next.id, selectedRun: next }));
    return true;
  };

  const onKeyDown = (run) => (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpts((current) => ({ ...current, selectedId: null, selectedRun: null }));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      // Enter moves to the next line of the page, the way a form would.
      if (!step(run, 1)) setOpts((current) => ({ ...current, selectedId: null, selectedRun: null }));
      return;
    }
    if (event.key === "Tab") {
      if (step(run, event.shiftKey ? -1 : 1)) event.preventDefault();
    }
  };

  const startDrag = (run) => (event, dragElement = event.currentTarget) => {
    if (!interactive || (event.button !== undefined && event.button !== 0)) return;
    event.preventDefault();
    event.stopPropagation();
    const layerBox = ref.current?.getBoundingClientRect();
    const elementBox = dragElement.getBoundingClientRect();
    if (!layerBox?.width || !layerBox?.height) return;
    const initial = findChange(opts, run)?.offset || { x: 0, y: 0 };
    drag.current = {
      run,
      startX: event.clientX,
      startY: event.clientY,
      initial,
      initialChanges: opts.changes || [],
      initialObjects: opts.objects || [],
      minX: -run.rect.x,
      maxX: Math.max(-run.rect.x, 1 - run.rect.x - elementBox.width / layerBox.width),
      minY: -run.rect.y,
      maxY: Math.max(-run.rect.y, 1 - run.rect.y - elementBox.height / layerBox.height),
      layerWidth: layerBox.width,
      layerHeight: layerBox.height,
      moved: false,
    };

    const move = (moveEvent) => {
      const active = drag.current;
      if (!active || (moveEvent.pointerId !== undefined && event.pointerId !== undefined && moveEvent.pointerId !== event.pointerId)) return;
      const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
      const offset = {
        x: Number(clamp(active.initial.x + (moveEvent.clientX - active.startX) / active.layerWidth, active.minX, active.maxX).toFixed(6)),
        y: Number(clamp(active.initial.y + (moveEvent.clientY - active.startY) / active.layerHeight, active.minY, active.maxY).toFixed(6)),
      };
      active.moved = active.moved || Math.abs(offset.x - active.initial.x) > 1e-6 || Math.abs(offset.y - active.initial.y) > 1e-6;
      setOpts((current) => ({ ...current, changes: withRunOffset(current.changes || [], run, offset) }));
    };

    const finish = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finish);
      const active = drag.current;
      drag.current = null;
      if (!active?.moved) return;
      suppressClick.current = run.id;
      setTimeout(() => { if (suppressClick.current === run.id) suppressClick.current = null; }, 0);
      setOpts((current) => ({
        ...current,
        past: [...(current.past || []), { objects: active.initialObjects, changes: active.initialChanges }].slice(-40),
        future: [],
      }));
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", finish);
  };

  return (
    <div ref={ref} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {runs.map((run) => {
        const selected = opts.selectedId === run.id;
        return (
          <RunBox key={run.id} run={run} lang={lang} pageHeight={height}
            change={findChange(opts, run)}
            background={backgroundFor(run, selected && interactive)}
            selected={selected}
            interactive={interactive}
            onSelect={() => {
              if (suppressClick.current === run.id) return;
              setOpts((current) => ({ ...current, selectedId: run.id, selectedRun: run }));
            }}
            onChange={(text) => commitRunText(setOpts, run, text)}
            onKeyDown={onKeyDown(run)}
            onDragStart={startDrag(run)} />
        );
      })}
    </div>
  );
}

export function summarizeReason(lang, reason) {
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

function fontSummary(lang, run) {
  const style = run.style || {};
  const name = style.name || TX(lang, "font dokumen", "document font");
  const detail = style.known
    ? ""
    : TX(lang, " (tidak dikenali, memakai padanan terdekat)", " (unrecognised, using the closest match)");
  return `${name}${detail} · ${run.fontSize}pt`;
}

/** Inspector section for the text-editing mode of the PDF editor. */
export function TextEditControls({ lang, opts, setOpts }) {
  const changes = opts.changes || [];
  const run = opts.selectedRun;
  const currentChange = run ? changes.find((change) => changeKey(change) === run.id) : null;

  return (
    <React.Fragment>
      <Alert tone="info">{TX(lang,
        "Klik teks pada halaman lalu langsung ketik untuk menggantinya. Enter pindah ke teks berikutnya, Esc selesai. PDFin memakai font asli bila font itu punya semua karakter yang Anda ketik; jika tidak, teks digambar ulang dengan font pengganti yang paling mirip.",
        "Click text on the page and type straight over it. Enter moves to the next text, Esc finishes. PDFin keeps the original font when it has every character you type; otherwise the text is redrawn with the closest substitute font.")}</Alert>
      {run ? (
        <Field label={TX(lang, "Teks terpilih", "Selected text")}
          hint={TX(lang, `Halaman ${run.srcIndex + 1} · ${fontSummary(lang, run)}`, `Page ${run.srcIndex + 1} · ${fontSummary(lang, run)}`)}>
          <textarea value={currentChange ? currentChange.text : run.text} rows={3} aria-label={TX(lang, "Isi teks", "Text content")}
            onChange={(event) => commitRunText(setOpts, run, event.target.value)}
            style={{
              padding: "9px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)",
              background: "var(--surface-card)", color: "var(--text-heading)", font: "var(--type-body)", resize: "vertical",
            }} />
          {currentChange && (
            <Button variant="ghost" size="sm" onClick={() => commitRunText(setOpts, run, run.text)}>
              {TX(lang, "Kembalikan teks asli", "Restore original text")}
            </Button>
          )}
        </Field>
      ) : (
        <Field label={TX(lang, "Teks terpilih", "Selected text")}>
          <span style={{ font: "var(--type-caption)", color: "var(--text-faint)" }}>
            {TX(lang, "Belum ada teks dipilih. Klik teks di halaman lalu ketik.", "No text selected yet. Click text on the page and start typing.")}
          </span>
        </Field>
      )}
      <Switch label={TX(lang, "Pertahankan lebar asli", "Keep the original width")} checked={opts.fitWidth !== false}
        onChange={(fitWidth) => setOpts((current) => ({ ...current, fitWidth }))} />
      <Field label={TX(lang, "Perubahan teks", "Text changes")}>
        <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
          <Button variant="ghost" size="sm" disabled={!(opts.past || []).length}
            onClick={() => setOpts((current) => undoEditor(current))}>{TX(lang, "Urungkan", "Undo")}</Button>
          <Button variant="ghost" size="sm" disabled={!(opts.future || []).length}
            onClick={() => setOpts((current) => redoEditor(current))}>{TX(lang, "Ulangi", "Redo")}</Button>
          <Button variant="ghost" size="sm" disabled={!changes.length}
            onClick={() => setOpts((current) => ({ ...current, changes: [], selectedId: null, selectedRun: null }))}>
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
          )) : <span style={{ font: "var(--type-caption)", color: "var(--text-faint)" }}>{TX(lang, "Belum ada perubahan teks.", "No text changes yet.")}</span>}
        </div>
      </Field>
      {run && !run.editable && (
        <Alert tone="warning">{TX(lang,
          `Teks ini tidak dapat diedit: ${summarizeReason(lang, run.reason)}.`,
          `This text cannot be edited: ${summarizeReason(lang, run.reason)}.`)}</Alert>
      )}
    </React.Fragment>
  );
}
