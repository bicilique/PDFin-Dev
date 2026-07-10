import React from "react";
import { Alert, Button, Input } from "../../../components/index.js";
import { PdfEngine } from "../engine/pdfEngine.js";
import { PdfProcess } from "../engine/pdfProcess.js";

// PDFin workspace — tool defs part 1: shared inspector helpers + merge, split, organize, rotate, compress.

// ---- Shared inspector field helpers ----
export function Field({ label, children, hint }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ font: "var(--weight-semibold) 12px/1 var(--font-sans)", color: "var(--text-body)" }}>{label}</span>
      {children}
      {hint && <span style={{ font: "11px/1.4 var(--font-sans)", color: "var(--text-faint)" }}>{hint}</span>}
    </div>
  );
}

export function Segmented({ options, value, onChange }) {
  return (
    <div role="radiogroup" style={{ display: "flex", background: "var(--surface-sunken)", borderRadius: "var(--radius-md)", padding: 3, gap: 2 }}>
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)} style={{
          flex: 1, padding: "6px 8px", border: "none", borderRadius: 7, cursor: "pointer",
          background: value === o.value ? "var(--surface-card)" : "transparent",
          boxShadow: value === o.value ? "var(--shadow-card)" : "none",
          color: value === o.value ? "var(--text-heading)" : "var(--text-muted)",
          font: "var(--weight-semibold) 12px/1.2 var(--font-sans)", whiteSpace: "nowrap",
        }}>{o.label}</button>
      ))}
    </div>
  );
}

export function SliderRow({ label, value, onChange, min, max, step = 1, unit = "" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ font: "var(--weight-semibold) 12px/1 var(--font-sans)", color: "var(--text-body)" }}>{label}</span>
        <span style={{ font: "11.5px var(--font-mono)", color: "var(--text-muted)" }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} aria-label={label}
        onChange={(e) => onChange(+e.target.value)} style={{ width: "100%", accentColor: "var(--action-primary)" }} />
    </div>
  );
}

export function PosGrid({ value, onChange, rows = ["top", "middle", "bottom"] }) {
  const cols = ["left", "center", "right"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4, width: 120 }}>
      {rows.map((r) => cols.map((c) => {
        const v = r + "-" + c;
        return (
          <button key={v} type="button" aria-label={v} onClick={() => onChange(v)} style={{
            aspectRatio: "1", border: value === v ? "2px solid var(--action-primary)" : "1px solid var(--border-default)",
            borderRadius: 6, background: value === v ? "var(--surface-brand-subtle)" : "var(--surface-card)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 2, background: value === v ? "var(--action-primary)" : "var(--ink-300)" }}></span>
          </button>
        );
      }))}
    </div>
  );
}

export function SelCount({ t, n }) {
  return <span style={{ font: "var(--type-caption)", color: n ? "var(--text-brand)" : "var(--text-faint)" }}>{n} {t.select.selected}</span>;
}

export const TX = (lang, id, en) => (lang === "id" ? id : en);

// ---- Tool definitions ----
export const TOOL_DEFS = {};

TOOL_DEFS.merge = {
  multiFile: true, allowReorderFiles: true, view: "grid", selectable: false,
  defaults: {},
  disabled: (ctx) => ctx.files.length < 2,
  outName: (lang) => TX(lang, "hasil-gabungan.pdf", "merged.pdf"),
  Panel: ({ t, lang, ctx }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Alert tone="info">{TX(lang,
        "Urutkan file di panel kiri — halaman digabung sesuai urutan itu.",
        "Reorder files in the left panel — pages are merged in that order.")}</Alert>
      <Field label={TX(lang, "Ringkasan", "Summary")}>
        <span style={{ font: "12.5px var(--font-mono)", color: "var(--text-muted)" }}>
          {ctx.files.length} {t.success.files} · {ctx.pages.filter((p) => !p.deleted).length} {t.success.pages}
        </span>
      </Field>
      {ctx.files.length < 2 && (
        <span style={{ font: "var(--type-caption)", color: "var(--text-faint)" }}>{TX(lang, "Tambahkan minimal 2 file PDF.", "Add at least 2 PDF files.")}</span>
      )}
    </div>
  ),
  successSummary: (result, ctx, opts, t, lang) => {
    const files = result.outputs.length;
    const pages = result.outputs.reduce((sum, output) => sum + (output.pages || 0), 0);
    return TX(lang, `${files} file PDF dibuat dari ${pages} halaman.`, `${files} PDF file${files === 1 ? "" : "s"} created from ${pages} page${pages === 1 ? "" : "s"}.`);
  },
  process: (ctx, opts, onP, lang) => PdfProcess.assemble(ctx.pages, TOOL_DEFS.merge.outName(lang), onP),
};

