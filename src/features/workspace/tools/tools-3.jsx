import React from "react";
import { Alert, Button, Input, Select, Switch } from "../../../components/index.js";
import { Field as F3, Segmented as Seg3, SliderRow as SR3, TX as TX3, TOOL_DEFS as DEFS3, analyzeSplitRange, getOutputNameError, getPdfOutputName, sanitizePdfBaseName } from "./tools-1.jsx";
import { PdfProcess } from "../engine/pdfProcess.js";

// PDFin workspace — tool defs part 3: protect, unlock, metadata, sign, OCR.

function strength(pw) {
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  return s; // 0..4
}

function StrengthMeter({ pw, lang }) {
  const s = strength(pw);
  const score = !pw ? 0 : s <= 1 ? 1 : s <= 2 ? 2 : 3;
  const labels = lang === "id" ? ["", "Lemah", "Cukup", "Kuat"] : ["", "Weak", "Fair", "Strong"];
  const colors = ["var(--ink-300)", "var(--status-error-fg)", "var(--status-warning-fg)", "var(--status-success-fg)", "var(--status-success-fg)"];
  return (
    <div role="status" aria-live="polite" style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ display: "flex", gap: 4 }}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < score ? colors[score] : "var(--surface-sunken)", transition: "background var(--duration-fast) var(--ease-out)" }}></span>
        ))}
      </div>
      {pw && <span style={{ font: "11px/1 var(--font-sans)", color: colors[score] }}>{labels[score]}</span>}
    </div>
  );
}

function PasswordInput({ id, lang, label, value, visible, onVisible, onChange, error }) {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label htmlFor={id} style={{ font: "var(--type-label)", color: "var(--text-heading)" }}>{label}</label>
      <div style={{
        display: "flex", alignItems: "center", border: `1px solid ${error ? "var(--red-600)" : "var(--border-default)"}`,
        borderRadius: "var(--radius-md)", background: "var(--surface-card)", overflow: "hidden",
      }}>
        <input id={id} type={visible ? "text" : "password"} value={value || ""} autoComplete="new-password"
          aria-invalid={!!error} aria-describedby={errorId}
          onChange={(event) => onChange(event.target.value)}
          style={{ minWidth: 0, flex: 1, border: "none", outline: "none", background: "transparent", color: "var(--text-heading)", font: "var(--type-body)", padding: "9px 10px 9px 12px" }} />
        <button type="button" onClick={onVisible} aria-label={visible ? TX3(lang, "Sembunyikan password", "Hide password") : TX3(lang, "Tampilkan password", "Show password")}
          style={{ minHeight: 36, border: "none", borderLeft: "1px solid var(--border-default)", background: "var(--surface-sunken)", color: "var(--text-body)", cursor: "pointer", font: "var(--weight-semibold) 12px/1 var(--font-sans)", padding: "0 10px" }}>
          {visible ? TX3(lang, "Sembunyikan", "Hide") : TX3(lang, "Tampilkan", "Show")}
        </button>
      </div>
      {error && <span id={errorId} role="alert" style={{ font: "var(--type-caption)", color: "var(--status-error-fg)" }}>{error}</span>}
    </div>
  );
}

function sourceBaseName(ctx, fallback = "dokumen") {
  return sanitizePdfBaseName(ctx.files[0]?.name || fallback) || fallback;
}

function outputNameValue(ctx, suffix) {
  return `${sourceBaseName(ctx)}-${suffix}`;
}

function normalizeKeywords(value) {
  const raw = Array.isArray(value) ? value : String(value || "").split(",");
  const seen = new Set();
  const tags = [];
  raw.forEach((item) => {
    const tag = String(item || "").trim().replace(/\s+/g, " ");
    const key = tag.toLowerCase();
    if (!tag || seen.has(key)) return;
    seen.add(key);
    tags.push(tag);
  });
  return tags;
}

function metadataSnapshot(meta = {}) {
  return {
    title: meta.title || "",
    author: meta.author || "",
    subject: meta.subject || "",
    keywords: normalizeKeywords(meta.keywords),
  };
}

function changedSummary(opts, lang) {
  const original = opts.originalMetadata || metadataSnapshot();
  const rows = [];
  [["title", TX3(lang, "Judul", "Title")], ["author", TX3(lang, "Penulis", "Author")], ["subject", TX3(lang, "Subjek", "Subject")]].forEach(([key, label]) => {
    const before = original[key] || "";
    const after = opts[key] || "";
    if (before !== after) rows.push(after ? TX3(lang, `${label} akan diperbarui`, `${label} will be updated`) : TX3(lang, `${label} akan dihapus`, `${label} will be removed`));
  });
  const beforeKeywords = (original.keywords || []).join("\n");
  const afterKeywords = (opts.keywords || []).join("\n");
  if (beforeKeywords !== afterKeywords) rows.push(TX3(lang, `${(opts.keywords || []).length} kata kunci akan disimpan`, `${(opts.keywords || []).length} keyword(s) will be saved`));
  return rows;
}

