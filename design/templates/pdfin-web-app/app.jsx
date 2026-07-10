// PDFin Web app template — combined Chrome + Home + Merge screens.
// Exposes window.PdfinWebApp for <x-import component-from-global-scope="PdfinWebApp">.

// PDFin Web — shared chrome (Header, Footer). Exposes to window.
const DS = window.PDFinDesignSystem_41a2ca;

function PdfinLogo({ dark = false }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <img src="../../assets/logo/pdfin-mark-64.png" alt="" style={{ width: 30, height: 30 }} />
      <span style={{ font: "var(--weight-extrabold) 20px/1 var(--font-sans)", letterSpacing: "-0.02em", color: dark ? "#fff" : "var(--text-heading)" }}>
        PDF<span style={{ color: dark ? "var(--cyan-400)" : "var(--text-brand)" }}>in</span>
      </span>
    </span>
  );
}

function Header({ lang, setLang, theme, setTheme, onHome }) {
  const nav = lang === "id" ? ["Semua alat", "Desktop", "Tentang"] : ["All tools", "Desktop", "About"];
  return (
    <header style={{
      height: "var(--header-height)", background: "var(--surface-card)",
      borderBottom: "1px solid var(--border-default)",
      display: "flex", alignItems: "center", gap: 24, padding: "0 32px",
      position: "sticky", top: 0, zIndex: 10,
    }}>
      <a href="#" onClick={(e) => { e.preventDefault(); onHome(); }} style={{ textDecoration: "none" }}><PdfinLogo /></a>
      <nav style={{ display: "flex", gap: 4, flex: 1 }}>
        {nav.map((n) => (
          <a key={n} href="#" onClick={(e) => e.preventDefault()} style={{
            font: "var(--type-label)", color: "var(--text-body)", padding: "8px 12px",
            borderRadius: "var(--radius-md)", textDecoration: "none",
          }}>{n}</a>
        ))}
      </nav>
      <DS.LangSwitcher lang={lang} onChange={setLang} />
      <DS.IconButton
        label={theme === "dark" ? "Light mode" : "Dark mode"}
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        icon={theme === "dark"
          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path></svg>
          : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"></path></svg>}
      />
    </header>
  );
}

function Footer({ lang }) {
  const t = lang === "id"
    ? { privacy: "Kebijakan privasi", terms: "Syarat & ketentuan", desktop: "Aplikasi desktop", note: "File Anda diproses di browser. PDFin tidak mengunggah file Anda untuk alat ini." }
    : { privacy: "Privacy policy", terms: "Terms", desktop: "Desktop app", note: "Your files are processed in your browser. PDFin does not upload your files for this tool." };
  return (
    <footer style={{ borderTop: "1px solid var(--border-default)", padding: "28px 32px", display: "flex", alignItems: "center", gap: 24, background: "var(--surface-card)" }}>
      <PdfinLogo />
      <span style={{ font: "var(--type-caption)", color: "var(--text-muted)", flex: 1 }}>{t.note}</span>
      <a href="#" onClick={(e) => e.preventDefault()} style={{ font: "var(--type-caption)" }}>{t.privacy}</a>
      <a href="#" onClick={(e) => e.preventDefault()} style={{ font: "var(--type-caption)" }}>{t.terms}</a>
      <a href="#" onClick={(e) => e.preventDefault()} style={{ font: "var(--type-caption)" }}>GitHub</a>
      <a href="#" onClick={(e) => e.preventDefault()} style={{ font: "var(--type-caption)" }}>{t.desktop}</a>
    </footer>
  );
}

Object.assign(window, { PdfinLogo, Header, Footer });


// PDFin Web — homepage screen
const HomeDS = window.PDFinDesignSystem_41a2ca;

const homeIcons = {
  merge: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 16 4-4-4-4M6 8l-4 4 4 4"></path><path d="M12 3v18"></path></svg>,
  split: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5M8 3H3v5M21 3l-7 7M3 3l7 7M16 21h5v-5M8 21H3v-5M21 21l-7-7M3 21l7-7"></path></svg>,
  organize: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg>,
  rotate: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path></svg>,
  img2pdf: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"></path></svg>,
  pdf2img: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><path d="M14 2v6h6"></path><circle cx="10" cy="13" r="2"></circle><path d="m20 21-3.5-3.5a1.5 1.5 0 0 0-2 0L9 23"></path></svg>,
  compress: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m4 4 6 6m0-6v6H4M20 20l-6-6m6 0v6h-6"></path></svg>,
  watermark: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path></svg>,
  numbers: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 17V7l-2 2M10 7h4l-4 10h4"></path><path d="M17 7h3a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h3"></path></svg>,
  flatten: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2 8.5 4.5L12 11 3.5 6.5 12 2z"></path><path d="m3.5 12 8.5 4.5 8.5-4.5"></path><path d="m3.5 17.5 8.5 4.5 8.5-4.5"></path></svg>,
};

const homeTools = [
  { key: "merge", id: ["Gabung PDF", "Gabungkan beberapa PDF menjadi satu file."], en: ["Merge PDF", "Combine multiple PDFs into one file."], live: true },
  { key: "split", id: ["Pisah PDF", "Ambil halaman tertentu dari sebuah PDF."], en: ["Split PDF", "Extract selected pages from a PDF."] },
  { key: "organize", id: ["Atur Halaman PDF", "Urutkan, hapus, dan putar halaman."], en: ["Organize PDF", "Reorder, delete, and rotate pages."] },
  { key: "rotate", id: ["Putar PDF", "Putar semua atau sebagian halaman."], en: ["Rotate PDF", "Rotate all or selected pages."] },
  { key: "img2pdf", id: ["Gambar ke PDF", "Ubah JPG, PNG, WebP menjadi PDF."], en: ["Images to PDF", "Turn JPG, PNG, WebP into a PDF."] },
  { key: "pdf2img", id: ["PDF ke Gambar", "Ekspor halaman PDF sebagai JPG/PNG."], en: ["PDF to Image", "Export PDF pages as JPG/PNG."] },
  { key: "compress", id: ["Kompres PDF", "Kecilkan ukuran file PDF."], en: ["Compress PDF", "Reduce PDF file size."] },
  { key: "watermark", id: ["Watermark PDF", "Tambahkan teks atau logo watermark."], en: ["Watermark PDF", "Add a text or logo watermark."] },
  { key: "numbers", id: ["Tambah Nomor Halaman", "Beri nomor halaman pada PDF."], en: ["Page Numbers", "Add page numbers to a PDF."] },
  { key: "flatten", id: ["Ratakan PDF", "Gabungkan isi PDF menjadi satu lapisan."], en: ["Flatten PDF", "Merge PDF content into a single layer."] },
];

function HomeScreen({ lang, onOpenMerge }) {
  const t = lang === "id"
    ? { h1: "Alat PDF mudah, cepat, dan privat.", sub: "File tetap di perangkat Anda. Semua alat inti memproses file langsung di browser — tanpa unggah, tanpa akun.", soon: "Segera hadir", protect: ["Kunci PDF", "Lindungi PDF dengan kata sandi."] }
    : { h1: "PDF tools that keep your files on your device.", sub: "All core tools process files directly in your browser — no upload, no account.", soon: "Coming soon", protect: ["Protect PDF", "Password-protect a PDF."] };
  return (
    <main>
      <section style={{ background: "var(--gradient-brand-soft)", borderBottom: "1px solid var(--border-default)", padding: "56px 32px 48px", textAlign: "center" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <HomeDS.PrivacyPill lang={lang} />
          <h1 style={{ font: "var(--type-display)", letterSpacing: "var(--tracking-tight)" }}>{t.h1}</h1>
          <p style={{ font: "var(--type-body)", color: "var(--text-muted)", maxWidth: 560, margin: 0 }}>{t.sub}</p>
        </div>
      </section>
      <section style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "40px 32px 64px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gridAutoRows: "1fr", gap: 16 }}>
          {homeTools.map((tool) => {
            const [title, desc] = lang === "id" ? tool.id : tool.en;
            return (
              <div key={tool.key} onClick={tool.live ? onOpenMerge : undefined} style={{ cursor: tool.live ? "pointer" : "default", height: "100%" }}>
                <HomeDS.ToolTile icon={homeIcons[tool.key]} title={title} description={desc} />
              </div>
            );
          })}
          <HomeDS.ToolTile
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>}
            title={t.protect[0]} description={t.protect[1]}
            badge={<HomeDS.Badge tone="neutral">{t.soon}</HomeDS.Badge>}
          />
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { HomeScreen });


// PDFin Web — Merge PDF tool workspace (interactive mock)
const MergeDS = window.PDFinDesignSystem_41a2ca;

const sampleFiles = [
  { id: 1, name: "laporan-keuangan-q2.pdf", meta: "2,4 MB · 18 halaman" },
  { id: 2, name: "lampiran-kontrak.pdf", meta: "840 KB · 6 halaman" },
];

function MergeScreen({ lang }) {
  const t = lang === "id" ? {
    title: "Gabung PDF",
    desc: "Gabungkan beberapa file PDF menjadi satu. File diproses langsung di browser Anda dan tidak diunggah ke server PDFin.",
    order: "Urutan file", add: "Tambah file", process: "Gabung PDF",
    processing: "Memproses", done: "Selesai", doneMsg: "PDF Anda siap diunduh.",
    download: "Unduh PDF", restart: "Mulai ulang", output: "hasil-gabungan.pdf",
    related: "Alat terkait", relMerge: ["Kompres PDF", "Kecilkan hasil gabungan."], relSplit: ["Pisah PDF", "Ambil halaman tertentu."],
    faq: "Pertanyaan umum",
    faqs: [
      ["Apakah file saya diunggah?", "Tidak. Semua proses penggabungan terjadi di browser Anda. PDFin tidak mengunggah file Anda untuk alat ini."],
      ["Berapa banyak file yang bisa digabung?", "Anda dapat menggabungkan 2–20 file PDF dalam sekali proses."],
      ["Apakah kualitas file berubah?", "Tidak. Halaman disalin apa adanya — teks dan ukuran halaman asli dipertahankan."],
    ],
    remove: "Hapus file",
  } : {
    title: "Merge PDF",
    desc: "Combine multiple PDFs into one file. Processing happens directly in your browser and your files are not uploaded to PDFin.",
    order: "File order", add: "Add file", process: "Merge PDF",
    processing: "Processing", done: "Completed", doneMsg: "Your PDF is ready to download.",
    download: "Download PDF", restart: "Start over", output: "merged.pdf",
    related: "Related tools", relMerge: ["Compress PDF", "Shrink the merged file."], relSplit: ["Split PDF", "Extract selected pages."],
    faq: "Frequently asked questions",
    faqs: [
      ["Are my files uploaded?", "No. Merging happens in your browser. PDFin does not upload your files for this tool."],
      ["How many files can I merge?", "You can merge 2–20 PDF files at once."],
      ["Does quality change?", "No. Pages are copied as-is — original text and page sizes are preserved."],
    ],
    remove: "Remove file",
  };

  const [files, setFiles] = React.useState([]);
  const [stage, setStage] = React.useState("empty"); // empty | ready | processing | done
  const [progress, setProgress] = React.useState(0);

  const addFiles = () => { setFiles(sampleFiles); setStage("ready"); };
  const startMerge = () => {
    setStage("processing"); setProgress(0);
    const iv = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(iv); setStage("done"); return 100; }
        return p + 20;
      });
    }, 300);
  };
  const reset = () => { setFiles([]); setStage("empty"); setProgress(0); };

  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: "40px 32px 64px" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center", marginBottom: 28 }}>
        <MergeDS.PrivacyPill lang={lang} />
        <h1 style={{ font: "var(--type-h1)", letterSpacing: "var(--tracking-tight)" }}>{t.title}</h1>
        <p style={{ font: "var(--type-body)", color: "var(--text-muted)", maxWidth: 560, margin: 0 }}>{t.desc}</p>
      </div>

      {stage === "empty" && <MergeDS.Dropzone lang={lang} multiple accept="PDF" onSelect={addFiles} />}

      {stage === "ready" && (
        <MergeDS.Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ font: "var(--type-label)" }}>{t.order}</span>
              <MergeDS.Button variant="ghost" size="sm" onClick={addFiles}>+ {t.add}</MergeDS.Button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {files.map((f) => (
                <MergeDS.FileCard key={f.id} name={f.name} meta={f.meta} removeLabel={t.remove}
                  onRemove={() => setFiles((cur) => cur.filter((x) => x.id !== f.id))} />
              ))}
            </div>
            <MergeDS.Button variant="primary" size="lg" fullWidth disabled={files.length < 2} onClick={startMerge}>{t.process}</MergeDS.Button>
          </div>
        </MergeDS.Card>
      )}

      {stage === "processing" && (
        <MergeDS.Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <MergeDS.ProgressBar value={progress} label={t.processing} />
            <MergeDS.Button variant="ghost" size="sm" onClick={reset}>{lang === "id" ? "Batal" : "Cancel"}</MergeDS.Button>
          </div>
        </MergeDS.Card>
      )}

      {stage === "done" && (
        <MergeDS.Card>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center", padding: "8px 0" }}>
            <MergeDS.Badge tone="success">{t.done}</MergeDS.Badge>
            <span style={{ font: "var(--type-mono)", color: "var(--text-heading)" }}>{t.output}</span>
            <p style={{ font: "var(--type-body-sm)", color: "var(--text-muted)", margin: 0 }}>{t.doneMsg}</p>
            <div style={{ display: "flex", gap: 10 }}>
              <MergeDS.Button variant="primary" size="lg" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"></path></svg>}>{t.download}</MergeDS.Button>
              <MergeDS.Button variant="secondary" size="lg" onClick={reset}>{t.restart}</MergeDS.Button>
            </div>
          </div>
        </MergeDS.Card>
      )}

      <section style={{ marginTop: 40 }}>
        <h2 style={{ font: "var(--type-h3)", marginBottom: 14 }}>{t.related}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <MergeDS.ToolTile title={t.relMerge[0]} description={t.relMerge[1]}
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m4 4 6 6m0-6v6H4M20 20l-6-6m6 0v6h-6"></path></svg>} />
          <MergeDS.ToolTile title={t.relSplit[0]} description={t.relSplit[1]}
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5M8 3H3v5M21 3l-7 7M3 3l7 7M16 21h5v-5M8 21H3v-5M21 21l-7-7M3 21l7-7"></path></svg>} />
        </div>
      </section>

      <section style={{ marginTop: 40 }}>
        <h2 style={{ font: "var(--type-h3)", marginBottom: 14 }}>{t.faq}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {t.faqs.map(([q, a]) => (
            <MergeDS.Card key={q} padding="16px 18px">
              <div style={{ font: "var(--type-label)", marginBottom: 4, color: "var(--text-heading)" }}>{q}</div>
              <div style={{ font: "var(--type-body-sm)", color: "var(--text-muted)" }}>{a}</div>
            </MergeDS.Card>
          ))}
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { MergeScreen });


function PdfinWebApp() {
  const [lang, setLang] = React.useState("id");
  const [theme, setTheme] = React.useState("light");
  const [screen, setScreen] = React.useState("home"); // home | merge
  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("lang", lang);
  }, [theme, lang]);
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--surface-page)" }}>
      <Header lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} onHome={() => setScreen("home")} />
      <div style={{ flex: 1 }} data-screen-label={screen === "home" ? "Homepage" : "Merge tool"}>
        {screen === "home"
          ? <HomeScreen lang={lang} onOpenMerge={() => setScreen("merge")} />
          : <MergeScreen lang={lang} />}
      </div>
      <Footer lang={lang} />
    </div>
  );
}
window.PdfinWebApp = PdfinWebApp;
