import React from "react";
import { Alert, Button, Input, Select, Switch } from "../../../components/index.js";
import { Field, Segmented, SliderRow, PosGrid, TX, TOOL_DEFS, getScopeError, pageScopeIncludes } from "./tools-1.jsx";
import { PdfProcess } from "../engine/pdfProcess.js";

// PDFin workspace — tool defs part 2: watermark, images->PDF, PDF->image, page numbers, flatten.

// Anchor helper for CSS overlays (mirrors process.js anchor())
function cssAnchor(align) {
  const [v, h] = align.split("-");
  return {
    left: h === "left" ? "25%" : h === "right" ? "75%" : "50%",
    top: v === "top" ? "20%" : v === "bottom" ? "82%" : "50%",
  };
}

function appliedNumber(opts, pageIndex, totalPages) {
  const start = Number(opts.startAt) || 0;
  let offset = 0;
  for (let i = 0; i < pageIndex; i += 1) {
    if (pageScopeIncludes(opts, i, totalPages)) offset += 1;
  }
  return start + offset;
}

TOOL_DEFS.watermark = {
  view: "preview", multiFile: true,
  previewKind: "processed",
  defaults: { scope: "all", range: "1-3", kind: "text", text: "RAHASIA", opacity: 24, rotation: -35, size: 40, align: "middle-center", color: "#6b6787", imageBytes: null, imageType: null, imageUrl: null },
  Panel: ({ t, lang, opts, setOpts, ctx }) => {
    const imgRef = React.useRef(null);
    const pageCount = ctx.pages.filter((p) => !p.deleted).length;
    React.useEffect(() => () => {
      if (opts.imageUrl) URL.revokeObjectURL(opts.imageUrl);
    }, [opts.imageUrl]);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Alert tone="info">{TX(lang,
          "Pratinjau watermark mengikuti jenis, ukuran, rotasi, dan penempatan di panel ini.",
          "The watermark preview follows the type, size, rotation, and placement in this panel.")}</Alert>
        <ScopeControl lang={lang} opts={opts} setOpts={setOpts} pageCount={pageCount} />
        <Field label={TX(lang, "Jenis watermark", "Watermark type")}>
          <Segmented value={opts.kind} onChange={(kind) => setOpts({ ...opts, kind })} options={[
            { value: "text", label: TX(lang, "Teks", "Text") },
            { value: "image", label: TX(lang, "Gambar", "Image") },
          ]} />
        </Field>
        {opts.kind === "text" ? (
          <Input label={TX(lang, "Teks", "Text")} value={opts.text} onChange={(e) => setOpts({ ...opts, text: e.target.value })} />
        ) : (
          <Field label={TX(lang, "File gambar", "Image file")}>
            <Button variant="secondary" size="sm" onClick={() => imgRef.current.click()}>
              {opts.imageUrl ? TX(lang, "Ganti gambar", "Replace image") : TX(lang, "Pilih gambar", "Choose image")}
            </Button>
            {opts.imageUrl && <img src={opts.imageUrl} alt="" style={{ width: 72, borderRadius: 6, border: "1px solid var(--border-default)" }} />}
            <input ref={imgRef} type="file" accept=".png,.jpg,.jpeg" style={{ display: "none" }} onChange={async (e) => {
              const f = e.target.files[0]; if (!f) return;
              const bytes = new Uint8Array(await f.arrayBuffer());
              if (opts.imageUrl) URL.revokeObjectURL(opts.imageUrl);
              setOpts({ ...opts, imageBytes: bytes, imageType: f.type, imageUrl: URL.createObjectURL(f) });
            }} />
          </Field>
        )}
        {opts.kind === "text" && (
          <Input label={TX(lang, "Warna", "Color")} type="color" value={opts.color} onChange={(e) => setOpts({ ...opts, color: e.target.value })} />
        )}
        <SliderRow label={TX(lang, "Opasitas", "Opacity")} value={opts.opacity} min={5} max={100} unit="%" onChange={(opacity) => setOpts({ ...opts, opacity })} />
        <SliderRow label={TX(lang, "Rotasi", "Rotation")} value={opts.rotation} min={-90} max={90} step={5} unit="°" onChange={(rotation) => setOpts({ ...opts, rotation })} />
        <SliderRow label={TX(lang, "Ukuran", "Size")} value={opts.size} min={10} max={100} unit="%" onChange={(size) => setOpts({ ...opts, size })} />
        <Field label={TX(lang, "Penempatan", "Placement")}>
          <PosGrid lang={lang} value={opts.align} onChange={(align) => setOpts({ ...opts, align })} />
        </Field>
      </div>
    );
  },
  overlay: (opts) => (p, i, total) => {
    if (!pageScopeIncludes(opts, i, total)) return null;
    const pos = cssAnchor(opts.align);
    return (
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{
          position: "absolute", left: pos.left, top: pos.top,
          transform: `translate(-50%, -50%) rotate(${opts.rotation}deg)`,
          opacity: opts.opacity / 100, whiteSpace: "nowrap",
        }}>
          {opts.kind === "text"
            ? <span style={{ font: `700 ${Math.max(10, opts.size * 1.5)}px/1 Helvetica, Arial, sans-serif`, color: opts.color || "#6b6787", letterSpacing: "0.02em" }}>{opts.text}</span>
            : opts.imageUrl && <img src={opts.imageUrl} alt="" style={{ width: `${opts.size * 4}px` }} />}
        </div>
      </div>
    );
  },
  disabled: (ctx, opts, lang) => !!getScopeError(opts, ctx.pages.filter((p) => !p.deleted).length, lang) || (opts.kind === "text" ? !opts.text.trim() : !opts.imageBytes),
  disabledReason: (ctx, opts, t, lang) => opts.kind === "text"
    ? (getScopeError(opts, ctx.pages.filter((p) => !p.deleted).length, lang) || TX(lang, "Isi teks watermark sebelum memproses.", "Enter watermark text before processing."))
    : (getScopeError(opts, ctx.pages.filter((p) => !p.deleted).length, lang) || TX(lang, "Pilih gambar watermark sebelum memproses.", "Choose a watermark image before processing.")),
  nextAction: (ctx, opts, t, lang) => TX(lang, "Watermark akan diterapkan secara lokal ke pratinjau PDF.", "The watermark will be applied locally to the previewed PDF."),
  successSummary: (result, ctx, opts, t, lang) => {
    const files = result.outputs.length;
    return TX(lang, `${files} file PDF diberi watermark di browser.`, `${files} PDF file${files === 1 ? "" : "s"} watermarked in your browser.`);
  },
  process: (ctx, opts, onP) => PdfProcess.watermark(ctx.files, opts, onP),
};

