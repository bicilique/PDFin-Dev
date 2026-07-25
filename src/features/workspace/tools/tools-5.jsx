import React from "react";
import { Alert, Button, Input, Select, Switch } from "../../../components/index.js";
import { Field, Segmented, SliderRow, TX, TOOL_DEFS, getOutputNameError, getPdfOutputName, outputNameValue, OutputNameField } from "./tools-1.jsx";
import { PdfProcess } from "../engine/pdfProcess.js";

// PDFin workspace — tool defs part 5: visual PDF editor (annotation layer).
//
// Every object lives in normalized page coordinates (0..1, origin top-left of
// the page as shown in the preview) so the same numbers drive both the DOM
// overlay and the pdf-lib export in `engine/pdfAnnotate.js`.

// Text size is authored in points against an A4-height reference and stored as
// a fraction of page height, so a box keeps its relative size on any page size.
const A4_HEIGHT_PT = 842;

export const EDITOR_MODES = ["select", "text", "image", "highlight", "rect", "ellipse", "line", "draw"];

const CSS_FONTS = {
  sans: "Helvetica, Arial, sans-serif",
  serif: '"Times New Roman", Times, serif',
  mono: '"Courier New", Courier, monospace',
};

let objectSeq = 0;
function nextObjectId() {
  objectSeq += 1;
  return `annot-${Date.now().toString(36)}-${objectSeq}`;
}

