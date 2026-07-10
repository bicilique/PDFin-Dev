// PDFin workspace — tool defs part 2: watermark, images→PDF, PDF→image, page numbers, flatten.
const T2DS = window.PDFinDesignSystem_41a2ca;
const { Field, Segmented, SliderRow, PosGrid, TX, TOOL_DEFS } = window;

// Anchor helper for CSS overlays (mirrors process.js anchor())
function cssAnchor(align) {
  const [v, h] = align.split("-");
  return {
    left: h === "left" ? "25%" : h === "right" ? "75%" : "50%",
    top: v === "top" ? "20%" : v === "bottom" ? "82%" : "50%",
  };
}

TOOL_DEFS.watermark = {
  view: "preview", multiFile: true,
  defaults: { kind: "text", text: "RAHASIA", opacity: 24, rotation: -35, size: 40, align: "middle-center", imageBytes: null, imageType: null, imageUrl: null },
  Panel: ({ t, lang, opts, setOpts }) => {
    const imgRef = React.useRef(null);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label={TX(lang, "Jenis watermark", "Watermark type")}>
          <Segmented value={opts.kind} onChange={(kind) => setOpts({ ...opts, kind })} options={[
            { value: "text", label: TX(lang, "Teks", "Text") },
            { value: "image", label: TX(lang, "Gambar", "Image") },
          ]} />
        </Field>
        {opts.kind === "text" ? (
          <T2DS.Input label={TX(lang, "Teks", "Text")} value={opts.text} onChange={(e) => setOpts({ ...opts, text: e.target.value })} />
        ) : (
          <Field label={TX(lang, "File gambar", "Image file")}>
            <T2DS.Button variant="secondary" size="sm" onClick={() => imgRef.current.click()}>
              {opts.imageUrl ? TX(lang, "Ganti gambar", "Replace image") : TX(lang, "Pilih gambar", "Choose image")}
            </T2DS.Button>
            {opts.imageUrl && <img src={opts.imageUrl} alt="" style={{ width: 72, borderRadius: 6, border: "1px solid var(--border-default)" }} />}
            <input ref={imgRef} type="file" accept=".png,.jpg,.jpeg" style={{ display: "none" }} onChange={async (e) => {
              const f = e.target.files[0]; if (!f) return;
              const bytes = new Uint8Array(await f.arrayBuffer());
              setOpts({ ...opts, imageBytes: bytes, imageType: f.type, imageUrl: URL.createObjectURL(f) });
            }} />
          </Field>
        )}
        <SliderRow label={TX(lang, "Opasitas", "Opacity")} value={opts.opacity} min={5} max={100} unit="%" onChange={(opacity) => setOpts({ ...opts, opacity })} />
        <SliderRow label={TX(lang, "Rotasi", "Rotation")} value={opts.rotation} min={-90} max={90} step={5} unit="°" onChange={(rotation) => setOpts({ ...opts, rotation })} />
        <SliderRow label={TX(lang, "Ukuran", "Size")} value={opts.size} min={10} max={100} unit="%" onChange={(size) => setOpts({ ...opts, size })} />
        <Field label={TX(lang, "Penempatan", "Placement")}>
          <PosGrid value={opts.align} onChange={(align) => setOpts({ ...opts, align })} />
        </Field>
      </div>
    );
  },
  overlay: (opts) => (p, i) => {
    const pos = cssAnchor(opts.align);
    return (
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{
          position: "absolute", left: pos.left, top: pos.top,
          transform: `translate(-50%, -50%) rotate(${opts.rotation}deg)`,
          opacity: opts.opacity / 100, whiteSpace: "nowrap",
        }}>
          {opts.kind === "text"
            ? <span style={{ font: `700 ${Math.max(10, opts.size * 1.5)}px/1 Helvetica, Arial, sans-serif`, color: "#6b6787", letterSpacing: "0.02em" }}>{opts.text}</span>
            : opts.imageUrl && <img src={opts.imageUrl} alt="" style={{ width: `${opts.size * 4}px` }} />}
        </div>
      </div>
    );
  },
  disabled: (ctx, opts) => (opts.kind === "text" ? !opts.text.trim() : !opts.imageBytes),
  process: (ctx, opts, onP) => window.PdfProcess.watermark(ctx.files, opts, onP),
};

