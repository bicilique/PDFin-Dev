import React from "react";
import { Alert, Button, Input, Select, Switch } from "../../../components/index.js";
import { Field as F3, Segmented as Seg3, SliderRow as SR3, TX as TX3, TOOL_DEFS as DEFS3 } from "./tools-1.jsx";
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
  const labels = lang === "id" ? ["Terlalu pendek", "Lemah", "Cukup", "Kuat", "Sangat kuat"] : ["Too short", "Weak", "Fair", "Strong", "Very strong"];
  const colors = ["var(--ink-300)", "var(--status-error-fg)", "var(--status-warning-fg)", "var(--status-success-fg)", "var(--status-success-fg)"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ display: "flex", gap: 4 }}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < s ? colors[s] : "var(--surface-sunken)", transition: "background var(--duration-fast) var(--ease-out)" }}></span>
        ))}
      </div>
      {pw && <span style={{ font: "11px/1 var(--font-sans)", color: colors[s] }}>{labels[s]}</span>}
    </div>
  );
}

DEFS3.protect = {
  view: "preview", simulated: true,
  defaults: { pw: "", pw2: "", printing: true, copying: false, editing: false },
  Panel: ({ t, lang, opts, setOpts }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <Input type="password" label={TX3(lang, "Kata sandi", "Password")} value={opts.pw} onChange={(e) => setOpts({ ...opts, pw: e.target.value })} />
        <StrengthMeter pw={opts.pw} lang={lang} />
      </div>
      <Input type="password" label={TX3(lang, "Ulangi kata sandi", "Repeat password")} value={opts.pw2}
        error={opts.pw2 && opts.pw2 !== opts.pw ? TX3(lang, "Kata sandi tidak sama.", "Passwords do not match.") : undefined}
        onChange={(e) => setOpts({ ...opts, pw2: e.target.value })} />
      <F3 label={TX3(lang, "Izin dokumen", "Document permissions")}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Switch label={TX3(lang, "Boleh dicetak", "Allow printing")} checked={opts.printing} onChange={(printing) => setOpts({ ...opts, printing })} />
          <Switch label={TX3(lang, "Boleh disalin", "Allow copying")} checked={opts.copying} onChange={(copying) => setOpts({ ...opts, copying })} />
          <Switch label={TX3(lang, "Boleh diubah", "Allow editing")} checked={opts.editing} onChange={(editing) => setOpts({ ...opts, editing })} />
        </div>
      </F3>
      <F3 label={TX3(lang, "Ringkasan enkripsi", "Encryption summary")}>
        <span style={{ font: "12px var(--font-mono)", color: "var(--text-muted)" }}>
          AES-256 · {[opts.printing && TX3(lang, "cetak", "print"), opts.copying && TX3(lang, "salin", "copy"), opts.editing && TX3(lang, "ubah", "edit")].filter(Boolean).join(", ") || TX3(lang, "semua diblokir", "all blocked")}
        </span>
      </F3>
    </div>
  ),
  disabled: (ctx, opts) => strength(opts.pw) < 1 || opts.pw !== opts.pw2,
  processLabel: (t, lang) => TX3(lang, "Mengenkripsi…", "Encrypting…"),
  process: (ctx, opts, onP) => PdfProcess.passthrough(ctx.files, "-terkunci", onP),
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
  defaults: { title: "", author: "", subject: "", keywords: "", loadedFor: null },
  Panel: ({ t, lang, opts, setOpts, ctx }) => {
    const fileId = ctx.files[0] && ctx.files[0].id;
    React.useEffect(() => {
      if (fileId && opts.loadedFor !== fileId) {
        PdfProcess.readMetadata(fileId).then((m) => setOpts({ ...opts, ...m, loadedFor: fileId }));
      }
    }, [fileId]);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Input label={TX3(lang, "Judul", "Title")} value={opts.title} onChange={(e) => setOpts({ ...opts, title: e.target.value })} />
        <Input label={TX3(lang, "Penulis", "Author")} value={opts.author} onChange={(e) => setOpts({ ...opts, author: e.target.value })} />
        <Input label={TX3(lang, "Subjek", "Subject")} value={opts.subject} onChange={(e) => setOpts({ ...opts, subject: e.target.value })} />
        <Input label={TX3(lang, "Kata kunci", "Keywords")} value={opts.keywords} hint={TX3(lang, "Pisahkan dengan koma.", "Separate with commas.")} onChange={(e) => setOpts({ ...opts, keywords: e.target.value })} />
      </div>
    );
  },
  process: (ctx, opts, onP) => PdfProcess.metadata(ctx.files, opts, onP),
};

