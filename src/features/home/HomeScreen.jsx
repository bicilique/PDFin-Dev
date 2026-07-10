import { Badge, ToolTile } from "../../components/index.js";
import { getToolHref, PROTOTYPE_TOOL_IDS, WORKSPACE_TOOL_IDS } from "../../app/toolRoutes.js";
import { PDFIN_T } from "../workspace/i18n.js";

const homeIcons = {
  merge: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 16 4-4-4-4M6 8l-4 4 4 4"></path><path d="M12 3v18"></path></svg>,
  split: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5M8 3H3v5M21 3l-7 7M3 3l7 7M16 21h5v-5M8 21H3v-5M21 21l-7-7M3 21l7-7"></path></svg>,
  organize: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg>,
  rotate: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path></svg>,
  img2pdf: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"></path></svg>,
  pdf2img: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><path d="M14 2v6h6"></path><circle cx="10" cy="13" r="2"></circle><path d="m20 21-3.5-3.5a1.5 1.5 0 0 0-2 0L9 23"></path></svg>,
  compress: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m4 4 6 6m0-6v6H4M20 20l-6-6m6 0v6h-6"></path></svg>,
  watermark: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path></svg>,
  pagenum: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 17V7l-2 2M10 7h4l-4 10h4"></path><path d="M17 7h3a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h3"></path></svg>,
  flatten: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2 8.5 4.5L12 11 3.5 6.5 12 2z"></path><path d="m3.5 12 8.5 4.5 8.5-4.5"></path><path d="m3.5 17.5 8.5 4.5 8.5-4.5"></path></svg>,
  protect: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
  unlock: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>,
  metadata: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><path d="M14 2v6h6"></path><path d="M8 13h8M8 17h5"></path></svg>,
  sign: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>,
  ocr: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><path d="M7 8h8M7 12h10M7 16h6"></path></svg>,
};

const toolCategories = [
  { id: "pages", tools: ["merge", "split", "organize", "rotate", "pagenum"] },
  { id: "conversion", tools: ["compress", "img2pdf", "pdf2img", "ocr"] },
  { id: "security", tools: ["protect", "unlock", "watermark", "metadata", "sign", "flatten"] },
];

const factIcons = {
  free: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6"></path></svg>,
  account: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-8 0v2"></path><circle cx="12" cy="7" r="4"></circle><path d="m17 11 2 2 4-4"></path></svg>,
  local: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="14" rx="2"></rect><path d="M8 22h8"></path><path d="M12 18v4"></path></svg>,
  external: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>,
};