function OutputNameField({ lang, value, onChange, inputId }) {
  const error = getOutputNameError(value, lang);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label htmlFor={inputId} style={{ font: "var(--type-label)", color: "var(--text-heading)" }}>{TX3(lang, "Nama file hasil", "Output file name")}</label>
      <div style={{
        display: "flex", alignItems: "center", border: `1px solid ${error ? "var(--red-600)" : "var(--border-default)"}`,
        borderRadius: "var(--radius-md)", background: "var(--surface-card)", overflow: "hidden",
      }}>
        <input id={inputId} value={value || ""} aria-invalid={!!error} aria-describedby={error ? `${inputId}-error` : undefined}
          onChange={(e) => onChange(e.target.value)}
          style={{ minWidth: 0, flex: 1, border: "none", outline: "none", background: "transparent", color: "var(--text-heading)", font: "var(--type-body)", padding: "9px 10px 9px 12px" }} />
        <span aria-hidden="true" style={{ flex: "none", borderLeft: "1px solid var(--border-default)", background: "var(--surface-sunken)", color: "var(--text-muted)", font: "var(--type-caption)", padding: "10px 11px" }}>.pdf</span>
      </div>
      {error && <span id={`${inputId}-error`} style={{ font: "var(--type-caption)", color: "var(--status-error-fg)" }}>{error}</span>}
    </div>
  );
}

function KeywordEditor({ lang, keywords, draft, onDraft, onAdd, onRemove }) {
  const commit = () => onAdd(draft);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <label htmlFor="metadata-keywords" style={{ font: "var(--type-label)", color: "var(--text-heading)" }}>{TX3(lang, "Kata kunci", "Keywords")}</label>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", minHeight: 30 }}>
        {keywords.length ? keywords.map((tag) => (
          <span key={tag} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 8px", borderRadius: "var(--radius-pill)", border: "1px solid var(--border-default)", background: "var(--surface-sunken)", color: "var(--text-body)", font: "var(--type-caption)" }}>
            {tag}
            <button type="button" aria-label={TX3(lang, `Hapus kata kunci ${tag}`, `Remove keyword ${tag}`)} onClick={() => onRemove(tag)} style={{ border: "none", background: "transparent", color: "var(--text-muted)", cursor: "pointer", padding: 0, lineHeight: 1 }}>×</button>
          </span>
        )) : <span style={{ font: "var(--type-caption)", color: "var(--text-faint)" }}>{TX3(lang, "Belum ada kata kunci", "No keywords yet")}</span>}
      </div>
      <input id="metadata-keywords" value={draft || ""} placeholder={TX3(lang, "Ketik lalu Enter atau koma", "Type then press Enter or comma")}
        onChange={(e) => {
          const value = e.target.value;
          if (value.includes(",")) {
            onAdd(value);
          } else {
            onDraft(value);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
        }}
        style={{ padding: "9px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", background: "var(--surface-card)", color: "var(--text-heading)", font: "var(--type-body)", outline: "none" }} />
    </div>
  );
}