export function defaultEditorStyle() {
  return {
    color: "#111827",
    fill: "#ffe066",
    stroke: "#e11d48",
    strokeWidth: 2,
    opacity: 100,
    sizePt: 14,
    fontFamily: "sans",
    bold: false,
    italic: false,
    align: "left",
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeDragRect(from, to, minSize = 0.02) {
  const x = Math.min(from.x, to.x);
  const y = Math.min(from.y, to.y);
  const w = Math.max(minSize, Math.abs(to.x - from.x));
  const h = Math.max(minSize, Math.abs(to.y - from.y));
  return {
    x: clamp(x, 0, 1 - w),
    y: clamp(y, 0, 1 - h),
    w: Math.min(w, 1),
    h: Math.min(h, 1),
  };
}

// Builds the object a drag on `page` should produce for the active mode.
export function createObject(mode, style, page, geometry, extra = {}) {
  const base = { id: nextObjectId(), fileId: page.fileId, srcIndex: page.srcIndex, type: mode, opacity: style.opacity / 100 };
  if (mode === "text") {
    return {
      ...base,
      rect: geometry.rect,
      text: extra.text ?? "",
      sizePct: style.sizePt / A4_HEIGHT_PT,
      color: style.color,
      fontFamily: style.fontFamily,
      bold: style.bold,
      italic: style.italic,
      align: style.align,
      opacity: 1,
    };
  }
  if (mode === "image") {
    const aspect = extra.source?.aspect || 1;
    const rect = geometry.rect;
    return { ...base, rect: { ...rect, h: extra.keepAspect === false ? rect.h : rect.w / aspect }, source: extra.source, opacity: style.opacity / 100 };
  }
  if (mode === "highlight") {
    return { ...base, rect: geometry.rect, fill: style.fill, opacity: 1 };
  }
  if (mode === "rect" || mode === "ellipse") {
    return { ...base, rect: geometry.rect, fill: extra.fill ?? null, stroke: style.stroke, strokeWidth: style.strokeWidth };
  }
  if (mode === "line") {
    return { ...base, from: geometry.from, to: geometry.to, stroke: style.stroke, strokeWidth: style.strokeWidth, arrow: !!extra.arrow };
  }
  if (mode === "draw") {
    return { ...base, points: geometry.points, stroke: style.stroke, strokeWidth: style.strokeWidth };
  }
  return null;
}

// All mutations go through here so undo/redo stays consistent.
function commit(opts, setOpts, nextObjects, patch = {}) {
  setOpts({
    ...opts,
    ...patch,
    objects: nextObjects,
    past: [...(opts.past || []), opts.objects || []].slice(-40),
    future: [],
  });
}

function undo(opts, setOpts) {
  const past = opts.past || [];
  if (!past.length) return;
  setOpts({
    ...opts,
    objects: past[past.length - 1],
    past: past.slice(0, -1),
    future: [...(opts.future || []), opts.objects || []],
    selectedId: null,
  });
}

function redo(opts, setOpts) {
  const future = opts.future || [];
  if (!future.length) return;
  setOpts({
    ...opts,
    objects: future[future.length - 1],
    past: [...(opts.past || []), opts.objects || []],
    future: future.slice(0, -1),
    selectedId: null,
  });
}

function updateObject(opts, setOpts, id, updater, { history = true } = {}) {
  const next = (opts.objects || []).map((object) => (object.id === id ? updater(object) : object));
  if (history) commit(opts, setOpts, next);
  else setOpts({ ...opts, objects: next });
}

function objectLabel(lang, object, index) {
  const names = {
    text: TX(lang, "Teks", "Text"),
    image: TX(lang, "Gambar", "Image"),
    highlight: TX(lang, "Stabilo", "Highlight"),
    rect: TX(lang, "Kotak", "Rectangle"),
    ellipse: TX(lang, "Lingkaran", "Ellipse"),
    line: TX(lang, "Garis", "Line"),
    draw: TX(lang, "Coretan", "Freehand"),
  };
  const name = names[object.type] || object.type;
  const preview = object.type === "text" && object.text ? ` — ${object.text.slice(0, 22)}` : "";
  return `${index + 1}. ${name} (${TX(lang, "hal.", "p.")} ${object.srcIndex + 1})${preview}`;
}

// ---- Preview overlay ----

function pointFromEvent(event, element) {
  const box = element.getBoundingClientRect();
  return {
    x: clamp((event.clientX - box.left) / box.width, 0, 1),
    y: clamp((event.clientY - box.top) / box.height, 0, 1),
  };
}

function ObjectView({ object, selected, pageHeight, onSelect, onDragStart }) {
  const common = {
    position: "absolute",
    pointerEvents: "auto",
    cursor: "grab",
    outline: selected ? "1.5px dashed var(--border-brand)" : "none",
    outlineOffset: 2,
  };
  const rect = object.rect || { x: 0, y: 0, w: 0.2, h: 0.1 };
  const box = { left: `${rect.x * 100}%`, top: `${rect.y * 100}%`, width: `${rect.w * 100}%`, height: `${(rect.h || 0.1) * 100}%` };
  const start = (event, mode) => { event.preventDefault(); event.stopPropagation(); onSelect(); onDragStart(event, mode); };
  const handle = selected ? (
    <span aria-hidden="true" onPointerDown={(event) => start(event, "resize")} style={{
      position: "absolute", right: -6, bottom: -6, width: 12, height: 12, borderRadius: 3,
      border: "1px solid var(--border-brand)", background: "var(--surface-card)", cursor: "nwse-resize", pointerEvents: "auto",
    }} />
  ) : null;

  if (object.type === "line") {
    const from = object.from || { x: 0, y: 0 };
    const to = object.to || { x: 0.3, y: 0 };
    return (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }}>
        <line x1={from.x * 100} y1={from.y * 100} x2={to.x * 100} y2={to.y * 100}
          stroke={object.stroke} strokeWidth={Math.max(0.3, object.strokeWidth / 6)} strokeLinecap="round"
          vectorEffect="non-scaling-stroke" opacity={object.opacity ?? 1}
          style={{ pointerEvents: "stroke", cursor: "grab", strokeWidth: Math.max(2, object.strokeWidth) }}
          onPointerDown={(event) => start(event, "move")} />
        {object.arrow && <ArrowHead from={from} to={to} object={object} />}
        {selected && <circle cx={to.x * 100} cy={to.y * 100} r={1.4} fill="var(--surface-card)" stroke="var(--border-brand)"
          vectorEffect="non-scaling-stroke" style={{ pointerEvents: "all", cursor: "nwse-resize" }}
          onPointerDown={(event) => start(event, "resize")} />}
      </svg>
    );
  }

  if (object.type === "draw") {
    const points = (object.points || []).map((point) => `${point.x * 100},${point.y * 100}`).join(" ");
    return (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }}>
        <polyline points={points} fill="none" stroke={object.stroke} strokeLinecap="round" strokeLinejoin="round"
          opacity={object.opacity ?? 1} vectorEffect="non-scaling-stroke"
          style={{ pointerEvents: "stroke", cursor: "grab", strokeWidth: Math.max(2, object.strokeWidth) }}
          onPointerDown={(event) => start(event, "move")} />
      </svg>
    );
  }

  if (object.type === "text") {
    const fontSize = Math.max(6, (object.sizePct || 0.02) * pageHeight);
    return (
      <div onPointerDown={(event) => start(event, "move")} style={{
        ...common, ...box, height: "auto", minHeight: fontSize * 1.2,
        color: object.color, textAlign: object.align || "left",
        font: `${object.italic ? "italic " : ""}${object.bold ? 700 : 400} ${fontSize}px/1.2 ${CSS_FONTS[object.fontFamily] || CSS_FONTS.sans}`,
        whiteSpace: "pre-wrap", wordBreak: "break-word", overflow: "hidden",
      }}>
        {object.text || ""}
        {handle}
      </div>
    );
  }

  if (object.type === "image") {
    return (
      <div onPointerDown={(event) => start(event, "move")} style={{ ...common, ...box }}>
        <img src={object.source?.url} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "fill", opacity: object.opacity ?? 1, pointerEvents: "none" }} />
        {handle}
      </div>
    );
  }

  const isEllipse = object.type === "ellipse";
  const isHighlight = object.type === "highlight";
  return (
    <div onPointerDown={(event) => start(event, "move")} style={{
      ...common, ...box,
      background: isHighlight ? object.fill : (object.fill || "transparent"),
      mixBlendMode: isHighlight ? "multiply" : undefined,
      border: !isHighlight && object.strokeWidth > 0 ? `${Math.max(1, object.strokeWidth)}px solid ${object.stroke}` : "none",
      borderRadius: isEllipse ? "50%" : 0,
      opacity: object.opacity ?? 1,
    }}>{handle}</div>
  );
}