TOOL_DEFS.img2pdf = {
  view: "grid", acceptImages: true, multiFile: true, allowReorderFiles: true, reorder: true, selectable: false,
  defaults: { pageSize: "a4", orientation: "portrait", margin: "small" },
  Panel: ({ t, lang, opts, setOpts, ctx }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Select label={TX(lang, "Ukuran halaman", "Page size")} value={opts.pageSize} onChange={(e) => setOpts({ ...opts, pageSize: e.target.value })}
        options={[
          { value: "a4", label: "A4" }, { value: "letter", label: "Letter" },
          { value: "f4", label: "F4 (Folio)" }, { value: "fit", label: TX(lang, "Pas ukuran gambar", "Fit image") },
        ]} />
      {opts.pageSize !== "fit" && (
        <Field label={TX(lang, "Orientasi", "Orientation")}>
          <Segmented value={opts.orientation} onChange={(orientation) => setOpts({ ...opts, orientation })} options={[
            { value: "portrait", label: TX(lang, "Tegak", "Portrait") },
            { value: "landscape", label: TX(lang, "Mendatar", "Landscape") },
          ]} />
        </Field>
      )}
      <Field label={TX(lang, "Margin", "Margins")}>
        <Segmented value={opts.margin} onChange={(margin) => setOpts({ ...opts, margin })} options={[
          { value: "none", label: TX(lang, "Tanpa", "None") },
          { value: "small", label: TX(lang, "Kecil", "Small") },
          { value: "large", label: TX(lang, "Besar", "Large") },
        ]} />
      </Field>
      <Field label={t.inspector.output}>
        <span style={{ font: "12.5px var(--font-mono)", color: "var(--text-muted)" }}>1 PDF · {ctx.files.length} {t.success.pages}</span>
      </Field>
    </div>
  ),
  disabled: (ctx) => ctx.files.length === 0,
  outName: (lang) => TX(lang, "gambar-ke-pdf.pdf", "images.pdf"),
  process: (ctx, opts, onP, lang) => PdfProcess.imagesToPdf(ctx.files, opts, TOOL_DEFS.img2pdf.outName(lang), onP),
};

