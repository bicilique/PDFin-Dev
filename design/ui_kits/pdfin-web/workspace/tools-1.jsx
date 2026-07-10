// PDFin workspace — tool defs part 1: shared inspector helpers + merge, split, organize, rotate, compress.
const TDS = window.PDFinDesignSystem_41a2ca;

// ---- Shared inspector field helpers ----
function Field({ label, children, hint }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ font: "var(--weight-semibold) 12px/1 var(--font-sans)", color: "var(--text-body)" }}>{label}</span>
      {children}
      {hint && <span style={{ font: "11px/1.4 var(--font-sans)", color: "var(--text-faint)" }}>{hint}</span>}
    </div>
  );
}

function Segmented({ options, value, onChange }) {
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

function SliderRow({ label, value, onChange, min, max, step = 1, unit = "" }) {
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

function PosGrid({ value, onChange, rows = ["top", "middle", "bottom"] }) {
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

function SelCount({ t, n }) {
  return <span style={{ font: "var(--type-caption)", color: n ? "var(--text-brand)" : "var(--text-faint)" }}>{n} {t.select.selected}</span>;
}

const TX = (lang, id, en) => (lang === "id" ? id : en);

// ---- Tool definitions ----
const TOOL_DEFS = {};

TOOL_DEFS.merge = {
  multiFile: true, allowReorderFiles: true, view: "grid", selectable: false,
  defaults: {},
  disabled: (ctx) => ctx.files.length < 2,
  outName: (lang) => TX(lang, "hasil-gabungan.pdf", "merged.pdf"),
  Panel: ({ t, lang, ctx }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <TDS.Alert tone="info">{TX(lang,
        "Urutkan file di panel kiri — halaman digabung sesuai urutan itu.",
        "Reorder files in the left panel — pages are merged in that order.")}</TDS.Alert>
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
  process: (ctx, opts, onP, lang) => window.PdfProcess.assemble(ctx.pages, TOOL_DEFS.merge.outName(lang), onP),
};

TOOL_DEFS.split = {
  view: "grid",
  defaults: { mode: "every", n: 2, range: "1-3" },
  selectableWhen: (opts) => opts.mode === "selected",
  disabled: (ctx, opts) => opts.mode === "selected" && ctx.selection.size === 0,
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
          <TDS.Input mono label={TX(lang, "Rentang halaman", "Page range")} value={opts.range} placeholder="1-3, 7, 10-12"
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
            {opts.mode === "every" ? `${nOut} file PDF` : opts.mode === "range" ? `1 file · ${window.PdfProcess.parseRange(opts.range, live.length).length} ${t.success.pages}` : `1 file · ${ctx.selection.size} ${t.success.pages}`}
          </span>
        </Field>
      </div>
    );
  },
  process: (ctx, opts, onP, lang) => {
    const base = (ctx.files[0] ? ctx.files[0].name.replace(/\.pdf$/i, "") : "hasil");
    return window.PdfProcess.split(ctx.pages, { ...opts, selected: ctx.selection }, base, onP);
  },
};

TOOL_DEFS.organize = {
  view: "grid", selectable: true, reorder: true, pageActions: true, undoable: true,
  defaults: {},
  Panel: ({ t, lang, ctx }) => {
    const sel = [...ctx.selection];
    const any = sel.length > 0;
    const B = ({ children, onClick, danger, disabled }) => (
      <TDS.Button variant={danger ? "danger" : "secondary"} size="sm" fullWidth disabled={disabled} onClick={onClick}>{children}</TDS.Button>
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
        <TDS.Alert tone="info">{TX(lang,
          "Tarik kartu halaman untuk menyusun ulang. Klik kanan untuk menu aksi.",
          "Drag page cards to reorder. Right-click for actions.")}</TDS.Alert>
      </div>
    );
  },
  disabled: (ctx) => ctx.pages.filter((p) => !p.deleted).length === 0,
  outName: (lang) => TX(lang, "halaman-tersusun.pdf", "organized.pdf"),
  process: (ctx, opts, onP, lang) => window.PdfProcess.assemble(ctx.pages, TOOL_DEFS.organize.outName(lang), onP),
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
          <TDS.Button variant="secondary" size="sm" disabled={!sel.length} onClick={() => ctx.pageOps.rotate(sel, -90)}>↺ −90°</TDS.Button>
          <TDS.Button variant="secondary" size="sm" disabled={!sel.length} onClick={() => ctx.pageOps.rotate(sel, 90)}>↻ +90°</TDS.Button>
        </div>
        <Field label={TX(lang, "Semua halaman", "All pages")}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <TDS.Button variant="ghost" size="sm" onClick={() => ctx.pageOps.rotate(all, -90)}>↺ {TX(lang, "Semua", "All")}</TDS.Button>
            <TDS.Button variant="ghost" size="sm" onClick={() => ctx.pageOps.rotate(all, 90)}>↻ {TX(lang, "Semua", "All")}</TDS.Button>
          </div>
        </Field>
        <TDS.Alert tone="info">{TX(lang, "Rotasi diterapkan permanen saat diproses.", "Rotation is applied permanently on process.")}</TDS.Alert>
      </div>
    );
  },
  disabled: (ctx) => !ctx.pages.some((p) => !p.deleted && p.rotation),
  outName: (lang) => TX(lang, "hasil-putar.pdf", "rotated.pdf"),
  process: (ctx, opts, onP, lang) => window.PdfProcess.assemble(ctx.pages, TOOL_DEFS.rotate.outName(lang), onP),
};

TOOL_DEFS.compress = {
  view: "preview",
  defaults: { level: "medium" },
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
            <span style={{ color: "var(--text-muted)", textDecoration: "line-through" }}>{window.PdfEngine.fmtSize(totalIn, lang)}</span>
            <span aria-hidden="true" style={{ color: "var(--text-faint)" }}>→</span>
            <span style={{ color: "var(--status-success-fg)", fontWeight: 600 }}>≈ {window.PdfEngine.fmtSize(totalIn * factor, lang)}</span>
          </div>
        </Field>
        <TDS.Alert tone="warning">{TX(lang,
          "Halaman dirender ulang sebagai gambar — teks tidak lagi dapat dipilih.",
          "Pages are re-rendered as images — text will no longer be selectable.")}</TDS.Alert>
      </div>
    );
  },
  processLabel: (t, lang) => TX(lang, "Merender ulang halaman…", "Re-rendering pages…"),
  outName: (lang) => TX(lang, "hasil-kompres.pdf", "compressed.pdf"),
  process: (ctx, opts, onP, lang) => window.PdfProcess.compress(ctx.pages, opts, TOOL_DEFS.compress.outName(lang), onP),
};

Object.assign(window, { Field, Segmented, SliderRow, PosGrid, SelCount, TX, TOOL_DEFS });