TOOL_DEFS.split = {
  view: "grid",
  defaults: { mode: "every", n: 2, range: "1-3" },
  selectableWhen: (opts) => opts.mode === "selected",
  disabled: (ctx, opts) => {
    const live = ctx.pages.filter((p) => !p.deleted);
    if (!live.length) return true;
    if (opts.mode === "range") return PdfProcess.parseRange(opts.range, live.length).length === 0;
    if (opts.mode === "selected") return ctx.selection.size === 0;
    return false;
  },
  disabledReason: (ctx, opts, t, lang) => {
    const live = ctx.pages.filter((p) => !p.deleted);
    if (!live.length) return t.toolRequirements.split;
    if (opts.mode === "range" && PdfProcess.parseRange(opts.range, live.length).length === 0) {
      return TX(lang, "Masukkan rentang halaman yang valid untuk dokumen ini.", "Enter a valid page range for this document.");
    }
    if (opts.mode === "selected" && ctx.selection.size === 0) {
      return TX(lang, "Pilih minimal 1 halaman untuk dipisahkan.", "Select at least 1 page to split.");
    }
    return t.toolRequirements.split;
  },
  nextAction: (ctx, opts, t, lang) => {
    const live = ctx.pages.filter((p) => !p.deleted);
    if (opts.mode === "every") {
      const count = Math.ceil(live.length / Math.max(1, opts.n));
      return TX(lang, `${count} file PDF akan dibuat.`, `${count} PDF file${count === 1 ? "" : "s"} will be created.`);
    }
    if (opts.mode === "range") {
      const count = PdfProcess.parseRange(opts.range, live.length).length;
      return TX(lang, `${count} halaman siap dipisahkan.`, `${count} page${count === 1 ? "" : "s"} ready to split.`);
    }
    return TX(lang, `${ctx.selection.size} halaman siap dipisahkan.`, `${ctx.selection.size} page${ctx.selection.size === 1 ? "" : "s"} ready to split.`);
  },
  Panel: ({ t, lang, opts, setOpts, ctx }) => {
    const live = ctx.pages.filter((p) => !p.deleted);
    const nOut = opts.mode === "every" ? Math.ceil(live.length / Math.max(1, opts.n)) : 1;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label={TX(lang, "Cara memisah", "Split method")}>
          <Segmented value={opts.mode} onChange={(mode) => setOpts({ ...opts, mode })} options={[
            { value: "every", label: TX(lang, "Tiap N", "Every N") },
            { value: "range", label: TX(lang, "Rentang", "Range") },
            { value: "selected", label: TX(lang, "Pilihan", "Selected") },
          ]} />
        </Field>
        {opts.mode === "every" && (
          <SliderRow label={TX(lang, "Halaman per file", "Pages per file")} value={opts.n} min={1} max={Math.max(2, live.length)} onChange={(n) => setOpts({ ...opts, n })} />
        )}
        {opts.mode === "range" && (
          <Input mono label={TX(lang, "Rentang halaman", "Page range")} value={opts.range} placeholder="1-3, 7, 10-12"
            onChange={(e) => setOpts({ ...opts, range: e.target.value })}
            hint={TX(lang, "Contoh: 1-3, 7, 10-12", "Example: 1-3, 7, 10-12")} />
        )}
        {opts.mode === "selected" && (
          <Field label={TX(lang, "Halaman terpilih", "Selected pages")}>
            <SelCount t={t} n={ctx.selection.size} />
            <span style={{ font: "11px/1.4 var(--font-sans)", color: "var(--text-faint)" }}>{TX(lang, "Klik halaman di kiri untuk memilih.", "Click pages on the left to select.")}</span>
          </Field>
        )}
        <Field label={t.inspector.output}>
          <span style={{ font: "12.5px var(--font-mono)", color: "var(--text-muted)" }}>
            {opts.mode === "every" ? `${nOut} file PDF` : opts.mode === "range" ? `1 file · ${PdfProcess.parseRange(opts.range, live.length).length} ${t.success.pages}` : `1 file · ${ctx.selection.size} ${t.success.pages}`}
          </span>
        </Field>
      </div>
    );
  },
  successSummary: (result, ctx, opts, t, lang) => {
    const files = result.outputs.length;
    return TX(lang, `${files} file PDF dibuat.`, `${files} PDF file${files === 1 ? "" : "s"} created.`);
  },
  process: (ctx, opts, onP, lang) => {
    const base = (ctx.files[0] ? ctx.files[0].name.replace(/\.pdf$/i, "") : "hasil");
    return PdfProcess.split(ctx.pages, { ...opts, selected: ctx.selection }, base, onP);
  },
};

