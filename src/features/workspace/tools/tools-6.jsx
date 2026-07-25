import React from "react";
import { Alert, Button, Input } from "../../../components/index.js";
import { Field, Segmented, TX, TOOL_DEFS, getOutputNameError, getPdfOutputName, outputNameValue, OutputNameField } from "./tools-1.jsx";
import { PdfProcess } from "../engine/pdfProcess.js";

// PDFin workspace — tool defs part 6: redaction.
//
// Areas use the same normalized visible-page coordinates as the editor overlay
// in tools-5.jsx, so `engine/pdfRedact.js` can map them into PDF user space the
// same way the annotation stamper does.

let areaSeq = 0;
function nextAreaId() {
  areaSeq += 1;
  return `redact-${Date.now().toString(36)}-${areaSeq}`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function rectFromDrag(from, to) {
  const x = Math.min(from.x, to.x);
  const y = Math.min(from.y, to.y);
  return {
    x: clamp(x, 0, 1),
    y: clamp(y, 0, 1),
    w: Math.min(1 - x, Math.abs(to.x - from.x)),
    h: Math.min(1 - y, Math.abs(to.y - from.y)),
  };
}

function pointFromEvent(event, element) {
  const box = element.getBoundingClientRect();
  return {
    x: clamp((event.clientX - box.left) / box.width, 0, 1),
    y: clamp((event.clientY - box.top) / box.height, 0, 1),
  };
}

function RedactionLayer({ page, opts, setOpts, lang }) {
  const ref = React.useRef(null);
  const [draft, setDraft] = React.useState(null);
  const areas = (opts.areas || []).filter((area) => area.fileId === page.fileId && area.srcIndex === page.srcIndex);

  const startDraw = (event) => {
    const element = ref.current;
    if (!element) return;
    event.preventDefault();
    const origin = pointFromEvent(event, element);
    let current = origin;
    setDraft({ origin, current });
    const onMove = (moveEvent) => {
      current = pointFromEvent(moveEvent, element);
      setDraft({ origin, current });
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setDraft(null);
      const rect = rectFromDrag(origin, current);
      if (rect.w < 0.01 || rect.h < 0.005) return;
      const area = { id: nextAreaId(), fileId: page.fileId, srcIndex: page.srcIndex, rect };
      setOpts({ ...opts, areas: [...(opts.areas || []), area], selectedId: area.id });
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const draftRect = draft ? rectFromDrag(draft.origin, draft.current) : null;

  return (
    <div ref={ref} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <div onPointerDown={startDraw} aria-label={TX(lang, "Area penandaan redaksi", "Redaction marking area")} style={{
        position: "absolute", inset: 0, pointerEvents: "auto", cursor: "crosshair",
      }} />
      {areas.map((area) => (
        <button key={area.id} type="button" onClick={(event) => { event.stopPropagation(); setOpts({ ...opts, selectedId: area.id }); }}
          aria-label={TX(lang, "Area redaksi", "Redaction area")}
          style={{
            position: "absolute", left: `${area.rect.x * 100}%`, top: `${area.rect.y * 100}%`,
            width: `${area.rect.w * 100}%`, height: `${area.rect.h * 100}%`,
            background: opts.fillColor || "#000000", pointerEvents: "auto", cursor: "pointer",
            border: opts.selectedId === area.id ? "1.5px dashed var(--border-brand)" : "none", padding: 0,
          }} />
      ))}
      {draftRect && (
        <div aria-hidden="true" style={{
          position: "absolute", left: `${draftRect.x * 100}%`, top: `${draftRect.y * 100}%`,
          width: `${draftRect.w * 100}%`, height: `${draftRect.h * 100}%`,
          background: "color-mix(in srgb, var(--action-primary) 35%, transparent)",
          border: "1.5px dashed var(--border-brand)", pointerEvents: "none",
        }} />
      )}
    </div>
  );
}

function areaLabel(lang, area, index) {
  return `${index + 1}. ${TX(lang, "Area", "Area")} (${TX(lang, "hal.", "p.")} ${area.srcIndex + 1})`;
}

TOOL_DEFS.redact = {
  view: "preview",
  previewKind: "processed",
  defaults: { areas: [], selectedId: null, mode: "vector", fillColor: "#000000", outputName: "", loadedFor: null },
  Panel: ({ lang, opts, setOpts, ctx }) => {
    const file = ctx.files[0];
    const areas = opts.areas || [];

    React.useEffect(() => {
      if (file?.id && opts.loadedFor !== file.id) {
        setOpts((next) => next.loadedFor === file.id ? next : { ...next, outputName: outputNameValue(ctx, "redaksi"), loadedFor: file.id });
      }
    }, [file?.id]);
    React.useEffect(() => { setOpts((next) => (next.lang === lang ? next : { ...next, lang })); }, [lang]);

    const removeArea = (id) => setOpts({ ...opts, areas: areas.filter((area) => area.id !== id), selectedId: null });

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Alert tone="warning">{TX(lang,
          "Redaksi menghapus teks di bawah kotak dari isi PDF, bukan sekadar menutupinya. Hasilnya tidak bisa dibatalkan setelah diunduh — simpan file asli Anda.",
          "Redaction deletes the text under each box from the PDF content, not just covers it. The result cannot be undone once downloaded — keep your original file.")}</Alert>
        <Field label={TX(lang, "Cara menandai", "How to mark")}>
          <span style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>
            {TX(lang, "Seret di halaman untuk menandai area yang harus dihapus.", "Drag on the page to mark an area to remove.")}
          </span>
        </Field>
        <Field label={TX(lang, "Metode", "Method")} hint={opts.mode === "raster"
          ? TX(lang, "Setiap halaman yang diredaksi diratakan menjadi gambar. Paling aman, tetapi teks di halaman itu tidak lagi bisa dipilih atau dicari.", "Every redacted page is flattened to an image. Safest, but text on those pages is no longer selectable or searchable.")
          : TX(lang, "Teks dan gambar yang tertutup dihapus dari isi halaman. Halaman yang tidak dapat dipastikan bersih otomatis diratakan menjadi gambar.", "Covered text and images are deleted from the page content. Any page that cannot be proven clean is flattened to an image automatically.")}>
          <Segmented value={opts.mode} onChange={(mode) => setOpts({ ...opts, mode })} options={[
            { value: "vector", label: TX(lang, "Hapus teks", "Remove text") },
            { value: "raster", label: TX(lang, "Ratakan halaman", "Flatten page") },
          ]} />
        </Field>
        <Input label={TX(lang, "Warna kotak", "Box color")} type="color" value={opts.fillColor || "#000000"}
          onChange={(event) => setOpts({ ...opts, fillColor: event.target.value })} />
        <Field label={TX(lang, "Area redaksi", "Redaction areas")}>
          <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
            <Button variant="ghost" size="sm" disabled={!areas.length} onClick={() => setOpts({ ...opts, areas: areas.slice(0, -1), selectedId: null })}>
              {TX(lang, "Urungkan", "Undo")}
            </Button>
            <Button variant="ghost" size="sm" disabled={!areas.length} onClick={() => setOpts({ ...opts, areas: [], selectedId: null })}>
              {TX(lang, "Kosongkan", "Clear")}
            </Button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 220, overflowY: "auto" }}>
            {areas.length ? areas.map((area, index) => (
              <div key={area.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                padding: "6px 8px 6px 10px", borderRadius: "var(--radius-md)",
                border: `1px solid ${opts.selectedId === area.id ? "var(--border-brand)" : "var(--border-default)"}`,
                background: opts.selectedId === area.id ? "var(--surface-brand-subtle)" : "var(--surface-card)",
              }}>
                <button type="button" onClick={() => {
                  setOpts({ ...opts, selectedId: area.id });
                  const pageIndex = ctx.pages.findIndex((page) => page.fileId === area.fileId && page.srcIndex === area.srcIndex);
                  if (pageIndex >= 0) ctx.goToPreviewPage?.(pageIndex + 1);
                }} style={{ flex: 1, textAlign: "left", border: "none", background: "transparent", color: "var(--text-heading)", cursor: "pointer", font: "var(--type-caption)" }}>
                  {areaLabel(lang, area, index)}
                </button>
                <Button variant="ghost" size="sm" onClick={() => removeArea(area.id)}>{TX(lang, "Hapus", "Remove")}</Button>
              </div>
            )) : <span style={{ font: "var(--type-caption)", color: "var(--text-faint)" }}>{TX(lang, "Belum ada area.", "No areas yet.")}</span>}
          </div>
        </Field>
        <OutputNameField lang={lang} value={opts.outputName || outputNameValue(ctx, "redaksi")} inputId="redact-output-name"
          onChange={(outputName) => setOpts({ ...opts, outputName })} batchCount={ctx.files.length} />
      </div>
    );
  },
  overlay: (opts, setOpts) => (page) => (
    <RedactionLayer page={page} opts={opts} setOpts={setOpts} lang={opts.lang || "id"} />
  ),
  disabled: (ctx, opts, lang = "id") => !(opts.areas || []).length || !!getOutputNameError(opts.outputName || outputNameValue(ctx, "redaksi"), lang),
  disabledReason: (ctx, opts, t, lang) => getOutputNameError(opts.outputName || outputNameValue(ctx, "redaksi"), lang)
    || TX(lang, "Tandai minimal satu area untuk diredaksi.", "Mark at least one area to redact."),
  actionLabel: (ctx, opts, t, lang) => TX(lang, "Redaksi PDF", "Redact PDF"),
  nextAction: (ctx, opts, t, lang) => TX(lang, "Redaksi dijalankan secara lokal di browser Anda.", "Redaction runs locally in your browser."),
  successSummary: (result, ctx, opts, t, lang) => {
    const areas = (opts.areas || []).length;
    const glyphs = result.removedGlyphs || 0;
    const rasterized = result.rasterizedPages?.length || 0;
    const annotations = result.removedAnnotations || 0;
    const parts = [
      TX(lang, `${areas} area diredaksi.`, `${areas} area${areas === 1 ? "" : "s"} redacted.`),
      // Rasterized pages report no glyph count because the whole page content
      // was replaced rather than edited.
      glyphs ? TX(lang, `${glyphs} karakter dihapus dari isi PDF.`, `${glyphs} character${glyphs === 1 ? "" : "s"} deleted from the PDF content.`) : "",
      annotations ? TX(lang, `${annotations} anotasi dihapus.`, `${annotations} annotation${annotations === 1 ? "" : "s"} removed.`) : "",
      rasterized ? TX(lang, `${rasterized} halaman diratakan menjadi gambar agar dijamin bersih.`, `${rasterized} page${rasterized === 1 ? "" : "s"} flattened to an image to guarantee removal.`) : "",
    ].filter(Boolean);
    return parts.join(" ");
  },
  outName: (lang, opts = {}) => getPdfOutputName(opts.outputName || TX(lang, "dokumen-redaksi", "redacted-document"), lang),
  process: (ctx, opts, onProgress, lang) => PdfProcess.redact(ctx.files, {
    areas: opts.areas,
    mode: opts.mode,
    fillColor: opts.fillColor,
    outputName: getPdfOutputName(opts.outputName || outputNameValue(ctx, "redaksi"), lang),
  }, onProgress),
};
