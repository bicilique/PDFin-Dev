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
