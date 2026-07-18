import React from "react";
import { Alert, Button, Input, splitModeIcons } from "../../../components/index.js";
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

export const POSITION_LABELS = {
  "top-left": "Kiri atas",
  "top-center": "Tengah atas",
  "top-right": "Kanan atas",
  "middle-left": "Kiri tengah",
  "middle-center": "Tengah",
  "middle-right": "Kanan tengah",
  "bottom-left": "Kiri bawah",
  "bottom-center": "Tengah bawah",
  "bottom-right": "Kanan bawah",
};

export function PosGrid({ value, onChange, rows = ["top", "middle", "bottom"], lang = "id" }) {
  const cols = ["left", "center", "right"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4, width: 120 }}>
      {rows.map((r) => cols.map((c) => {
        const v = r + "-" + c;
        const label = lang === "id" ? POSITION_LABELS[v] || v : v.replace("-", " ");
        return (
          <button key={v} type="button" aria-label={label} title={label} onClick={() => onChange(v)} style={{
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
    : TX(lang, "Nama file tidak boleh kosong.", "File name cannot be empty.");
}

export function getPdfOutputName(raw, lang) {
  const base = sanitizePdfBaseName(raw) || TX(lang, "hasil-gabungan", "merged");
  return `${base}.pdf`;
}

export function parsePageRange(range, pageCount, lang = "id", allowEmpty = false) {
  const raw = String(range || "").trim();
  if (!raw) {
    return allowEmpty
      ? { pages: [], error: "" }
      : { pages: [], error: TX(lang, "Masukkan rentang halaman.", "Enter a page range.") };
  }
  return analyzeSplitRange(raw, pageCount, lang);
}

export function pageScopeIncludes(opts, pageIndex, pageCount, lang = "id") {
  if (opts.excludeFirst && pageIndex === 0) return false;
  if (opts.scope !== "range") return true;
  const parsed = parsePageRange(opts.range, pageCount, lang);
  if (parsed.error) return false;
  return parsed.pages.includes(pageIndex);
}

export function getScopeError(opts, pageCount, lang = "id") {
  if (!opts || opts.scope !== "range") return "";
  return parsePageRange(opts.range, pageCount, lang).error;
}

export function analyzeSplitRange(range, pageCount, lang = "id") {
  const raw = String(range || "").trim();
  if (!raw) return { pages: [], error: TX(lang, "Masukkan rentang halaman.", "Enter a page range.") };
  const parts = raw.split(",").map((part) => part.trim()).filter(Boolean);
  if (!parts.length) return { pages: [], error: TX(lang, "Masukkan rentang halaman.", "Enter a page range.") };

  const pages = new Set();
  for (const part of parts) {
    const span = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (span) {
      const start = Number(span[1]);
      const end = Number(span[2]);
      if (start > end) {
        return { pages: [], error: TX(lang, "Rentang harus dimulai dari halaman yang lebih kecil.", "Ranges must start with the smaller page number.") };
      }
      for (let page = start; page <= end; page += 1) {
        if (page >= 1 && page <= pageCount) pages.add(page - 1);
      }
      continue;
    }
    if (/^\d+$/.test(part)) {
      const page = Number(part);
      if (page >= 1 && page <= pageCount) pages.add(page - 1);
      continue;
    }
    return { pages: [], error: TX(lang, "Gunakan format seperti 1-3, 4, 7-9.", "Use a format like 1-3, 4, 7-9.") };
  }

  const sorted = [...pages].sort((a, b) => a - b);
  if (!sorted.length) {
    return { pages: [], error: TX(lang, "Masukkan rentang halaman yang valid untuk dokumen ini.", "Enter a valid page range for this document.") };
  }
  return { pages: sorted, error: "" };
}

export function getSplitOutputCount(ctx, opts, lang = "id") {
  const live = ctx.pages.filter((p) => !p.deleted);
  if (!live.length) return 0;
  if (opts.mode === "every") return Math.ceil(live.length / Math.max(1, opts.n || 1));
  if (opts.mode === "range") return analyzeSplitRange(opts.range, live.length, lang).error ? 0 : 1;
  return ctx.selection.size ? 1 : 0;
}

export function getSplitPlan(ctx, opts, lang = "id") {
  const live = ctx.pages.filter((p) => !p.deleted);
  if (!live.length) {
    return {
      outputCount: 0,
      selectedCount: 0,
      rangePages: [],
      error: TX(lang, "Tambahkan 1 file PDF untuk dipisahkan.", "Add 1 PDF file to split."),
      summary: TX(lang, "Belum ada halaman valid.", "No valid pages yet."),
    };
  }
  if (opts.mode === "every") {
    const n = Math.max(1, opts.n || 1);
    const outputCount = Math.ceil(live.length / n);
    return {
      outputCount,
      selectedCount: live.length,
      rangePages: [],
      error: "",
      summary: TX(lang, `Setiap ${n} halaman -> ${outputCount} file PDF akan dibuat.`, `Every ${n} page${n === 1 ? "" : "s"} -> ${outputCount} PDF file${outputCount === 1 ? "" : "s"} will be created.`),
    };
  }
  if (opts.mode === "range") {
    const analysis = analyzeSplitRange(opts.range, live.length, lang);
    return {
      outputCount: analysis.error ? 0 : 1,
      selectedCount: analysis.pages.length,
      rangePages: analysis.pages,
      error: analysis.error,
      summary: analysis.error
        ? TX(lang, "Rentang belum valid.", "Range is not valid yet.")
        : TX(lang, `Rentang ${opts.range} -> 1 file PDF akan dibuat dari ${analysis.pages.length} halaman.`, `Range ${opts.range} -> 1 PDF file will be created from ${analysis.pages.length} page${analysis.pages.length === 1 ? "" : "s"}.`),
    };
  }
  const count = ctx.selection.size;
  return {
    outputCount: count ? 1 : 0,
    selectedCount: count,
    rangePages: [],
    error: count ? "" : TX(lang, "Pilih minimal 1 halaman untuk dipisahkan.", "Select at least 1 page to split."),
    summary: TX(lang, `${count} halaman dipilih -> ${count ? 1 : 0} file PDF akan dibuat.`, `${count} page${count === 1 ? "" : "s"} selected -> ${count ? 1 : 0} PDF file${count ? "" : "s"} will be created.`),
  };
}

function SplitModeIcon({ mode }) {
  return (splitModeIcons[mode] || splitModeIcons.every)(16);
}

function SplitModePicker({ lang, value, onChange }) {
  const modes = [
    { value: "every", label: TX(lang, "Setiap N halaman", "Every N pages"), desc: TX(lang, "Buat file baru setiap N halaman.", "Create a new file every N pages.") },
    { value: "range", label: TX(lang, "Rentang halaman", "Page range"), desc: TX(lang, "Buat satu PDF dari rentang yang Anda tentukan, misalnya 1-3, 4-8.", "Create one PDF from ranges you enter, such as 1-3, 4-8.") },
    { value: "selected", label: TX(lang, "Pilih halaman", "Select pages"), desc: TX(lang, "Buat satu PDF dari halaman yang dipilih.", "Create one PDF from selected pages.") },
  ];
  return (
    <div role="radiogroup" aria-label={TX(lang, "Cara memisah", "Split method")} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {modes.map((mode) => {
        const active = value === mode.value;
        return (
          <button key={mode.value} type="button" role="radio" aria-checked={active} onClick={() => onChange(mode.value)} style={{
            display: "grid", gridTemplateColumns: "24px 1fr", gap: 8, width: "100%", padding: "10px 11px",
            border: `1px solid ${active ? "var(--border-brand)" : "var(--border-default)"}`,
            borderRadius: "var(--radius-md)", background: active ? "var(--surface-brand-subtle)" : "var(--surface-card)",
            boxShadow: active ? "var(--shadow-focus)" : "none", color: active ? "var(--text-heading)" : "var(--text-body)",
            cursor: "pointer", textAlign: "left",
          }}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", color: active ? "var(--text-brand)" : "var(--text-muted)", paddingTop: 1 }}>
              <SplitModeIcon mode={mode.value} />
            </span>
            <span style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
              <span style={{ font: "var(--weight-semibold) 12.5px/1.2 var(--font-sans)", color: "var(--text-heading)" }}>{mode.label}</span>
              <span style={{ font: "11.5px/1.35 var(--font-sans)", color: "var(--text-muted)" }}>{mode.desc}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ---- Tool definitions ----
export const TOOL_DEFS = {};

TOOL_DEFS.merge = {
  multiFile: true, allowReorderFiles: true, view: "grid", selectable: false,
  defaults: { outputName: "hasil-gabungan" },
  reorder: true,
  disabled: (ctx, opts, lang = "id") => ctx.validFiles.length < 2 || ctx.loadingFiles.length > 0 || !!getOutputNameError(opts.outputName, lang),
  disabledReason: (ctx, opts, t, lang) => {
    const outputError = getOutputNameError(opts.outputName, lang);
    if (outputError) return outputError;
    if (ctx.loadingFiles.length > 0) return TX(lang, "Tunggu hingga semua PDF selesai dibaca.", "Wait until all PDFs finish loading.");
    if (ctx.validFiles.length < 2) return TX(lang, "Tambahkan minimal 2 file PDF yang valid.", "Add at least 2 valid PDF files.");
    return t.toolRequirements.merge;
  },
  outName: (lang, opts = {}) => getPdfOutputName(opts.outputName, lang),
  ActionFields: ({ lang, opts, setOpts }) => {
    const error = getOutputNameError(opts.outputName, lang);
    const inputId = "merge-output-name";
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label htmlFor={inputId} style={{ font: "var(--type-label)", color: "var(--text-heading)" }}>
          {TX(lang, "Nama file hasil", "Output file name")}
        </label>
        <div style={{
          display: "flex",
          alignItems: "center",
          border: `1px solid ${error ? "var(--red-600)" : "var(--border-default)"}`,
          borderRadius: "var(--radius-md)",
          background: "var(--surface-card)",
          overflow: "hidden",
        }}>
          <input
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            value={opts.outputName}
            onChange={(e) => setOpts((next) => ({ ...next, outputName: e.target.value }))}
            style={{
              minWidth: 0,
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              color: "var(--text-heading)",
              font: "var(--type-body)",
              padding: "9px 10px 9px 12px",
            }}
          />
          <span aria-hidden="true" style={{
            flex: "none",
            borderLeft: "1px solid var(--border-default)",
            background: "var(--surface-sunken)",
            color: "var(--text-muted)",
            font: "var(--type-caption)",
            padding: "10px 11px",
          }}>.pdf</span>
        </div>
        {error && <span id={`${inputId}-error`} style={{ font: "var(--type-caption)", color: "var(--status-error-fg)" }}>{error}</span>}
      </div>
    );
  },
  Panel: ({ t, lang, ctx }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Alert tone="info">{TX(lang,
        "Urutkan file di panel kiri — halaman digabung sesuai urutan itu.",
        "Reorder files in the left panel — pages are merged in that order.")}</Alert>
      <Field label={TX(lang, "Ringkasan", "Summary")}>
        <span style={{ font: "12.5px var(--font-mono)", color: "var(--text-muted)" }}>
          {ctx.validFiles.length} {t.success.files} · {ctx.pages.filter((p) => !p.deleted).length} {t.success.pages}
        </span>
      </Field>
      {ctx.validFiles.length < 2 && (
        <span style={{ font: "var(--type-caption)", color: "var(--text-faint)" }}>{TX(lang, "Tambahkan minimal 2 file PDF yang valid.", "Add at least 2 valid PDF files.")}</span>
      )}
    </div>
  ),
  successSummary: (result, ctx, opts, t, lang) => {
    const files = result.outputs.length;
    const pages = result.outputs.reduce((sum, output) => sum + (output.pages || 0), 0);
    const name = result.outputs[0]?.name || TOOL_DEFS.merge.outName(lang, opts);
    return TX(lang,
      `Siap diunduh: ${name}. ${files} file PDF dibuat dari ${pages} halaman.`,
      `Ready to download: ${name}. ${files} PDF file${files === 1 ? "" : "s"} created from ${pages} page${pages === 1 ? "" : "s"}.`);
  },
  process: (ctx, opts, onP, lang) => PdfProcess.assemble(ctx.pages, TOOL_DEFS.merge.outName(lang, opts), onP),
};

TOOL_DEFS.split = {
  view: "grid",
  defaults: { mode: "every", n: 2, range: "1-3" },
  selectableWhen: (opts) => opts.mode === "selected",
  disabled: (ctx, opts, lang = "id") => {
    const live = ctx.pages.filter((p) => !p.deleted);
    if (!live.length) return true;
    if (opts.mode === "range") return !!analyzeSplitRange(opts.range, live.length, lang).error;
    if (opts.mode === "selected") return ctx.selection.size === 0;
    return false;
  },
  disabledReason: (ctx, opts, t, lang) => {
    const live = ctx.pages.filter((p) => !p.deleted);
    if (!live.length) return t.toolRequirements.split;
    if (opts.mode === "range") return analyzeSplitRange(opts.range, live.length, lang).error || t.toolRequirements.split;
    if (opts.mode === "selected" && ctx.selection.size === 0) {
      return TX(lang, "Pilih minimal 1 halaman untuk dipisahkan.", "Select at least 1 page to split.");
    }
    return t.toolRequirements.split;
  },
  actionLabel: (ctx, opts, t, lang) => {
    const count = getSplitOutputCount(ctx, opts, lang);
    return count ? TX(lang, `Pisah PDF (${count} file)`, `Split PDF (${count} file${count === 1 ? "" : "s"})`) : t.toolNames.split;
  },
  nextAction: (ctx, opts, t, lang) => {
    return getSplitPlan(ctx, opts, lang).summary;
  },
  Panel: ({ t, lang, opts, setOpts, ctx }) => {
    const live = ctx.pages.filter((p) => !p.deleted);
    const plan = getSplitPlan(ctx, opts, lang);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label={TX(lang, "Cara memisah", "Split method")}>
          <SplitModePicker lang={lang} value={opts.mode} onChange={(mode) => setOpts({ ...opts, mode })} />
        </Field>
        {opts.mode === "every" && (
          <SliderRow label={TX(lang, "Halaman per file", "Pages per file")} value={opts.n} min={1} max={Math.max(2, live.length)} onChange={(n) => setOpts({ ...opts, n })} />
        )}
        {opts.mode === "range" && (
          <Input mono label={TX(lang, "Rentang halaman", "Page range")} value={opts.range} placeholder="1-3, 4-8, 9-12"
            onChange={(e) => setOpts({ ...opts, range: e.target.value })}
            error={plan.error}
            hint={TX(lang, "Contoh: 1-3, 7, 10-12. Halaman yang cocok akan disorot.", "Example: 1-3, 7, 10-12. Matching pages are highlighted.")} />
        )}
        {opts.mode === "selected" && (
          <Field label={TX(lang, "Halaman terpilih", "Selected pages")}>
            <SelCount t={t} n={ctx.selection.size} />
            <span style={{ font: "11px/1.4 var(--font-sans)", color: "var(--text-faint)" }}>{TX(lang, "Gunakan checkbox di grid halaman untuk memilih.", "Use checkboxes in the page grid to select.")}</span>
          </Field>
        )}
        <Field label={t.inspector.output}>
          <span style={{ font: "12.5px/1.45 var(--font-mono)", color: plan.error ? "var(--status-error-fg)" : "var(--text-muted)" }}>
            {plan.summary}
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
    const duplicateLabel = sel.length <= 1
      ? TX(lang, "Duplikat halaman", "Duplicate page")
      : TX(lang, `Duplikat ${sel.length} halaman`, `Duplicate ${sel.length} pages`);
    const B = ({ children, onClick, danger, disabled }) => (
      <Button variant={danger ? "danger" : "secondary"} size="sm" fullWidth disabled={disabled} onClick={onClick}>{children}</Button>
    );
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label={TX(lang, "Halaman terpilih", "Selected pages")}><SelCount t={t} n={sel.length} /></Field>
        {any && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <B onClick={() => ctx.pageOps.rotate(sel, -90)}>{t.pageMenu.rotateL}</B>
            <B onClick={() => ctx.pageOps.rotate(sel, 90)}>{t.pageMenu.rotateR}</B>
            <B onClick={() => ctx.pageOps.duplicate(sel)}>{duplicateLabel}</B>
            <B danger onClick={() => ctx.pageOps.remove(sel)}>{t.pageMenu.delete}</B>
          </div>
        )}
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
  previewKind: "compress",
  defaults: { level: "medium", outputName: "hasil-kompres" },
  nextAction: (ctx, opts, t, lang) => {
    const pages = ctx.pages.filter((p) => !p.deleted).length;
    return TX(lang, `Kompres ${pages} halaman secara lokal di browser.`, `Compress ${pages} page${pages === 1 ? "" : "s"} locally in your browser.`);
  },
  Panel: ({ t, lang, opts, setOpts, ctx }) => {
    const totalIn = ctx.files.reduce((a, f) => a + f.size, 0);
    const descriptions = {
      low: TX(lang, "Prioritaskan ukuran file paling kecil dengan penurunan kualitas visual lebih besar.", "Prioritize the smallest file size with a larger visual quality trade-off."),
      medium: TX(lang, "Pilihan aman untuk ukuran lebih kecil dengan kualitas tetap layak dibaca.", "A balanced choice for smaller files with readable quality."),
      high: TX(lang, "Pertahankan kualitas visual lebih tinggi dengan pengurangan ukuran lebih ringan.", "Preserve higher visual quality with a lighter size reduction."),
    };
    const range = {
      low: "55-80%",
      medium: "35-60%",
      high: "15-35%",
    }[opts.level];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label={TX(lang, "Tingkat kompresi", "Compression level")}>
          <Segmented value={opts.level} onChange={(level) => setOpts({ ...opts, level })} options={[
            { value: "low", label: TX(lang, "Ukuran lebih kecil", "Smaller size") },
            { value: "medium", label: TX(lang, "Seimbang", "Balanced") },
            { value: "high", label: TX(lang, "Kualitas tinggi", "High quality") },
          ]} />
          <span style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>{descriptions[opts.level]}</span>
        </Field>
        <Field label={TX(lang, "Perkiraan pengurangan ukuran", "Estimated size reduction")}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ font: "13px var(--font-mono)", color: "var(--text-heading)" }}>{PdfEngine.fmtSize(totalIn, lang)}</span>
            <span style={{ font: "var(--type-caption)", color: "var(--status-success-fg)" }}>
              {TX(lang, `Kemungkinan berkurang sekitar ${range}. Hasil akhir tergantung isi PDF.`, `Likely reduced by about ${range}. Final size depends on PDF content.`)}
            </span>
          </div>
        </Field>
        <OutputNameField lang={lang} value={opts.outputName} onChange={(outputName) => setOpts({ ...opts, outputName })} inputId="compress-output-name" />
        <Alert tone="warning">{TX(lang,
          "Metode kompresi ini merender ulang halaman sebagai gambar, sehingga teks mungkin tidak bisa dipilih.",
          "This compression method re-renders pages as images, so text may no longer be selectable.")}</Alert>
      </div>
    );
  },
  disabled: (ctx, opts, lang = "id") => !!getOutputNameError(opts.outputName, lang),
  disabledReason: (ctx, opts, t, lang) => getOutputNameError(opts.outputName, lang) || t.toolRequirements.compress,
  processLabel: (t, lang) => TX(lang, "Merender ulang halaman…", "Re-rendering pages…"),
  outName: (lang, opts = {}) => getPdfOutputName(opts.outputName || TX(lang, "hasil-kompres", "compressed"), lang),
  successSummary: (result, ctx, opts, t, lang) => {
    const output = result.outputs[0];
    const inputSize = ctx.files.reduce((a, f) => a + f.size, 0);
    return TX(lang,
      `${output?.pages || 0} halaman dikompres di browser. Ukuran sumber ${PdfEngine.fmtSize(inputSize, lang)}, hasil ${PdfEngine.fmtSize(output?.size || 0, lang)}.`,
      `${output?.pages || 0} page${output?.pages === 1 ? "" : "s"} compressed in your browser. Source size ${PdfEngine.fmtSize(inputSize, lang)}, result ${PdfEngine.fmtSize(output?.size || 0, lang)}.`);
  },
  process: (ctx, opts, onP, lang) => PdfProcess.compress(ctx.pages, opts, TOOL_DEFS.compress.outName(lang, opts), onP),
};

export function OutputNameField({ lang, value, onChange, inputId }) {
  const error = getOutputNameError(value, lang);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label htmlFor={inputId} style={{ font: "var(--type-label)", color: "var(--text-heading)" }}>
        {TX(lang, "Nama file hasil", "Output file name")}
      </label>
      <div style={{
        display: "flex",
        alignItems: "center",
        border: `1px solid ${error ? "var(--red-600)" : "var(--border-default)"}`,
        borderRadius: "var(--radius-md)",
        background: "var(--surface-card)",
        overflow: "hidden",
      }}>
        <input
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            minWidth: 0,
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            color: "var(--text-heading)",
            font: "var(--type-body)",
            padding: "9px 10px 9px 12px",
          }}
        />
        <span aria-hidden="true" style={{
          flex: "none",
          borderLeft: "1px solid var(--border-default)",
          background: "var(--surface-sunken)",
          color: "var(--text-muted)",
          font: "var(--type-caption)",
          padding: "10px 11px",
        }}>.pdf</span>
      </div>
      {error && <span id={`${inputId}-error`} style={{ font: "var(--type-caption)", color: "var(--status-error-fg)" }}>{error}</span>}
    </div>
  );
}