function ArrowHead({ from, to, object }) {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const size = 3.5;
  const spread = Math.PI / 7;
  const points = [
    `${to.x * 100},${to.y * 100}`,
    `${(to.x - (size / 100) * Math.cos(angle - spread)) * 100},${(to.y - (size / 100) * Math.sin(angle - spread)) * 100}`,
    `${(to.x - (size / 100) * Math.cos(angle + spread)) * 100},${(to.y - (size / 100) * Math.sin(angle + spread)) * 100}`,
  ].join(" ");
  return <polygon points={points} fill={object.stroke} opacity={object.opacity ?? 1} style={{ pointerEvents: "none" }} />;
}

function AnnotationLayer({ page, opts, setOpts, lang }) {
  const ref = React.useRef(null);
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  const [draft, setDraft] = React.useState(null);
  const mode = opts.mode || "select";
  const style = opts.style || defaultEditorStyle();
  const pageObjects = (opts.objects || []).filter((object) => object.fileId === page.fileId && object.srcIndex === page.srcIndex);

  React.useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(() => {
      const box = element.getBoundingClientRect();
      setSize({ width: box.width, height: box.height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const dragObject = (event, object, dragMode) => {
    const element = ref.current;
    if (!element) return;
    const box = element.getBoundingClientRect();
    const startPoint = { x: event.clientX, y: event.clientY };
    const snapshot = { rect: object.rect ? { ...object.rect } : null, from: object.from ? { ...object.from } : null, to: object.to ? { ...object.to } : null, points: object.points ? object.points.map((p) => ({ ...p })) : null };
    let moved = false;
    const onMove = (moveEvent) => {
      const dx = (moveEvent.clientX - startPoint.x) / box.width;
      const dy = (moveEvent.clientY - startPoint.y) / box.height;
      moved = true;
      updateObject(opts, setOpts, object.id, (current) => {
        if (dragMode === "resize") {
          if (current.type === "line") return { ...current, to: { x: clamp(snapshot.to.x + dx, 0, 1), y: clamp(snapshot.to.y + dy, 0, 1) } };
          const rect = snapshot.rect;
          return { ...current, rect: { ...rect, w: clamp(rect.w + dx, 0.02, 1 - rect.x), h: clamp(rect.h + dy, 0.01, 1 - rect.y) } };
        }
        if (current.type === "line") {
          return {
            ...current,
            from: { x: clamp(snapshot.from.x + dx, 0, 1), y: clamp(snapshot.from.y + dy, 0, 1) },
            to: { x: clamp(snapshot.to.x + dx, 0, 1), y: clamp(snapshot.to.y + dy, 0, 1) },
          };
        }
        if (current.type === "draw") {
          return { ...current, points: snapshot.points.map((point) => ({ x: clamp(point.x + dx, 0, 1), y: clamp(point.y + dy, 0, 1) })) };
        }
        const rect = snapshot.rect;
        return { ...current, rect: { ...rect, x: clamp(rect.x + dx, 0, 1 - rect.w), y: clamp(rect.y + dy, 0, 1 - (rect.h || 0)) } };
      }, { history: false });
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      // One history entry per completed gesture, not per pointermove.
      if (moved) setOpts((current) => ({ ...current, past: [...(current.past || []), (opts.objects || [])].slice(-40), future: [] }));
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const startCreate = (event) => {
    if (mode === "select") return;
    if (mode === "image" && !opts.imageSource) return;
    const element = ref.current;
    if (!element) return;
    event.preventDefault();
    const origin = pointFromEvent(event, element);
    let current = origin;
    const path = [origin];
    setDraft({ mode, origin, current, path });
    const onMove = (moveEvent) => {
      current = pointFromEvent(moveEvent, element);
      if (mode === "draw") path.push(current);
      setDraft({ mode, origin, current, path: [...path] });
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setDraft(null);
      const object = buildFromDraft(mode, style, page, origin, current, path, opts);
      if (!object) return;
      commit(opts, setOpts, [...(opts.objects || []), object], { selectedId: object.id, mode: "select" });
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const draftBox = draft && draft.mode !== "line" && draft.mode !== "draw" ? normalizeDragRect(draft.origin, draft.current) : null;

  return (
    <div ref={ref} data-annot-page style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {mode !== "select" && (
        <div onPointerDown={startCreate} aria-label={TX(lang, "Area gambar anotasi", "Annotation drawing area")} style={{
          position: "absolute", inset: 0, pointerEvents: "auto", cursor: "crosshair",
          background: "color-mix(in srgb, var(--action-primary) 4%, transparent)",
        }} />
      )}
      {pageObjects.map((object) => (
        <ObjectView key={object.id} object={object} pageHeight={size.height}
          selected={opts.selectedId === object.id && mode === "select"}
          onSelect={() => setOpts({ ...opts, selectedId: object.id })}
          onDragStart={(event, dragMode) => dragObject(event, object, dragMode)} />
      ))}
      {draftBox && (
        <div aria-hidden="true" style={{
          position: "absolute", left: `${draftBox.x * 100}%`, top: `${draftBox.y * 100}%`,
          width: `${draftBox.w * 100}%`, height: `${draftBox.h * 100}%`,
          border: "1.5px dashed var(--border-brand)", background: "color-mix(in srgb, var(--action-primary) 8%, transparent)",
          borderRadius: draft.mode === "ellipse" ? "50%" : 0, pointerEvents: "none",
        }} />
      )}
      {draft && (draft.mode === "line" || draft.mode === "draw") && (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          {draft.mode === "line"
            ? <line x1={draft.origin.x * 100} y1={draft.origin.y * 100} x2={draft.current.x * 100} y2={draft.current.y * 100} stroke={style.stroke} strokeWidth={2} vectorEffect="non-scaling-stroke" />
            : <polyline points={draft.path.map((point) => `${point.x * 100},${point.y * 100}`).join(" ")} fill="none" stroke={style.stroke} strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />}
        </svg>
      )}
    </div>
  );
}

function buildFromDraft(mode, style, page, origin, current, path, opts) {
  if (mode === "line") {
    if (Math.abs(current.x - origin.x) < 0.01 && Math.abs(current.y - origin.y) < 0.01) return null;
    return createObject("line", style, page, { from: origin, to: current }, { arrow: !!opts.arrow });
  }
  if (mode === "draw") {
    if (path.length < 2) return null;
    return createObject("draw", style, page, { points: path });
  }
  const dragged = Math.abs(current.x - origin.x) > 0.01 || Math.abs(current.y - origin.y) > 0.01;
  if (mode === "text") {
    const rect = dragged ? normalizeDragRect(origin, current) : { x: clamp(origin.x, 0, 0.6), y: clamp(origin.y, 0, 0.95), w: 0.4, h: 0.08 };
    return createObject("text", style, page, { rect }, { text: TX(opts.lang || "id", "Teks baru", "New text") });
  }
  if (mode === "image") {
    const aspect = opts.imageSource?.aspect || 1;
    const rect = dragged ? normalizeDragRect(origin, current) : { x: clamp(origin.x, 0, 0.7), y: clamp(origin.y, 0, 0.9), w: 0.3, h: 0.3 / aspect };
    return createObject("image", style, page, { rect }, { source: opts.imageSource, keepAspect: !dragged });
  }
  if (!dragged) return null;
  const rect = normalizeDragRect(origin, current);
  if (mode === "rect") return createObject("rect", style, page, { rect }, { fill: opts.whiteout ? "#ffffff" : null });
  return createObject(mode, style, page, { rect });
}

// ---- Inspector panel ----

function ModePicker({ lang, value, onChange }) {
  const modes = [
    ["select", TX(lang, "Pilih", "Select")],
    ["text", TX(lang, "Teks", "Text")],
    ["image", TX(lang, "Gambar", "Image")],
    ["highlight", TX(lang, "Stabilo", "Highlight")],
    ["rect", TX(lang, "Kotak", "Box")],
    ["ellipse", TX(lang, "Lingkaran", "Ellipse")],
    ["line", TX(lang, "Garis", "Line")],
    ["draw", TX(lang, "Coretan", "Draw")],
  ];
  return (
    <div role="radiogroup" aria-label={TX(lang, "Alat edit", "Edit tool")} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
      {modes.map(([id, label]) => {
        const active = value === id;
        return (
          <button key={id} type="button" role="radio" aria-checked={active} onClick={() => onChange(id)} style={{
            padding: "8px 4px", borderRadius: "var(--radius-md)", cursor: "pointer",
            border: `1px solid ${active ? "var(--border-brand)" : "var(--border-default)"}`,
            background: active ? "var(--surface-brand-subtle)" : "var(--surface-card)",
            color: active ? "var(--text-heading)" : "var(--text-body)",
            font: "var(--weight-semibold) 11.5px/1.2 var(--font-sans)",
          }}>{label}</button>
        );
      })}
    </div>
  );
}

function StyleControls({ lang, mode, style, patchStyle, opts, setOpts }) {
  const showText = mode === "text";
  const showStroke = mode === "rect" || mode === "ellipse" || mode === "line" || mode === "draw";
  return (
    <>
      {showText && (
        <>
          <Field label={TX(lang, "Font", "Font")}>
            <Select value={style.fontFamily} onChange={(event) => patchStyle({ fontFamily: event.target.value })} options={[
              { value: "sans", label: "Helvetica" },
              { value: "serif", label: "Times" },
              { value: "mono", label: "Courier" },
            ]} />
          </Field>
          <SliderRow label={TX(lang, "Ukuran teks", "Text size")} value={style.sizePt} min={6} max={72} unit="pt" onChange={(sizePt) => patchStyle({ sizePt })} />
          <Field label={TX(lang, "Perataan", "Alignment")}>
            <Segmented value={style.align} onChange={(align) => patchStyle({ align })} options={[
              { value: "left", label: TX(lang, "Kiri", "Left") },
              { value: "center", label: TX(lang, "Tengah", "Center") },
              { value: "right", label: TX(lang, "Kanan", "Right") },
            ]} />
          </Field>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Switch label={TX(lang, "Tebal", "Bold")} checked={!!style.bold} onChange={(bold) => patchStyle({ bold })} />
            <Switch label={TX(lang, "Miring", "Italic")} checked={!!style.italic} onChange={(italic) => patchStyle({ italic })} />
          </div>
          <Input label={TX(lang, "Warna teks", "Text color")} type="color" value={style.color} onChange={(event) => patchStyle({ color: event.target.value })} />
        </>
      )}
      {mode === "highlight" && (
        <Input label={TX(lang, "Warna stabilo", "Highlight color")} type="color" value={style.fill} onChange={(event) => patchStyle({ fill: event.target.value })} />
      )}
      {showStroke && (
        <>
          <Input label={TX(lang, "Warna garis", "Stroke color")} type="color" value={style.stroke} onChange={(event) => patchStyle({ stroke: event.target.value })} />
          <SliderRow label={TX(lang, "Tebal garis", "Stroke width")} value={style.strokeWidth} min={1} max={12} unit="pt" onChange={(strokeWidth) => patchStyle({ strokeWidth })} />
        </>
      )}
      {mode === "rect" && (
        <Switch label={TX(lang, "Tutup konten (whiteout)", "Cover content (whiteout)")} checked={!!opts.whiteout} onChange={(whiteout) => setOpts({ ...opts, whiteout })} />
      )}
      {mode === "line" && (
        <Switch label={TX(lang, "Ujung panah", "Arrow head")} checked={!!opts.arrow} onChange={(arrow) => setOpts({ ...opts, arrow })} />
      )}
      {mode !== "select" && mode !== "text" && mode !== "highlight" && (
        <SliderRow label={TX(lang, "Opasitas", "Opacity")} value={style.opacity} min={10} max={100} unit="%" onChange={(opacity) => patchStyle({ opacity })} />
      )}
    </>
  );
}

function SelectedControls({ lang, opts, setOpts, selected }) {
  if (!selected) return null;
  const patch = (changes) => updateObject(opts, setOpts, selected.id, (object) => ({ ...object, ...changes }));
  return (
    <Field label={TX(lang, "Objek terpilih", "Selected object")}>
      {selected.type === "text" && (
        <>
          <textarea value={selected.text || ""} rows={3} aria-label={TX(lang, "Isi teks", "Text content")}
            onChange={(event) => patch({ text: event.target.value })}
            style={{
              padding: "9px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)",
              background: "var(--surface-card)", color: "var(--text-heading)", font: "var(--type-body)", resize: "vertical",
            }} />
          <SliderRow label={TX(lang, "Ukuran teks", "Text size")} value={Math.round((selected.sizePct || 0.02) * A4_HEIGHT_PT)} min={6} max={72} unit="pt"
            onChange={(sizePt) => patch({ sizePct: sizePt / A4_HEIGHT_PT })} />
          <Input label={TX(lang, "Warna teks", "Text color")} type="color" value={selected.color || "#111827"} onChange={(event) => patch({ color: event.target.value })} />
        </>
      )}
      {(selected.type === "rect" || selected.type === "ellipse" || selected.type === "line" || selected.type === "draw") && (
        <>
          <Input label={TX(lang, "Warna garis", "Stroke color")} type="color" value={selected.stroke || "#e11d48"} onChange={(event) => patch({ stroke: event.target.value })} />
          <SliderRow label={TX(lang, "Tebal garis", "Stroke width")} value={selected.strokeWidth || 2} min={1} max={12} unit="pt" onChange={(strokeWidth) => patch({ strokeWidth })} />
        </>
      )}
      {(selected.type === "rect" || selected.type === "ellipse") && (
        <>
          <Switch label={TX(lang, "Isi warna", "Filled")} checked={!!selected.fill} onChange={(filled) => patch({ fill: filled ? "#ffffff" : null })} />
          {selected.fill && <Input label={TX(lang, "Warna isi", "Fill color")} type="color" value={selected.fill} onChange={(event) => patch({ fill: event.target.value })} />}
        </>
      )}
      {selected.type === "highlight" && (
        <Input label={TX(lang, "Warna stabilo", "Highlight color")} type="color" value={selected.fill || "#ffe066"} onChange={(event) => patch({ fill: event.target.value })} />
      )}
      <Button variant="danger" size="sm" onClick={() => commit(opts, setOpts, (opts.objects || []).filter((object) => object.id !== selected.id), { selectedId: null })}>
        {TX(lang, "Hapus objek", "Delete object")}
      </Button>
    </Field>
  );
}

TOOL_DEFS.edit = {
  view: "preview",
  previewKind: "processed",
  defaults: {
    objects: [], selectedId: null, mode: "select", style: defaultEditorStyle(),
    imageSource: null, whiteout: false, arrow: true,
    past: [], future: [], outputName: "", loadedFor: null,
  },
  Panel: ({ lang, opts, setOpts, ctx }) => {
    const imageRef = React.useRef(null);
    const file = ctx.files[0];
    const style = opts.style || defaultEditorStyle();
    const mode = opts.mode || "select";
    const objects = opts.objects || [];
    const selected = objects.find((object) => object.id === opts.selectedId) || null;
    // Whether a character is drawable depends on the embedded app font, so the
    // check is asynchronous and re-runs as the text changes.
    const [dropped, setDropped] = React.useState(0);
    React.useEffect(() => {
      let alive = true;
      if (!objects.some((object) => object.type === "text" && object.text)) {
        setDropped(0);
        return undefined;
      }
      // Loaded on demand: the coverage check pulls in the font machinery, which
      // the workspace should not carry just to render this panel.
      import("../engine/pdfAnnotate.js")
        .then((engine) => engine.countUnsupportedCharacters(objects))
        .then((count) => { if (alive) setDropped(count); })
        .catch(() => {});
      return () => { alive = false; };
    }, [objects]);

    React.useEffect(() => {
      if (file?.id && opts.loadedFor !== file.id) {
        setOpts((next) => next.loadedFor === file.id ? next : { ...next, outputName: outputNameValue(ctx, "diedit"), loadedFor: file.id });
      }
    }, [file?.id]);
    React.useEffect(() => () => {
      if (opts.imageSource?.url) URL.revokeObjectURL(opts.imageSource.url);
    }, [opts.imageSource?.url]);
    React.useEffect(() => { setOpts((next) => (next.lang === lang ? next : { ...next, lang })); }, [lang]);

    const patchStyle = (changes) => setOpts({ ...opts, style: { ...style, ...changes } });

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Alert tone="info">{TX(lang,
          "Editor menambahkan lapisan visual di atas halaman: teks, gambar, bentuk, stabilo, dan coretan. Teks asli PDF tidak diubah — gunakan kotak putih (whiteout) untuk menutupinya.",
          "The editor adds a visual layer on top of the page: text, images, shapes, highlights, and freehand marks. Existing PDF text is not modified — use a white box (whiteout) to cover it.")}</Alert>
        <Field label={TX(lang, "Alat", "Tool")} hint={mode === "select"
          ? TX(lang, "Klik objek untuk memilih, seret untuk memindahkan.", "Click an object to select it, drag to move.")
          : TX(lang, "Seret di halaman untuk menggambar objek.", "Drag on the page to draw the object.")}>
          <ModePicker lang={lang} value={mode} onChange={(next) => setOpts({ ...opts, mode: next, selectedId: next === "select" ? opts.selectedId : null })} />
        </Field>
        {mode === "image" && (
          <Field label={TX(lang, "File gambar", "Image file")} hint={opts.imageSource ? "" : TX(lang, "Pilih gambar dulu sebelum menggambar di halaman.", "Choose an image before drawing on the page.")}>
            <Button variant="secondary" size="sm" onClick={() => imageRef.current.click()}>
              {opts.imageSource ? TX(lang, "Ganti gambar", "Replace image") : TX(lang, "Pilih gambar", "Choose image")}
            </Button>
            {opts.imageSource?.url && <img src={opts.imageSource.url} alt="" style={{ width: 84, borderRadius: 6, border: "1px solid var(--border-default)" }} />}
            <input ref={imageRef} type="file" accept=".png,.jpg,.jpeg" style={{ display: "none" }} onChange={async (event) => {
              const picked = event.target.files[0];
              if (!picked) return;
              const bytes = new Uint8Array(await picked.arrayBuffer());
              const url = URL.createObjectURL(picked);
              const aspect = await new Promise((resolve) => {
                const probe = new Image();
                probe.onload = () => resolve(probe.width / probe.height || 1);
                probe.onerror = () => resolve(1);
                probe.src = url;
              });
              if (opts.imageSource?.url) URL.revokeObjectURL(opts.imageSource.url);
              setOpts({ ...opts, imageSource: { bytes, type: picked.type, url, aspect } });
            }} />
          </Field>
        )}
        <StyleControls lang={lang} mode={mode} style={style} patchStyle={patchStyle} opts={opts} setOpts={setOpts} />
        <SelectedControls lang={lang} opts={opts} setOpts={setOpts} selected={selected} />
        <Field label={TX(lang, "Objek", "Objects")}>
          <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
            <Button variant="ghost" size="sm" disabled={!(opts.past || []).length} onClick={() => undo(opts, setOpts)}>{TX(lang, "Urungkan", "Undo")}</Button>
            <Button variant="ghost" size="sm" disabled={!(opts.future || []).length} onClick={() => redo(opts, setOpts)}>{TX(lang, "Ulangi", "Redo")}</Button>
            <Button variant="ghost" size="sm" disabled={!objects.length} onClick={() => commit(opts, setOpts, [], { selectedId: null })}>{TX(lang, "Kosongkan", "Clear")}</Button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 220, overflowY: "auto" }}>
            {objects.length ? objects.map((object, index) => (
              <button key={object.id} type="button" onClick={() => {
                setOpts({ ...opts, selectedId: object.id, mode: "select" });
                const pageIndex = ctx.pages.findIndex((page) => page.fileId === object.fileId && page.srcIndex === object.srcIndex);
                if (pageIndex >= 0) ctx.goToPreviewPage?.(pageIndex + 1);
              }} style={{
                textAlign: "left", padding: "8px 10px", borderRadius: "var(--radius-md)",
                border: `1px solid ${opts.selectedId === object.id ? "var(--border-brand)" : "var(--border-default)"}`,
                background: opts.selectedId === object.id ? "var(--surface-brand-subtle)" : "var(--surface-card)",
                color: "var(--text-heading)", cursor: "pointer", font: "var(--type-caption)",
              }}>{objectLabel(lang, object, index)}</button>
            )) : <span style={{ font: "var(--type-caption)", color: "var(--text-faint)" }}>{TX(lang, "Belum ada objek.", "No objects yet.")}</span>}
          </div>
        </Field>
        {dropped > 0 && (
          <Alert tone="warning">{TX(lang,
            `${dropped} karakter tidak tersedia di font mana pun yang dibawa PDFin dan akan dilewati saat diproses.`,
            `${dropped} character${dropped === 1 ? "" : "s"} are missing from every font PDFin ships and will be skipped on export.`)}</Alert>
        )}
        <OutputNameField lang={lang} value={opts.outputName || outputNameValue(ctx, "diedit")} inputId="edit-output-name"
          onChange={(outputName) => setOpts({ ...opts, outputName })} batchCount={ctx.files.length} />
      </div>
    );
  },
  overlay: (opts, setOpts) => (page) => (
    <AnnotationLayer page={page} opts={opts} setOpts={setOpts} lang={opts.lang || "id"} />
  ),
  disabled: (ctx, opts, lang = "id") => !(opts.objects || []).length || !!getOutputNameError(opts.outputName || outputNameValue(ctx, "diedit"), lang),
  disabledReason: (ctx, opts, t, lang) => getOutputNameError(opts.outputName || outputNameValue(ctx, "diedit"), lang)
    || TX(lang, "Tambahkan minimal satu objek ke halaman.", "Add at least one object to a page."),
  actionLabel: (ctx, opts, t, lang) => TX(lang, "Terapkan editan", "Apply edits"),
  nextAction: (ctx, opts, t, lang) => TX(lang, "Editan diterapkan secara lokal di browser Anda.", "Edits are applied locally in your browser."),
  successSummary: (result, ctx, opts, t, lang) => {
    const count = (opts.objects || []).length;
    const pages = new Set((opts.objects || []).map((object) => `${object.fileId}:${object.srcIndex}`)).size;
    const skipped = result.droppedCharacters
      ? TX(lang, ` ${result.droppedCharacters} karakter tidak didukung dilewati.`, ` ${result.droppedCharacters} unsupported character${result.droppedCharacters === 1 ? "" : "s"} skipped.`)
      : "";
    return TX(lang,
      `${count} objek diterapkan pada ${pages} halaman.${skipped}`,
      `${count} object${count === 1 ? "" : "s"} applied across ${pages} page${pages === 1 ? "" : "s"}.${skipped}`);
  },
  outName: (lang, opts = {}) => getPdfOutputName(opts.outputName || TX(lang, "dokumen-diedit", "edited-document"), lang),
  process: (ctx, opts, onProgress, lang) => PdfProcess.annotate(ctx.files, {
    objects: opts.objects,
    outputName: getPdfOutputName(opts.outputName || outputNameValue(ctx, "diedit"), lang),
  }, onProgress),
};