// ---- Sign: draw or type a signature, click a page to place, drag to move ----
export function SignPad({ lang, onChange }) {
  const [tab, setTab] = React.useState("type");
  const [name, setName] = React.useState("");
  const canvasRef = React.useRef(null);
  const drawing = React.useRef(false);

  const exportCanvas = (canvas) => {
    canvas.toBlob(async (blob) => {
      const bytes = new Uint8Array(await blob.arrayBuffer());
      onChange({ png: bytes, url: canvas.toDataURL("image/png") });
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
    if (v.trim()) exportCanvas(c); else onChange(null);
  };
  const pos = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (canvasRef.current.width / r.width), y: (e.clientY - r.top) * (canvasRef.current.height / r.height) };
  };
  const start = (e) => { drawing.current = true; const g = canvasRef.current.getContext("2d"); const p = pos(e); g.beginPath(); g.moveTo(p.x, p.y); };
  const move = (e) => {
    if (!drawing.current) return;
    const g = canvasRef.current.getContext("2d");
    g.strokeStyle = "#1B1730"; g.lineWidth = 3.5; g.lineCap = "round"; g.lineJoin = "round";
    const p = pos(e); g.lineTo(p.x, p.y); g.stroke();
  };
  const end = () => { if (drawing.current) { drawing.current = false; exportCanvas(canvasRef.current); } };
  const clear = () => { const c = canvasRef.current; c.getContext("2d").clearRect(0, 0, c.width, c.height); onChange(null); };

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
            <div style={{ padding: "10px 14px", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", background: "#fff" }}>
              <span style={{ font: "italic 30px 'Segoe Script', 'Brush Script MT', cursive", color: "#1B1730" }}>{name}</span>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <canvas ref={canvasRef} width={440} height={180}
            onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerLeave={end}
            style={{ width: "100%", height: 90, background: "#fff", border: "1px dashed var(--border-strong)", borderRadius: "var(--radius-md)", touchAction: "none", cursor: "crosshair" }}></canvas>
          <Button variant="ghost" size="sm" onClick={clear}>{TX3(lang, "Bersihkan", "Clear")}</Button>
        </div>
      )}
    </div>
  );
}

DEFS3.sign = {
  view: "preview",
  defaults: { signaturePng: null, sigUrl: null, pageIndex: null, rect: { x: 0.55, y: 0.78, w: 0.28 } },
  Panel: ({ t, lang, opts, setOpts }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <SignPad lang={lang} onChange={(sig) => setOpts({ ...opts, signaturePng: sig && sig.png, sigUrl: sig && sig.url })} />
      <SR3 label={TX3(lang, "Lebar tanda tangan", "Signature width")} value={Math.round(opts.rect.w * 100)} min={10} max={60} unit="%"
        onChange={(v) => setOpts({ ...opts, rect: { ...opts.rect, w: v / 100 } })} />
      <Alert tone={opts.pageIndex == null ? "warning" : "info"}>
        {opts.pageIndex == null
          ? TX3(lang, "Klik halaman di pratinjau untuk menempatkan tanda tangan.", "Click a page in the preview to place the signature.")
          : TX3(lang, `Ditempatkan di halaman ${opts.pageIndex + 1}. Tarik untuk memindahkan.`, `Placed on page ${opts.pageIndex + 1}. Drag to move.`)}
      </Alert>
    </div>
  ),
  overlay: (opts, setOpts) => (p, i) => (
    <div
      onClick={(e) => {
        if (!opts.sigUrl) return;
        const r = e.currentTarget.getBoundingClientRect();
        setOpts({ ...opts, pageIndex: i, rect: { ...opts.rect, x: Math.min(0.9, Math.max(0, (e.clientX - r.left) / r.width - opts.rect.w / 2)), y: Math.min(0.92, Math.max(0, (e.clientY - r.top) / r.height - 0.04)) } });
      }}
      style={{ position: "absolute", inset: 0, cursor: opts.sigUrl ? "copy" : "default" }}>
      {opts.pageIndex === i && opts.sigUrl && (
        <img src={opts.sigUrl} alt="signature" draggable={false}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => {
            e.preventDefault(); e.stopPropagation();
            const pageEl = e.currentTarget.parentElement;
            const pr = pageEl.getBoundingClientRect();
            const startX = e.clientX, startY = e.clientY, o = { ...opts.rect };
            const onMove = (ev) => setOpts({
              ...opts, pageIndex: i,
              rect: { ...opts.rect, w: o.w, x: Math.min(0.95 - o.w, Math.max(0, o.x + (ev.clientX - startX) / pr.width)), y: Math.min(0.95, Math.max(0, o.y + (ev.clientY - startY) / pr.height)) },
            });
            const onUp = () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); };
            window.addEventListener("pointermove", onMove);
            window.addEventListener("pointerup", onUp);
          }}
          style={{
            position: "absolute", left: `${opts.rect.x * 100}%`, top: `${opts.rect.y * 100}%`,
            width: `${opts.rect.w * 100}%`, cursor: "grab",
            outline: "1.5px dashed var(--border-brand)", outlineOffset: 4, borderRadius: 2,
          }} />
      )}
    </div>
  ),
  disabled: (ctx, opts) => !opts.signaturePng || opts.pageIndex == null,
  process: (ctx, opts, onP) => PdfProcess.sign(ctx.files, opts, onP),
};

DEFS3.ocr = {
  view: "grid", selectable: false, simulated: true,
  defaults: { language: "ind" },
  Panel: ({ t, lang, opts, setOpts, ctx }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Select label={TX3(lang, "Bahasa dokumen", "Document language")} value={opts.language} onChange={(e) => setOpts({ ...opts, language: e.target.value })}
        options={[
          { value: "ind", label: "Indonesia" }, { value: "eng", label: "English" },
          { value: "ind+eng", label: "Indonesia + English" },
        ]} />
      <Alert tone="info">{TX3(lang,
        "Teks hasil pindaian dikenali dan disisipkan sebagai lapisan yang dapat dicari — tampilan halaman tidak berubah.",
        "Scanned text is recognized and embedded as a searchable layer — the page appearance does not change.")}</Alert>
    </div>
  ),
  processLabel: (t, lang) => TX3(lang, "Mengenali teks…", "Recognizing text…"),
  process: (ctx, opts, onP) => PdfProcess.passthrough(ctx.files, "-ocr", onP, true),
};