DEFS3.protect = {
  view: "preview",
  previewKind: "lock-source",
  defaults: { pw: "", pw2: "", showPw: false, showPw2: false, outputName: "", loadedFor: null, hasSignature: false, sourceEncrypted: false },
  Panel: ({ t, lang, opts, setOpts, ctx }) => {
    const file = ctx.files[0];
    React.useEffect(() => {
      if (file?.id && opts.loadedFor !== file.id) {
        setOpts((next) => next.loadedFor === file.id ? next : {
          ...next,
          outputName: outputNameValue(ctx, "terkunci"),
          loadedFor: file.id,
          hasSignature: PdfProcess.sourceHasDigitalSignature(file.id),
          sourceEncrypted: PdfProcess.sourceHasEncryption(file.id),
        });
      }
    }, [file?.id]);
    const pwError = !opts.pw ? TX3(lang, "Password wajib diisi.", "Password is required.") : "";
    const matchError = opts.pw2 && opts.pw2 !== opts.pw ? TX3(lang, "Konfirmasi password tidak sama.", "Password confirmation does not match.") : "";
    const weak = opts.pw && strength(opts.pw) < 2;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <h3 style={{ margin: 0, font: "var(--weight-bold) 16px/1.25 var(--font-sans)", color: "var(--text-heading)" }}>{TX3(lang, "Kunci PDF", "Protect PDF")}</h3>
          <span style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>{TX3(lang, "Tambahkan password untuk membuka PDF ini.", "Add a password to open this PDF.")}</span>
        </div>
        <Alert tone="info">{TX3(lang, "File tetap diproses di perangkat Anda.", "Files stay processed on your device.")}</Alert>
        <PasswordInput id="protect-password" lang={lang} label={TX3(lang, "Password untuk membuka PDF", "Password to open PDF")} value={opts.pw} visible={opts.showPw}
          onVisible={() => setOpts({ ...opts, showPw: !opts.showPw })} onChange={(pw) => setOpts({ ...opts, pw })} error={opts.pw === "" ? undefined : pwError} />
        <StrengthMeter pw={opts.pw} lang={lang} />
        <span style={{ font: "var(--type-caption)", color: weak ? "var(--status-warning-fg)" : "var(--text-muted)" }}>
          {TX3(lang, "Gunakan minimal 12 karakter atau gabungan kata yang mudah Anda ingat.", "Use at least 12 characters or a memorable phrase.")}
        </span>
        <PasswordInput id="protect-password-confirm" lang={lang} label={TX3(lang, "Konfirmasi password", "Confirm password")} value={opts.pw2} visible={opts.showPw2}
          onVisible={() => setOpts({ ...opts, showPw2: !opts.showPw2 })} onChange={(pw2) => setOpts({ ...opts, pw2 })} error={matchError || (opts.pw && !opts.pw2 ? TX3(lang, "Konfirmasi password wajib diisi.", "Password confirmation is required.") : "")} />
        <Alert tone="warning">{TX3(lang, "Password tidak dapat dipulihkan oleh PDFin. Simpan password Anda dengan aman.", "PDFin cannot recover this password. Store it safely.")}</Alert>
        {opts.hasSignature && <Alert tone="warning">{TX3(lang, "Memproses ulang PDF dapat membuat tanda tangan digital yang ada tidak lagi valid.", "Reprocessing the PDF can make existing digital signatures invalid.")}</Alert>}
        {opts.sourceEncrypted && <Alert tone="warning">{TX3(lang, "PDF ini sudah dilindungi password. Buka perlindungannya terlebih dahulu sebelum menggunakan Kunci PDF.", "This PDF is already password-protected. Unlock it before using Protect PDF.")}</Alert>}
        <OutputNameField lang={lang} value={opts.outputName || outputNameValue(ctx, "terkunci")} inputId="protect-output-name" onChange={(outputName) => setOpts({ ...opts, outputName })} />
      </div>
    );
  },
  disabled: (ctx, opts, lang = "id") => !ctx.validFiles?.length || !!ctx.loadingFiles?.length || !opts.pw || !opts.pw2 || opts.pw !== opts.pw2 || opts.sourceEncrypted || !!getOutputNameError(opts.outputName || outputNameValue(ctx, "terkunci"), lang),
  disabledReason: (ctx, opts, t, lang) => {
    const outputError = getOutputNameError(opts.outputName || outputNameValue(ctx, "terkunci"), lang);
    if (!ctx.validFiles?.length) return t.toolRequirements.protect;
    if (ctx.loadingFiles?.length) return TX3(lang, "Tunggu sampai file selesai dimuat.", "Wait until the file is fully loaded.");
    if (opts.sourceEncrypted) return TX3(lang, "PDF ini sudah dilindungi password. Buka perlindungannya terlebih dahulu sebelum menggunakan Kunci PDF.", "This PDF is already password-protected. Unlock it before using Protect PDF.");
    if (!opts.pw) return TX3(lang, "Masukkan password untuk membuka PDF.", "Enter a password to open the PDF.");
    if (!opts.pw2) return TX3(lang, "Konfirmasi password terlebih dahulu.", "Confirm the password first.");
    if (opts.pw !== opts.pw2) return TX3(lang, "Konfirmasi password tidak sama.", "Password confirmation does not match.");
    return outputError || t.cta.ready;
  },
  actionLabel: (ctx, opts, t, lang) => TX3(lang, "Kunci PDF", "Protect PDF"),
  processLabel: (t, lang) => TX3(lang, "Mengunci PDF…", "Protecting PDF…"),
  successSummary: (result, ctx, opts, t, lang) => TX3(lang, "PDF terkunci dan siap diunduh", "The PDF is protected and ready to download"),
  sanitizeAfterProcess: (opts) => ({ ...opts, pw: "", pw2: "", showPw: false, showPw2: false }),
  process: (ctx, opts, onP, lang) => PdfProcess.protect(ctx.files, { ...opts, password: opts.pw, outputName: getPdfOutputName(opts.outputName || outputNameValue(ctx, "terkunci"), lang) }, onP),
};

DEFS3.unlock = {
  view: "preview", simulated: true,
  defaults: { pw: "" },
  Panel: ({ t, lang, opts, setOpts }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Input type="password" label={TX3(lang, "Kata sandi dokumen", "Document password")} value={opts.pw}
        hint={TX3(lang, "Kata sandi hanya dipakai di browser Anda.", "The password is only used inside your browser.")}
        onChange={(e) => setOpts({ ...opts, pw: e.target.value })} />
      <Alert tone="info">{TX3(lang,
        "PDFin membuka kunci file yang kata sandinya Anda ketahui — bukan alat pembobol.",
        "PDFin unlocks files whose password you already know — it is not a cracking tool.")}</Alert>
    </div>
  ),
  disabled: (ctx, opts) => opts.pw.length < 1,
  processLabel: (t, lang) => TX3(lang, "Memvalidasi kata sandi…", "Validating password…"),
  process: (ctx, opts, onP) => PdfProcess.passthrough(ctx.files, "-terbuka", onP),
};