TOOL_DEFS.organize = {
  view: "grid", selectable: true, reorder: true, pageActions: true, undoable: true,
  defaults: {},
  nextAction: (ctx, opts, t, lang) => {
    const pages = ctx.pages.filter((p) => !p.deleted).length;
    return TX(lang, `Susun ${pages} halaman, lalu proses PDF baru.`, `Arrange ${pages} page${pages === 1 ? "" : "s"}, then process the new PDF.`);
  },
  Panel: ({ t, lang, ctx }) => {
    const sel = [...ctx.selection];
    const any = sel.length > 0;
    const B = ({ children, onClick, danger, disabled }) => (
      <Button variant={danger ? "danger" : "secondary"} size="sm" fullWidth disabled={disabled} onClick={onClick}>{children}</Button>
    );
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label={TX(lang, "Halaman terpilih", "Selected pages")}><SelCount t={t} n={sel.length} /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <B disabled={!any} onClick={() => ctx.pageOps.rotate(sel, -90)}>{t.pageMenu.rotateL}</B>
          <B disabled={!any} onClick={() => ctx.pageOps.rotate(sel, 90)}>{t.pageMenu.rotateR}</B>
          <B disabled={!any} onClick={() => ctx.pageOps.duplicate(sel)}>{t.pageMenu.duplicate}</B>
          <B danger disabled={!any} onClick={() => ctx.pageOps.remove(sel)}>{t.pageMenu.delete}</B>
        </div>
        <Alert tone="info">{TX(lang,
          "Tarik kartu halaman untuk menyusun ulang. Klik kanan untuk menu aksi.",
          "Drag page cards to reorder. Right-click for actions.")}</Alert>
      </div>
    );
  },
  disabled: (ctx) => ctx.pages.filter((p) => !p.deleted).length === 0,
  outName: (lang) => TX(lang, "halaman-tersusun.pdf", "organized.pdf"),
  successSummary: (result, ctx, opts, t, lang) => {
    const pages = result.outputs.reduce((sum, output) => sum + (output.pages || 0), 0);
    return TX(lang, `${pages} halaman disimpan sesuai urutan pratinjau.`, `${pages} page${pages === 1 ? "" : "s"} saved in the preview order.`);
  },
  process: (ctx, opts, onP, lang) => PdfProcess.assemble(ctx.pages, TOOL_DEFS.organize.outName(lang), onP),
};