TOOL_DEFS.pdf2img = {
  view: "grid", selectable: true,
  defaults: { format: "png", dpi: 150, quality: 85 },
  Panel: ({ t, lang, opts, setOpts, ctx }) => {
    const live = ctx.pages.filter((p) => !p.deleted);
    const n = ctx.selection.size || live.length;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label={TX(lang, "Format", "Format")}>
          <Segmented value={opts.format} onChange={(format) => setOpts({ ...opts, format })} options={[
            { value: "png", label: "PNG" }, { value: "jpeg", label: "JPG" },
          ]} />
        </Field>
        <Select label="DPI" value={String(opts.dpi)} onChange={(e) => setOpts({ ...opts, dpi: +e.target.value })}
          options={[{ value: "72", label: "72 (layar)" }, { value: "150", label: "150" }, { value: "300", label: "300 (cetak)" }]} />
        {opts.format === "jpeg" && (
          <SliderRow label={TX(lang, "Kualitas", "Quality")} value={opts.quality} min={40} max={100} unit="%" onChange={(quality) => setOpts({ ...opts, quality })} />
        )}
        <Field label={t.inspector.output} hint={TX(lang, "Tanpa pilihan = semua halaman.", "No selection = all pages.")}>
          <span style={{ font: "12.5px var(--font-mono)", color: "var(--text-muted)" }}>{n} {opts.format.toUpperCase()}</span>
        </Field>
      </div>
    );
  },
  processLabel: (t, lang) => TX(lang, "Merender halaman…", "Rendering pages…"),
  process: (ctx, opts, onP, lang) => {
    const base = ctx.files[0] ? ctx.files[0].name.replace(/\.pdf$/i, "") : "halaman";
    return PdfProcess.pdfToImages(ctx.pages, { ...opts, selected: ctx.selection }, base, onP);
  },
};

TOOL_DEFS.pagenum = {
  view: "preview", multiFile: true,
  previewKind: "processed",
  defaults: { scope: "all", range: "1-3", excludeFirst: false, startAt: 1, position: "bottom-center", format: "n", font: "helvetica", fontSize: 11, color: "ink", margin: 28 },
  Panel: ({ t, lang, opts, setOpts, ctx }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Alert tone="info">{TX(lang,
        "Pratinjau nomor halaman menunjukkan posisi dan gaya sebelum PDF diproses.",
        "The page number preview shows position and style before the PDF is processed.")}</Alert>
      <ScopeControl lang={lang} opts={opts} setOpts={setOpts} pageCount={ctx.pages.filter((p) => !p.deleted).length} allowExcludeFirst />
      <Input label={TX(lang, "Mulai dari", "Start at")} type="number" min="0" value={opts.startAt} onChange={(e) => setOpts({ ...opts, startAt: Number(e.target.value) || 0 })} />
      <Field label={TX(lang, "Posisi", "Position")}>
        <PosGrid lang={lang} value={opts.position} onChange={(position) => setOpts({ ...opts, position })} rows={["top", "bottom"]} />
      </Field>
      <Select label={TX(lang, "Format", "Format")} value={opts.format} onChange={(e) => setOpts({ ...opts, format: e.target.value })}
        options={[
          { value: "n", label: "1, 2, 3…" },
          { value: "n_of_total", label: "1 / 24" },
          { value: "page_n", label: TX(lang, "Halaman 1", "Page 1") },
        ]} />
      <Select label="Font" value={opts.font} onChange={(e) => setOpts({ ...opts, font: e.target.value })}
        options={[{ value: "helvetica", label: "Helvetica" }, { value: "times", label: "Times" }, { value: "courier", label: "Courier" }]} />
      <SliderRow label={TX(lang, "Ukuran huruf", "Font size")} value={opts.fontSize} min={8} max={18} unit="pt" onChange={(fontSize) => setOpts({ ...opts, fontSize })} />
      <SliderRow label="Margin" value={opts.margin} min={12} max={64} unit="pt" onChange={(margin) => setOpts({ ...opts, margin })} />
      <Field label={TX(lang, "Warna", "Color")}>
        <div style={{ display: "flex", gap: 8 }}>
          {[["ink", "#2B2740"], ["gray", "#8C88A0"], ["violet", "#5518B4"]].map(([v, hex]) => (
            <button key={v} type="button" aria-label={v} onClick={() => setOpts({ ...opts, color: v })} style={{
              width: 28, height: 28, borderRadius: "50%", background: hex, cursor: "pointer",
              border: opts.color === v ? "2px solid var(--action-primary)" : "1px solid var(--border-default)",
              outline: opts.color === v ? "2px solid var(--surface-card)" : "none", outlineOffset: -4,
            }}></button>
          ))}
        </div>
      </Field>
    </div>
  ),
  overlay: (opts) => (p, i, total) => {
    if (!pageScopeIncludes(opts, i, total)) return null;
    const colors = { ink: "#2B2740", gray: "#8C88A0", violet: "#5518B4" };
    const number = appliedNumber(opts, i, total);
    const label = opts.format === "n_of_total" ? `${number} / ${total}` : opts.format === "page_n" ? `Halaman ${number}` : String(number);
    const fam = { helvetica: "Helvetica, Arial, sans-serif", times: "'Times New Roman', serif", courier: "'Courier New', monospace" }[opts.font];
    return (
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <span style={{
          position: "absolute",
          [opts.position.startsWith("top") ? "top" : "bottom"]: `${(opts.margin / 842) * 100}%`,
          left: opts.position.endsWith("left") ? `${(opts.margin / 595) * 100}%` : opts.position.endsWith("right") ? "auto" : "50%",
          right: opts.position.endsWith("right") ? `${(opts.margin / 595) * 100}%` : "auto",
          transform: opts.position.endsWith("center") ? "translateX(-50%)" : "none",
          font: `${opts.fontSize * 1.4}px ${fam}`, color: colors[opts.color],
        }}>{label}</span>
      </div>
    );
  },
  disabled: (ctx, opts, lang) => !!getScopeError(opts, ctx.pages.filter((p) => !p.deleted).length, lang),
  disabledReason: (ctx, opts, t, lang) => getScopeError(opts, ctx.pages.filter((p) => !p.deleted).length, lang) || t.toolRequirements.pagenum,
  nextAction: (ctx, opts, t, lang) => TX(lang, "Nomor halaman akan diterapkan secara lokal ke semua halaman.", "Page numbers will be applied locally to every page."),
  successSummary: (result, ctx, opts, t, lang) => {
    const files = result.outputs.length;
    return TX(lang, `${files} file PDF diberi nomor halaman di browser.`, `${files} PDF file${files === 1 ? "" : "s"} numbered in your browser.`);
  },
  process: (ctx, opts, onP) => PdfProcess.pageNumbers(ctx.files, opts, onP),
};