DEFS3.metadata = {
  view: "preview",
  previewKind: "content",
  defaults: { title: "", author: "", subject: "", keywords: [], keywordDraft: "", originalMetadata: null, confirmClear: false, outputName: "", loadedFor: null },
  Panel: ({ t, lang, opts, setOpts, ctx }) => {
    const fileId = ctx.files[0] && ctx.files[0].id;
    React.useEffect(() => {
      if (fileId && opts.loadedFor !== fileId) {
        PdfProcess.readMetadata(fileId).then((m) => {
          const originalMetadata = metadataSnapshot(m);
          setOpts((next) => next.loadedFor === fileId ? next : {
            ...next,
            ...originalMetadata,
            originalMetadata,
            keywordDraft: "",
            outputName: outputNameValue(ctx, "metadata"),
            confirmClear: false,
            loadedFor: fileId,
          });
        });
      }
    }, [fileId]);
    const original = opts.originalMetadata || metadataSnapshot();
    const summary = changedSummary(opts, lang);
    const setKeywords = (value) => setOpts({ ...opts, keywords: normalizeKeywords(value), keywordDraft: "" });
    const removeKeyword = (tag) => setOpts({ ...opts, keywords: (opts.keywords || []).filter((item) => item !== tag) });
    const resetMetadata = () => setOpts({ ...opts, ...original, keywordDraft: "", confirmClear: false });
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Alert tone="info">{TX3(lang, "Perbarui informasi dokumen. Perubahan metadata tidak mengubah tampilan isi PDF.", "Update document information. Metadata changes do not alter the visible PDF content.")}</Alert>
        <Input label={TX3(lang, "Judul", "Title")} value={opts.title} placeholder={original.title ? "" : TX3(lang, "Belum ada judul", "No title yet")} hint={TX3(lang, "Kosongkan untuk menghapus judul.", "Leave blank to remove the title.")} onChange={(e) => setOpts({ ...opts, title: e.target.value })} />
        <Input label={TX3(lang, "Penulis", "Author")} value={opts.author} placeholder={original.author ? "" : TX3(lang, "Belum ada penulis", "No author yet")} hint={TX3(lang, "Kosongkan untuk menghapus penulis.", "Leave blank to remove the author.")} onChange={(e) => setOpts({ ...opts, author: e.target.value })} />
        <Input label={TX3(lang, "Subjek", "Subject")} value={opts.subject} placeholder={original.subject ? "" : TX3(lang, "Belum ada subjek", "No subject yet")} hint={TX3(lang, "Kosongkan untuk menghapus subjek.", "Leave blank to remove the subject.")} onChange={(e) => setOpts({ ...opts, subject: e.target.value })} />
        <KeywordEditor lang={lang} keywords={opts.keywords || []} draft={opts.keywordDraft} onDraft={(keywordDraft) => setOpts({ ...opts, keywordDraft })} onAdd={(value) => setKeywords([...(opts.keywords || []), ...String(value || "").split(",")])} onRemove={removeKeyword} />
        <F3 label={TX3(lang, "Ringkasan perubahan", "Change summary")}>
          <span style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>{summary.length ? summary.join(" · ") : TX3(lang, "Belum ada perubahan.", "No changes yet.")}</span>
        </F3>
        <OutputNameField lang={lang} value={opts.outputName} inputId="metadata-output-name" onChange={(outputName) => setOpts({ ...opts, outputName })} />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button variant="secondary" size="sm" onClick={resetMetadata}>{TX3(lang, "Reset perubahan", "Reset changes")}</Button>
          {!opts.confirmClear ? (
            <Button variant="ghost" size="sm" onClick={() => setOpts({ ...opts, confirmClear: true })}>{TX3(lang, "Hapus metadata", "Clear metadata")}</Button>
          ) : (
            <>
              <Button variant="danger" size="sm" onClick={() => setOpts({ ...opts, title: "", author: "", subject: "", keywords: [], keywordDraft: "", confirmClear: false })}>{TX3(lang, "Konfirmasi hapus", "Confirm clear")}</Button>
              <Button variant="ghost" size="sm" onClick={() => setOpts({ ...opts, confirmClear: false })}>{TX3(lang, "Batal", "Cancel")}</Button>
            </>
          )}
        </div>
      </div>
    );
  },
  disabled: (ctx, opts, lang = "id") => !!getOutputNameError(opts.outputName, lang),
  disabledReason: (ctx, opts, t, lang) => getOutputNameError(opts.outputName, lang) || t.toolRequirements.metadata,
  process: (ctx, opts, onP, lang) => PdfProcess.metadata(ctx.files, { ...opts, outputName: getPdfOutputName(opts.outputName || outputNameValue(ctx, "metadata"), lang) }, onP, lang),
};

let signaturePlacementCounter = 1;
const nextSignaturePlacementId = () => `sig-${signaturePlacementCounter++}`;

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function placementLabel(lang, placement, index) {
  return TX3(lang, `Halaman ${placement.pageIndex + 1} — Paraf ${index + 1}`, `Page ${placement.pageIndex + 1} — Initials ${index + 1}`);
}

function signatureSummary(lang, placements) {
  const pages = new Set((placements || []).map((p) => p.pageIndex)).size;
  return TX3(lang,
    `${placements.length} paraf visual akan diterapkan pada ${pages} halaman`,
    `${placements.length} visual initial(s) will be applied to ${pages} page(s)`);
}

function clampRectToPage(rect) {
  const w = clampNumber(Number(rect.w) || 0.28, 0.08, 0.75);
  return {
    w,
    x: clampNumber(Number(rect.x) || 0, 0, 1 - w),
    y: clampNumber(Number(rect.y) || 0, 0, 0.95),
  };
}

function updatePlacement(opts, id, updater) {
  return {
    ...opts,
    placements: (opts.placements || []).map((placement) => placement.id === id ? updater(placement) : placement),
  };
}