TOOL_DEFS.rotate = {
  view: "grid", selectable: true,
  defaults: {},
  Panel: ({ t, lang, ctx }) => {
    const sel = [...ctx.selection];
    const all = ctx.pages.filter((p) => !p.deleted).map((p) => p.uid);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label={TX(lang, "Halaman terpilih", "Selected pages")}><SelCount t={t} n={sel.length} /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <Button variant="secondary" size="sm" disabled={!sel.length} onClick={() => ctx.pageOps.rotate(sel, -90)}>↺ −90°</Button>
          <Button variant="secondary" size="sm" disabled={!sel.length} onClick={() => ctx.pageOps.rotate(sel, 90)}>↻ +90°</Button>
        </div>
        <Field label={TX(lang, "Semua halaman", "All pages")}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Button variant="ghost" size="sm" onClick={() => ctx.pageOps.rotate(all, -90)}>↺ {TX(lang, "Semua", "All")}</Button>
            <Button variant="ghost" size="sm" onClick={() => ctx.pageOps.rotate(all, 90)}>↻ {TX(lang, "Semua", "All")}</Button>
          </div>
        </Field>
        <Alert tone="info">{TX(lang, "Rotasi diterapkan permanen saat diproses.", "Rotation is applied permanently on process.")}</Alert>
      </div>
    );
  },
  disabled: (ctx) => !ctx.pages.some((p) => !p.deleted && p.rotation),
  outName: (lang) => TX(lang, "hasil-putar.pdf", "rotated.pdf"),
  process: (ctx, opts, onP, lang) => PdfProcess.assemble(ctx.pages, TOOL_DEFS.rotate.outName(lang), onP),
};

TOOL_DEFS.compress = {
  view: "preview",
  defaults: { level: "medium" },
  nextAction: (ctx, opts, t, lang) => {
    const pages = ctx.pages.filter((p) => !p.deleted).length;
    return TX(lang, `Kompres ${pages} halaman secara lokal di browser.`, `Compress ${pages} page${pages === 1 ? "" : "s"} locally in your browser.`);
  },
  Panel: ({ t, lang, opts, setOpts, ctx }) => {
    const totalIn = ctx.files.reduce((a, f) => a + f.size, 0);
    const factor = { low: 0.22, medium: 0.42, high: 0.68 }[opts.level];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label={TX(lang, "Tingkat kompresi", "Compression level")}>
          <Segmented value={opts.level} onChange={(level) => setOpts({ ...opts, level })} options={[
            { value: "low", label: TX(lang, "Kuat", "Strong") },
            { value: "medium", label: TX(lang, "Seimbang", "Balanced") },
            { value: "high", label: TX(lang, "Kualitas", "Quality") },
          ]} />
        </Field>
        <Field label={TX(lang, "Perkiraan hasil", "Estimated result")}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, font: "13px var(--font-mono)", color: "var(--text-heading)" }}>
            <span style={{ color: "var(--text-muted)", textDecoration: "line-through" }}>{PdfEngine.fmtSize(totalIn, lang)}</span>
            <span aria-hidden="true" style={{ color: "var(--text-faint)" }}>→</span>
            <span style={{ color: "var(--status-success-fg)", fontWeight: 600 }}>≈ {PdfEngine.fmtSize(totalIn * factor, lang)}</span>
          </div>
        </Field>
        <Alert tone="warning">{TX(lang,
          "Halaman dirender ulang sebagai gambar — teks tidak lagi dapat dipilih.",
          "Pages are re-rendered as images — text will no longer be selectable.")}</Alert>
      </div>
    );
  },
  processLabel: (t, lang) => TX(lang, "Merender ulang halaman…", "Re-rendering pages…"),
  outName: (lang) => TX(lang, "hasil-kompres.pdf", "compressed.pdf"),
  successSummary: (result, ctx, opts, t, lang) => {
    const output = result.outputs[0];
    return TX(lang,
      `${output?.pages || 0} halaman dikompres di browser. File asli tidak diunggah.`,
      `${output?.pages || 0} page${output?.pages === 1 ? "" : "s"} compressed in your browser. The original file was not uploaded.`);
  },
  process: (ctx, opts, onP, lang) => PdfProcess.compress(ctx.pages, opts, TOOL_DEFS.compress.outName(lang), onP),
};
