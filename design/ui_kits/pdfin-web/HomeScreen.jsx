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