// ---- Initials: typed or uploaded visual initials, placed on specific pages ----
export function SignPad({ lang, onChange }) {
  const [tab, setTab] = React.useState("type");
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const imgRef = React.useRef(null);

  const exportCanvas = (canvas, label) => {
    canvas.toBlob(async (blob) => {
      const bytes = new Uint8Array(await blob.arrayBuffer());
      onChange({ bytes, url: canvas.toDataURL("image/png"), type: "image/png", aspect: canvas.width / canvas.height, label });
    }, "image/png");
  };
  const typeName = (v) => {
    setName(v);
    const c = document.createElement("canvas");
    c.width = 600; c.height = 200;
    const g = c.getContext("2d");
    g.fillStyle = "#1B1730";
    g.font = "italic 84px 'Segoe Script', 'Brush Script MT', cursive";
    g.textBaseline = "middle";
    g.fillText(v, 24, 100);
    if (v.trim()) exportCanvas(c, v.trim()); else onChange(null);
  };

  const loadImageFile = async (file) => {
    if (!file) return;
    setError("");
    if (!/^image\/(png|jpeg)$/.test(file.type) && !/\.(png|jpe?g)$/i.test(file.name)) {
      setError(TX3(lang, "Gunakan file PNG atau JPG.", "Use a PNG or JPG file."));
      return;
    }
    setLoading(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const url = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const img = await new Promise((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = reject;
        el.src = url;
      });
      onChange({ bytes, url, type: file.type || "image/png", aspect: img.naturalWidth / img.naturalHeight, label: file.name });
    } catch {
      setError(TX3(lang, "Gambar paraf gagal dimuat.", "Initials image failed to load."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <Seg3 value={tab} onChange={setTab} options={[
        { value: "type", label: TX3(lang, "Ketik", "Type") },
        { value: "draw", label: TX3(lang, "Gambar", "Draw") },
      ]} />
      {tab === "type" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Input label={TX3(lang, "Nama", "Name")} value={name} onChange={(e) => typeName(e.target.value)} />
          {name.trim() && (
            <div style={{ padding: "10px 14px", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", background: "var(--color-pdf-page)" }}>
              <span style={{ font: "italic 30px 'Segoe Script', 'Brush Script MT', cursive", color: "#1B1730" }}>{name}</span>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Button variant="secondary" size="sm" onClick={() => imgRef.current?.click()}>{TX3(lang, "Unggah gambar", "Upload image")}</Button>
          <input ref={imgRef} type="file" accept=".png,.jpg,.jpeg" style={{ display: "none" }} onChange={(e) => loadImageFile(e.target.files[0])} />
          {loading && <span style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>{TX3(lang, "Memuat gambar...", "Loading image...")}</span>}
          {error && <span role="alert" style={{ font: "var(--type-caption)", color: "var(--status-error-fg)" }}>{error}</span>}
        </div>
      )}
    </div>
  );
}

DEFS3.sign = {
  view: "preview",
  previewKind: "processed",
  defaults: { signatureSource: null, placements: [], selectedPlacementId: null, widthPct: 28, deletedPlacement: null, outputName: "" },
  Panel: ({ t, lang, opts, setOpts, ctx }) => {
    const currentPage = ctx.previewPage || 1;
    const selected = (opts.placements || []).find((placement) => placement.id === opts.selectedPlacementId);
    const baseOutput = opts.outputName || outputNameValue(ctx, "diparaf");
    React.useEffect(() => {
      if (!opts.outputName && ctx.files[0]) setOpts((next) => next.outputName ? next : { ...next, outputName: outputNameValue(ctx, "diparaf") });
    }, [ctx.files[0]?.id]);
    const addPlacement = () => {
      if (!opts.signatureSource) return;
      const id = nextSignaturePlacementId();
      const rect = clampRectToPage({ x: 0.36, y: 0.72, w: (opts.widthPct || 28) / 100 }, opts.signatureSource.aspect);
      setOpts({ ...opts, selectedPlacementId: id, placements: [...(opts.placements || []), { id, pageIndex: currentPage - 1, rect, source: opts.signatureSource }] });
    };
    const moveSelected = (dx, dy) => {
      if (!selected) return;
      setOpts(updatePlacement(opts, selected.id, (placement) => ({ ...placement, rect: clampRectToPage({ ...placement.rect, x: placement.rect.x + dx, y: placement.rect.y + dy }, placement.source?.aspect) })));
    };
    const resizeSelected = (delta) => {
      if (!selected) return;
      setOpts(updatePlacement(opts, selected.id, (placement) => ({ ...placement, rect: clampRectToPage({ ...placement.rect, w: placement.rect.w + delta }, placement.source?.aspect) })));
    };
    const deleteSelected = () => {
      if (!selected) return;
      setOpts({ ...opts, deletedPlacement: selected, selectedPlacementId: null, placements: opts.placements.filter((placement) => placement.id !== selected.id) });
    };
    const restoreDeleted = () => {
      if (!opts.deletedPlacement) return;
      setOpts({ ...opts, selectedPlacementId: opts.deletedPlacement.id, placements: [...(opts.placements || []), opts.deletedPlacement], deletedPlacement: null });
    };
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Alert tone="info">{TX3(lang, "Tambahkan paraf visual ke PDF. Ini bukan tanda tangan elektronik atau tanda tangan digital tersertifikasi.", "Add visible initials to the PDF. This is not an electronic signature or a certified digital signature.")}</Alert>
        <SignPad lang={lang} onChange={(signatureSource) => setOpts({ ...opts, signatureSource })} />
        {opts.signatureSource?.url && <img src={opts.signatureSource.url} alt={TX3(lang, "Pratinjau paraf", "Initials preview")} style={{ width: 120, maxHeight: 70, objectFit: "contain", border: "1px solid var(--border-default)", borderRadius: 6, background: "var(--color-pdf-page)" }} />}
        <SR3 label={TX3(lang, "Lebar paraf", "Initials width")} value={opts.widthPct || 28} min={10} max={60} unit="%" onChange={(widthPct) => setOpts({ ...opts, widthPct })} />
        <F3 label={TX3(lang, "Target halaman", "Target page")}>
          <span style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>{TX3(lang, `Akan ditempatkan di halaman ${currentPage}`, `Will be placed on page ${currentPage}`)}</span>
          <Button variant="secondary" size="sm" disabled={!opts.signatureSource} onClick={addPlacement}>{TX3(lang, "Tambahkan ke halaman ini", "Add to this page")}</Button>
        </F3>
        <F3 label={TX3(lang, "Daftar paraf", "Initial placements")}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {(opts.placements || []).length ? opts.placements.map((placement, index) => (
              <button key={placement.id} type="button" onClick={() => { setOpts({ ...opts, selectedPlacementId: placement.id }); ctx.goToPreviewPage?.(placement.pageIndex + 1); }} style={{
                textAlign: "left", padding: "8px 10px", borderRadius: "var(--radius-md)",
                border: `1px solid ${opts.selectedPlacementId === placement.id ? "var(--border-brand)" : "var(--border-default)"}`,
                background: opts.selectedPlacementId === placement.id ? "var(--surface-brand-subtle)" : "var(--surface-card)",
                color: "var(--text-heading)", cursor: "pointer", font: "var(--type-caption)",
              }}>{placementLabel(lang, placement, index)}</button>
            )) : <span style={{ font: "var(--type-caption)", color: "var(--text-faint)" }}>{TX3(lang, "Belum ada paraf.", "No initials yet.")}</span>}
          </div>
        </F3>
        {selected && (
          <F3 label={TX3(lang, "Edit paraf terpilih", "Edit selected initials")}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <Button variant="ghost" size="sm" onClick={() => moveSelected(-0.01, 0)}>{TX3(lang, "Kiri", "Left")}</Button>
              <Button variant="ghost" size="sm" onClick={() => moveSelected(0.01, 0)}>{TX3(lang, "Kanan", "Right")}</Button>
              <Button variant="ghost" size="sm" onClick={() => moveSelected(0, -0.01)}>{TX3(lang, "Atas", "Up")}</Button>
              <Button variant="ghost" size="sm" onClick={() => moveSelected(0, 0.01)}>{TX3(lang, "Bawah", "Down")}</Button>
              <Button variant="ghost" size="sm" onClick={() => resizeSelected(-0.02)}>{TX3(lang, "Perkecil", "Smaller")}</Button>
              <Button variant="ghost" size="sm" onClick={() => resizeSelected(0.02)}>{TX3(lang, "Perbesar", "Larger")}</Button>
              <Button variant="danger" size="sm" onClick={deleteSelected}>{TX3(lang, "Hapus paraf", "Delete initials")}</Button>
            </div>
          </F3>
        )}
        {opts.deletedPlacement && <Button variant="ghost" size="sm" onClick={restoreDeleted}>{TX3(lang, "Urungkan hapus paraf", "Undo initials deletion")}</Button>}
        <F3 label={TX3(lang, "Ringkasan", "Summary")}>
          <span style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>{(opts.placements || []).length ? signatureSummary(lang, opts.placements) : TX3(lang, "Tambahkan minimal satu paraf visual.", "Add at least one visual initial.")}</span>
        </F3>
        <OutputNameField lang={lang} value={baseOutput} inputId="sign-output-name" onChange={(outputName) => setOpts({ ...opts, outputName })} />
      </div>
    );
  },
  overlay: (opts, setOpts) => (p, i) => (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {(opts.placements || []).filter((placement) => placement.pageIndex === i).map((placement) => (
        <SignatureOverlay key={placement.id} placement={placement} selected={opts.selectedPlacementId === placement.id} onSelect={() => setOpts({ ...opts, selectedPlacementId: placement.id })} onChange={(nextRect) => setOpts(updatePlacement(opts, placement.id, (item) => ({ ...item, rect: nextRect })))} />
      ))}
    </div>
  ),
  disabled: (ctx, opts, lang = "id") => !(opts.placements || []).length || !!getOutputNameError(opts.outputName || outputNameValue(ctx, "diparaf"), lang),
  disabledReason: (ctx, opts, t, lang) => getOutputNameError(opts.outputName || outputNameValue(ctx, "diparaf"), lang) || TX3(lang, "Tambahkan minimal satu paraf visual.", "Add at least one visual initial."),
  actionLabel: (ctx, opts, t, lang) => TX3(lang, "Paraf dokumen PDF", "Add document initials"),
  successSummary: (result, ctx, opts, t, lang) => signatureSummary(lang, opts.placements || []),
  process: (ctx, opts, onP, lang) => PdfProcess.sign(ctx.files, { ...opts, outputName: getPdfOutputName(opts.outputName || outputNameValue(ctx, "diparaf"), lang) }, onP),
};

function SignatureOverlay({ placement, selected, onSelect, onChange }) {
  const aspect = placement.source?.aspect || 3;
  const rect = placement.rect || { x: 0.36, y: 0.72, w: 0.28 };
  const drag = (event, mode) => {
    event.preventDefault();
    event.stopPropagation();
    onSelect();
    const pageEl = event.currentTarget.closest("[data-signature-page]");
    const pr = pageEl.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const start = { ...rect };
    const onMove = (ev) => {
      const dx = (ev.clientX - startX) / pr.width;
      const dy = (ev.clientY - startY) / pr.height;
      if (mode === "resize") {
        const nextW = clampNumber(start.w + dx, 0.08, 0.75);
        onChange(clampRectToPage({ ...start, w: nextW }));
      } else {
        const renderedW = start.w * pr.width;
        const renderedH = renderedW / aspect;
        const maxX = Math.max(0, (pr.width - renderedW) / pr.width);
        const maxY = Math.max(0, (pr.height - renderedH) / pr.height);
        onChange({ ...start, x: clampNumber(start.x + dx, 0, maxX), y: clampNumber(start.y + dy, 0, maxY) });
      }
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };
  return (
    <div data-signature-page style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <button type="button" aria-label="Paraf visual" onClick={(e) => { e.stopPropagation(); onSelect(); }} onPointerDown={(e) => drag(e, "move")}
        style={{
          position: "absolute", left: `${rect.x * 100}%`, top: `${rect.y * 100}%`, width: `${rect.w * 100}%`,
          border: selected ? "1.5px dashed var(--border-brand)" : "1px solid transparent", background: "transparent",
          padding: 0, cursor: "grab", pointerEvents: "auto", borderRadius: 2,
        }}>
        <img src={placement.source?.url} alt="" draggable={false} style={{ display: "block", width: "100%", height: "auto", pointerEvents: "none" }} />
        {selected && <span aria-hidden="true" onPointerDown={(e) => drag(e, "resize")} style={{ position: "absolute", right: -6, bottom: -6, width: 12, height: 12, borderRadius: 3, border: "1px solid var(--border-brand)", background: "var(--surface-card)", cursor: "nwse-resize", pointerEvents: "auto" }}></span>}
      </button>
    </div>
  );
}

DEFS3.ocr = {
  view: "preview",
  previewKind: "ocr-source",
  selectable: false,
  defaults: {
    language: "ind+eng",
    pageMode: "scanned",
    range: "",
    quality: "balanced",
    outputName: "",
    loadedFor: null,
    hasSignature: false,
    sourceEncrypted: false,
    showOcrText: false,
    ocrOverlays: {},
    lastOcr: null,
  },
  Panel: ({ t, lang, opts, setOpts, ctx }) => {
    const file = ctx.files[0];
    const live = ctx.pages.filter((p) => !p.deleted);
    React.useEffect(() => {
      if (file?.id && opts.loadedFor !== file.id) {
        setOpts((next) => next.loadedFor === file.id ? next : {
          ...next,
          outputName: outputNameValue(ctx, "ocr"),
          loadedFor: file.id,
          hasSignature: PdfProcess.sourceHasDigitalSignature(file.id),
          sourceEncrypted: PdfProcess.sourceHasEncryption(file.id),
          ocrOverlays: {},
          lastOcr: null,
        });
      }
    }, [file?.id]);
    const rangePlan = opts.pageMode === "range" ? analyzeSplitRange(opts.range, live.length, lang) : { error: "" };
    const large = live.length >= 40 || (file?.size || 0) > 80 * 1024 * 1024;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <h3 style={{ margin: 0, font: "var(--weight-bold) 16px/1.25 var(--font-sans)", color: "var(--text-heading)" }}>OCR PDF</h3>
          <span style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>{TX3(lang, "Ubah hasil pindaian menjadi PDF yang dapat dicari dan dipilih teksnya.", "Turn scanned pages into a searchable PDF with selectable text.")}</span>
        </div>
        <Alert tone="info">{TX3(lang, "File diproses di perangkat Anda.", "Files are processed on your device.")}</Alert>
        <Select label={TX3(lang, "Bahasa dokumen", "Document language")} value={opts.language} onChange={(e) => setOpts({ ...opts, language: e.target.value })}
          options={[
            { value: "ind+eng", label: "Indonesia + English" },
            { value: "ind", label: "Indonesia" },
            { value: "eng", label: "English" },
          ]} />
        <F3 label={TX3(lang, "Halaman yang diproses", "Pages to process")}>
          <Seg3 value={opts.pageMode} onChange={(pageMode) => setOpts({ ...opts, pageMode })} options={[
            { value: "scanned", label: TX3(lang, "Hanya halaman pindaian", "Scanned only") },
            { value: "all", label: TX3(lang, "Semua halaman", "All pages") },
            { value: "range", label: TX3(lang, "Rentang", "Range") },
          ]} />
          {opts.pageMode === "all" && <span style={{ font: "var(--type-caption)", color: "var(--status-warning-fg)" }}>{TX3(lang, "OCR ulang semua halaman dapat menghasilkan teks atau hasil pencarian ganda pada PDF digital.", "OCR on all pages can create duplicate text/search results on digital PDFs.")}</span>}
        </F3>
        {opts.pageMode === "range" && (
          <Input mono label={TX3(lang, "Rentang halaman", "Page range")} value={opts.range} placeholder="1-3, 6, 9-12"
            onChange={(e) => setOpts({ ...opts, range: e.target.value })}
            error={rangePlan.error}
            hint={TX3(lang, "Contoh: 1-3, 6, 9-12.", "Example: 1-3, 6, 9-12.")} />
        )}
        <F3 label={TX3(lang, "Kualitas", "Quality")}>
          <Seg3 value={opts.quality} onChange={(quality) => setOpts({ ...opts, quality })} options={[
            { value: "fast", label: TX3(lang, "Cepat", "Fast") },
            { value: "balanced", label: TX3(lang, "Seimbang", "Balanced") },
            { value: "accurate", label: TX3(lang, "Akurat", "Accurate") },
          ]} />
        </F3>
        <OutputNameField lang={lang} value={opts.outputName || outputNameValue(ctx, "ocr")} inputId="ocr-output-name" onChange={(outputName) => setOpts({ ...opts, outputName })} />
        <Alert tone="warning">{TX3(lang, "Hasil OCR dapat memiliki kesalahan pada teks buram, tulisan tangan, atau pindaian berkualitas rendah.", "OCR can be inaccurate on blurry text, handwriting, or low-quality scans.")}</Alert>
        {large && <Alert tone="warning">{TX3(lang, "Dokumen besar dapat membutuhkan waktu lama dan memori tinggi. Proses dilakukan bertahap.", "Large documents can take a long time and use significant memory. Processing is progressive.")}</Alert>}
        {opts.hasSignature && <Alert tone="warning">{TX3(lang, "Memproses OCR dapat membuat tanda tangan digital yang ada tidak lagi valid.", "OCR processing can make existing digital signatures invalid.")}</Alert>}
        {opts.sourceEncrypted && <Alert tone="error">{TX3(lang, "PDF ini dilindungi password. PDFin tidak mencoba membuka atau membobol password.", "This PDF is password-protected. PDFin will not bypass or crack passwords.")}</Alert>}
        {!!Object.keys(opts.ocrOverlays || {}).length && <Switch label={TX3(lang, "Tampilkan teks hasil OCR", "Show OCR text")} checked={!!opts.showOcrText} onChange={(showOcrText) => setOpts({ ...opts, showOcrText })} />}
      </div>
    );
  },
  disabled: (ctx, opts, lang = "id") => {
    const live = ctx.pages.filter((p) => !p.deleted);
    if (!ctx.validFiles?.length || ctx.loadingFiles?.length || opts.sourceEncrypted) return true;
    if (opts.pageMode === "range" && analyzeSplitRange(opts.range, live.length, lang).error) return true;
    return !!getOutputNameError(opts.outputName || outputNameValue(ctx, "ocr"), lang);
  },
  disabledReason: (ctx, opts, t, lang) => {
    const live = ctx.pages.filter((p) => !p.deleted);
    const outputError = getOutputNameError(opts.outputName || outputNameValue(ctx, "ocr"), lang);
    if (!ctx.validFiles?.length) return t.toolRequirements.ocr;
    if (ctx.loadingFiles?.length) return TX3(lang, "Tunggu sampai file selesai dimuat.", "Wait until the file is fully loaded.");
    if (opts.sourceEncrypted) return TX3(lang, "PDF ini dilindungi password dan belum dapat diproses OCR.", "This password-protected PDF cannot be OCR processed yet.");
    if (opts.pageMode === "range") return analyzeSplitRange(opts.range, live.length, lang).error || t.cta.ready;
    return outputError || t.cta.ready;
  },
  actionLabel: (ctx, opts, t, lang) => TX3(lang, "Buat PDF dapat dicari", "Create searchable PDF"),
  processLabel: (t, lang) => TX3(lang, "Memproses OCR…", "Processing OCR…"),
  progressLabel: (detail, t, lang) => {
    if (!detail?.page || !detail?.total) return TX3(lang, "Memproses OCR…", "Processing OCR…");
    return TX3(lang, `Memproses halaman ${detail.page} dari ${detail.total}`, `Processing page ${detail.page} of ${detail.total}`);
  },
  afterProcessOpts: (opts, result) => ({
    ...opts,
    showOcrText: !!result?.ocr?.processedPages?.length,
    ocrOverlays: result?.ocr?.overlays || {},
    lastOcr: result?.ocr || null,
  }),
  overlay: (opts) => {
    if (!opts.showOcrText) return null;
    return (page, pageIndex) => {
      const boxes = opts.ocrOverlays?.[pageIndex + 1] || [];
      if (!boxes.length) return null;
      return (
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {boxes.map((box, index) => (
            <span key={index} style={{
              position: "absolute",
              left: `${box.rect.x * 100}%`,
              top: `${box.rect.y * 100}%`,
              width: `${box.rect.w * 100}%`,
              height: `${box.rect.h * 100}%`,
              border: "1px solid color-mix(in srgb, var(--border-brand) 70%, transparent)",
              background: "color-mix(in srgb, var(--surface-brand-subtle) 38%, transparent)",
              borderRadius: 2,
            }} />
          ))}
        </div>
      );
    };
  },
  successSummary: (result, ctx, opts, t, lang) => {
    if (result.ocr?.noScannedPages) return TX3(lang, "PDF ini sudah memiliki teks yang dapat dicari.", "This PDF already has searchable text.");
    const processed = result.ocr?.processedPages?.length || 0;
    const low = result.ocr?.lowConfidencePages || [];
    return TX3(lang,
      `OCR selesai — PDF siap dicari. ${processed} halaman diproses${low.length ? `; ${low.length} halaman mungkin perlu diperiksa.` : "."}`,
      `OCR complete — PDF is searchable. ${processed} page${processed === 1 ? "" : "s"} processed${low.length ? `; ${low.length} page${low.length === 1 ? "" : "s"} may need review.` : "."}`);
  },
  process: (ctx, opts, onP, lang) => PdfProcess.ocr(ctx.files, {
    ...opts,
    pages: ctx.pages,
    outputName: getPdfOutputName(opts.outputName || outputNameValue(ctx, "ocr"), lang),
  }, onP),
};