TOOL_DEFS.flatten = {
  view: "preview", multiFile: true,
  previewKind: "flatten",
  defaults: { forms: true, annotations: true },
  Panel: ({ t, lang, opts, setOpts }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <OptionSummary
        label={TX(lang, "Ratakan isian formulir", "Flatten form fields")}
        summary={TX(lang, "Isian menjadi permanen dan tidak dapat diedit lagi.", "Form values become permanent and can no longer be edited.")}
        checked={opts.forms}
        onChange={(forms) => setOpts({ ...opts, forms })}
      />
      <OptionSummary
        label={TX(lang, "Ratakan anotasi", "Flatten annotations")}
        summary={TX(lang, "Anotasi dipertahankan jika jenisnya belum dapat diratakan aman oleh browser.", "Annotations are preserved when their type cannot be safely flattened in the browser.")}
        checked={opts.annotations}
        onChange={(annotations) => setOpts({ ...opts, annotations })}
      />
      {(opts.forms || opts.annotations) && (
        <Alert tone="warning" title={TX(lang, "Ringkasan sebelum proses", "Before processing")}>
          {[opts.forms && TX(lang, "Isian formulir akan dikunci sebagai konten halaman.", "Form fields will be locked into page content."), opts.annotations && TX(lang, "Anotasi akan diproses sebagai konten permanen bila didukung PDF.", "Annotations will be processed as permanent content when supported by the PDF.")].filter(Boolean).join(" ")}
        </Alert>
      )}
    </div>
  ),
  disabled: (ctx, opts) => !opts.forms && !opts.annotations,
  process: (ctx, opts, onP) => PdfProcess.flatten(ctx.files, opts, onP),
};

function ScopeControl({ lang, opts, setOpts, pageCount, allowExcludeFirst = false }) {
  const error = getScopeError(opts, pageCount, lang);
  return (
    <Field label={TX(lang, "Terapkan ke", "Apply to")}>
      <Segmented value={opts.scope || "all"} onChange={(scope) => setOpts({ ...opts, scope })} options={[
        { value: "all", label: TX(lang, "Semua halaman", "All pages") },
        { value: "range", label: TX(lang, "Rentang khusus", "Custom range") },
      ]} />
      {opts.scope === "range" && (
        <Input
          mono
          label={TX(lang, "Rentang halaman", "Page range")}
          value={opts.range || ""}
          placeholder="1-3, 5, 8-10"
          error={error}
          onChange={(e) => setOpts({ ...opts, range: e.target.value })}
        />
      )}
      {allowExcludeFirst && (
        <Switch label={TX(lang, "Kecualikan halaman pertama", "Exclude first page")} checked={!!opts.excludeFirst} onChange={(excludeFirst) => setOpts({ ...opts, excludeFirst })} />
      )}
    </Field>
  );
}

function OptionSummary({ label, summary, checked, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <Switch label={label} checked={checked} onChange={onChange} />
      {checked && <span style={{ font: "var(--type-caption)", color: "var(--text-muted)", paddingLeft: 2 }}>{summary}</span>}
    </div>
  );
}