TOOL_DEFS.img2pdf = {
  view: "grid", acceptImages: true, multiFile: true, allowReorderFiles: true, reorder: true, selectable: false,
  defaults: { pageSize: "a4", orientation: "portrait", margin: "small" },
  Panel: ({ t, lang, opts, setOpts, ctx }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <T2DS.Select label={TX(lang, "Ukuran halaman", "Page size")} value={opts.pageSize} onChange={(e) => setOpts({ ...opts, pageSize: e.target.value })}
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
  process: (ctx, opts, onP, lang) => window.PdfProcess.imagesToPdf(ctx.files, opts, TOOL_DEFS.img2pdf.outName(lang), onP),
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
        <T2DS.Select label="DPI" value={String(opts.dpi)} onChange={(e) => setOpts({ ...opts, dpi: +e.target.value })}
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
    return window.PdfProcess.pdfToImages(ctx.pages, { ...opts, selected: ctx.selection }, base, onP);
  },
};

TOOL_DEFS.pagenum = {
  view: "preview", multiFile: true,
  defaults: { position: "bottom-center", format: "n", font: "helvetica", fontSize: 11, color: "ink", margin: 28 },
  Panel: ({ t, lang, opts, setOpts }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Field label={TX(lang, "Posisi", "Position")}>
        <PosGrid value={opts.position} onChange={(position) => setOpts({ ...opts, position })} rows={["top", "bottom"]} />
      </Field>
      <T2DS.Select label={TX(lang, "Format", "Format")} value={opts.format} onChange={(e) => setOpts({ ...opts, format: e.target.value })}
        options={[
          { value: "n", label: "1, 2, 3…" },
          { value: "n_of_total", label: "1 / 24" },
          { value: "page_n", label: TX(lang, "Halaman 1", "Page 1") },
        ]} />
      <T2DS.Select label="Font" value={opts.font} onChange={(e) => setOpts({ ...opts, font: e.target.value })}
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
  overlay: (opts) => (p, i) => {
    const colors = { ink: "#2B2740", gray: "#8C88A0", violet: "#5518B4" };
    const label = opts.format === "n_of_total" ? `${i + 1} / …` : opts.format === "page_n" ? `Halaman ${i + 1}` : String(i + 1);
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
  process: (ctx, opts, onP) => window.PdfProcess.pageNumbers(ctx.files, opts, onP),
};

TOOL_DEFS.flatten = {
  view: "preview", multiFile: true,
  defaults: { forms: true, annotations: true },
  Panel: ({ t, lang, opts, setOpts }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <T2DS.Switch label={TX(lang, "Ratakan isian formulir", "Flatten form fields")} checked={opts.forms} onChange={(forms) => setOpts({ ...opts, forms })} />
      <T2DS.Switch label={TX(lang, "Ratakan anotasi", "Flatten annotations")} checked={opts.annotations} onChange={(annotations) => setOpts({ ...opts, annotations })} />
      <T2DS.Alert tone="info" title={TX(lang, "Apa yang terjadi?", "What happens?")}>
        {TX(lang,
          "Isian formulir dan anotasi menjadi bagian permanen halaman — tidak dapat diubah lagi setelah diratakan.",
          "Form fields and annotations become a permanent part of the page — they can no longer be edited after flattening.")}
      </T2DS.Alert>
    </div>
  ),
  disabled: (ctx, opts) => !opts.forms && !opts.annotations,
  process: (ctx, opts, onP) => window.PdfProcess.flatten(ctx.files, opts, onP),
};