export function HomeScreen({ lang }) {
  const t = lang === "id"
    ? {
        eyebrow: "Diproses langsung di browser Anda",
        h1: "Alat PDF gratis yang bekerja di perangkat Anda.",
        sub: "Gabungkan, pisahkan, atur, dan kelola PDF tanpa mengunggah file ke server dan tanpa membuat akun.",
        explore: "Jelajahi alat",
        github: "Lihat di GitHub",
        githubLabel: "Lihat di GitHub (membuka tab baru)",
        trustFacts: ["Gratis digunakan", "Tanpa akun", "Diproses lokal di browser"],
        privacyLink: "Pelajari privasi dan batasan alat",
        categories: {
          pages: "Kelola halaman",
          conversion: "Konversi dan optimasi",
          security: "Keamanan dan informasi",
        },
        categoryDesc: {
          pages: "Susun, pisahkan, gabungkan, dan beri nomor halaman PDF.",
          conversion: "Ubah format, kurangi ukuran, atau jadikan hasil pindaian dapat dicari.",
          security: "Kelola password, watermark, metadata, paraf visual, dan perataan PDF.",
        },
        inDevelopment: "Dalam pengembangan",
        privacyTitle: "Privasi dan batasan alat",
        privacyIntro: "PDFin dirancang untuk memproses dokumen di browser, dengan batasan yang perlu dipahami sebelum menangani file penting.",
        privacyFacts: [
          "File PDF dan gambar diproses di browser Anda dan tidak diunggah ke server PDFin.",
          "Browser menggunakan memori sementara saat memuat, melihat pratinjau, dan memproses dokumen.",
          "Unduh dan simpan sendiri file hasil pemrosesan.",
          "PDF besar bergantung pada kapasitas memori dan performa perangkat/browser.",
          "Password PDF tidak dapat dipulihkan oleh PDFin.",
          "Paraf visual PDF bukan tanda tangan elektronik atau tanda tangan digital berbasis sertifikat.",
          "Buka PDF terkunci masih dalam pengembangan.",
          "Preferensi bahasa/tema dan daftar nama file terakhir dapat tersimpan di localStorage browser.",
        ],
        openTitle: "Terbuka untuk dipelajari dan dijalankan sendiri",
        openBody: "PDFin dibuat sebagai alat PDF gratis dengan pemrosesan di browser. Kode sumber tersedia di GitHub untuk dipelajari, digunakan, dan dikembangkan lebih lanjut.",
        contact: "Hubungi untuk self-hosting",
        note: "Memerlukan PDFin untuk lingkungan internal, self-hosting, atau on-premise? Hubungi kami untuk berdiskusi.",
      }
    : {
        eyebrow: "Processed directly in your browser",
        h1: "Free PDF tools that work on your device.",
        sub: "Merge, split, organize, and manage PDFs without uploading files to a server and without creating an account.",
        explore: "Explore tools",
        github: "View on GitHub",
        githubLabel: "View on GitHub (opens in a new tab)",
        trustFacts: ["Free to use", "No account", "Local browser processing"],
        privacyLink: "Learn about privacy and tool limits",
        categories: {
          pages: "Manage pages",
          conversion: "Conversion and optimization",
          security: "Security and information",
        },
        categoryDesc: {
          pages: "Arrange, split, merge, rotate, and number PDF pages.",
          conversion: "Convert formats, reduce size, or make scanned PDFs searchable.",
          security: "Manage passwords, watermarks, metadata, visual initials, and flattening.",
        },
        inDevelopment: "In development",
        privacyTitle: "Privacy and tool limits",
        privacyIntro: "PDFin is designed to process documents in your browser, with practical limits to understand before handling important files.",
        privacyFacts: [
          "PDF and image files are processed in your browser and are not uploaded to a PDFin server.",
          "Your browser uses temporary memory while loading, previewing, and processing documents.",
          "Download and store processed files yourself.",
          "Very large PDFs depend on your browser memory and device performance.",
          "PDF passwords cannot be recovered by PDFin.",
          "Visual PDF initials are not electronic signatures or certificate-backed digital signatures.",
          "Unlocking password-protected PDFs is still in development.",
          "Language/theme preferences and recent file names may be stored in browser localStorage.",
        ],
        openTitle: "Open to study and self-host",
        openBody: "PDFin is built as a free PDF tool with browser-based processing. The source code is available on GitHub to study, use, and develop further.",
        contact: "Contact for self-hosting",
        note: "Need PDFin for an internal environment, self-hosting, or on-premise use? Contact us to discuss.",
      };
  const strings = PDFIN_T[lang];
  const trustKeys = ["free", "account", "local"];

  return (
    <main id="home-main" tabIndex={-1}>
      <section style={{ background: "var(--gradient-hero)", borderBottom: "1px solid var(--border-default)", padding: "48px clamp(16px, 5vw, 32px) 36px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "grid", gap: 22 }}>
          <div style={{ display: "grid", gap: 14, maxWidth: 700 }}>
            <span style={{ width: "fit-content", display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: "var(--radius-pill)", border: "1px solid var(--privacy-border)", background: "var(--privacy-bg)", color: "var(--privacy-fg)", font: "var(--type-caption)" }}>
              {factIcons.local}
              {t.eyebrow}
            </span>
            <h1 style={{ font: "var(--type-display)", letterSpacing: "var(--tracking-tight)", maxWidth: 680 }}>{t.h1}</h1>
            <p style={{ font: "var(--type-body)", color: "var(--text-body)", maxWidth: 620, margin: 0 }}>{t.sub}</p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="#tool-categories" style={{
              display: "inline-flex", minHeight: 44, alignItems: "center", justifyContent: "center", padding: "0 18px",
              borderRadius: "var(--radius-md)", background: "var(--action-primary)", color: "var(--color-accent-contrast)",
              font: "var(--weight-semibold) var(--text-base)/1 var(--font-sans)", textDecoration: "none",
            }}>{t.explore}</a>
            <a href="https://github.com/bicilique" target="_blank" rel="noreferrer" aria-label={t.githubLabel} style={{
              display: "inline-flex", minHeight: 44, alignItems: "center", justifyContent: "center", gap: 8, padding: "0 16px",
              borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", background: "var(--surface-card)",
              color: "var(--text-brand)", font: "var(--weight-semibold) var(--text-base)/1 var(--font-sans)", textDecoration: "none",
            }}>{t.github}{factIcons.external}</a>
          </div>
        </div>
      </section>

      <section aria-label={lang === "id" ? "Fakta kepercayaan" : "Trust facts"} style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "24px clamp(16px, 5vw, 32px) 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {t.trustFacts.map((fact, index) => (
            <span key={fact} style={{
              display: "inline-flex", alignItems: "center", gap: 8, minHeight: 38, padding: "0 12px",
              borderRadius: "var(--radius-pill)", border: "1px solid var(--border-default)", background: "var(--surface-card)",
              color: "var(--text-body)", font: "var(--type-label)",
            }}>
              {factIcons[trustKeys[index]]}
              {fact}
            </span>
          ))}
          <a href="#privacy-security" style={{ font: "var(--type-label)", color: "var(--text-link)", padding: "8px 2px" }}>{t.privacyLink}</a>
        </div>
      </section>

      <section id="tool-categories" style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "36px clamp(16px, 5vw, 32px) 32px" }}>
        <div style={{ display: "grid", gap: 30 }}>
          {toolCategories.map((category) => (
            <section key={category.id} aria-labelledby={`category-${category.id}`} style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "grid", gap: 4 }}>
                <h2 id={`category-${category.id}`} style={{ font: "var(--type-h2)" }}>{t.categories[category.id]}</h2>
                <p style={{ margin: 0, font: "var(--type-body-sm)", color: "var(--text-muted)", maxWidth: 680 }}>{t.categoryDesc[category.id]}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gridAutoRows: "1fr", gap: 16 }}>
                {category.tools.filter((toolId) => WORKSPACE_TOOL_IDS.includes(toolId)).map((toolId) => {
                  const isPrototype = PROTOTYPE_TOOL_IDS.has(toolId);
                  return (
                    <ToolTile
                      key={toolId}
                      href={isPrototype ? undefined : getToolHref(toolId)}
                      disabled={isPrototype}
                      icon={homeIcons[toolId] || homeIcons.merge}
                      title={strings.toolNames[toolId]}
                      description={strings.toolDesc[toolId]}
                      badge={isPrototype ? <Badge tone="warning">{t.inDevelopment}</Badge> : null}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section id="privacy-security" style={{ borderTop: "1px solid var(--border-default)", borderBottom: "1px solid var(--border-default)", background: "var(--surface-card)" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "36px clamp(16px, 5vw, 32px)", display: "grid", gap: 18 }}>
          <div style={{ display: "grid", gap: 6, maxWidth: 760 }}>
            <h2 style={{ font: "var(--type-h2)" }}>{t.privacyTitle}</h2>
            <p style={{ margin: 0, font: "var(--type-body)", color: "var(--text-body)" }}>{t.privacyIntro}</p>
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
            {t.privacyFacts.map((fact) => (
              <li key={fact} style={{
                display: "flex", gap: 9, alignItems: "flex-start", padding: 12,
                border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", background: "var(--surface-sunken)",
                color: "var(--text-body)", font: "var(--type-body-sm)",
              }}>
                <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: 3, marginTop: 7, flex: "0 0 auto", background: "var(--action-accent)" }}></span>
                {fact}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "40px clamp(16px, 5vw, 32px) 56px" }}>
        <div style={{ display: "grid", gap: 16, maxWidth: 760 }}>
          <h2 style={{ font: "var(--type-h2)" }}>{t.openTitle}</h2>
          <p style={{ margin: 0, font: "var(--type-body)", color: "var(--text-body)" }}>{t.openBody}</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="https://github.com/bicilique" target="_blank" rel="noreferrer" aria-label={t.githubLabel} style={{ display: "inline-flex", minHeight: 42, alignItems: "center", gap: 8, padding: "0 14px", borderRadius: "var(--radius-md)", background: "var(--surface-brand-subtle)", color: "var(--text-brand)", font: "var(--type-label)", textDecoration: "none" }}>{t.github}{factIcons.external}</a>
            <a href="mailto:afiffaizianur@gmail.com" style={{ display: "inline-flex", minHeight: 42, alignItems: "center", padding: "0 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", background: "var(--surface-card)", color: "var(--text-body)", font: "var(--type-label)", textDecoration: "none" }}>{t.contact}</a>
          </div>
          <p style={{ margin: 0, font: "var(--type-body-sm)", color: "var(--text-muted)" }}>{t.note}</p>
        </div>
      </section>
    </main>
  );
}
