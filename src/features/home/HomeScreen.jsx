import { Badge, Icons, ToolTile, toolIcon } from "../../components/index.js";
import { getPrivacyHref, getSelfHostedHref, getToolHref, PROTOTYPE_TOOL_IDS, WORKSPACE_TOOL_IDS } from "../../app/toolRoutes.js";
import { PDFIN_T } from "../workspace/i18n.js";

const toolCategories = [
  { id: "pages", tools: ["merge", "split", "organize", "rotate", "pagenum"] },
  { id: "conversion", tools: ["compress", "img2pdf", "pdf2img", "md2pdf", "ocr"] },
  { id: "security", tools: ["protect", "watermark", "metadata", "sign", "flatten", "unlock"] },
];

const factIcons = {
  account: Icons.userCheck(18),
  local: Icons.desktop(18),
  selfHosted: Icons.server(18),
};

function feedbackHref(lang) {
  const subject = encodeURIComponent("PDFin feedback");
  const body = encodeURIComponent(lang === "id"
    ? "Tool yang digunakan:\nBerhasil/gagal:\nBrowser dan perangkat:\nRingkasan masalah:\nLangkah reproduksi:\nIzin dihubungi kembali: ya/tidak\n\nJangan lampirkan dokumen asli, password, API key, atau informasi rahasia."
    : "Tool used:\nSucceeded/failed:\nBrowser and device:\nIssue summary:\nReproduction steps:\nPermission to be contacted: yes/no\n\nDo not attach original documents, passwords, API keys, or confidential information.");
  return `mailto:afiffaizianur@gmail.com?subject=${subject}&body=${body}`;
}

export function HomeScreen({ lang, onOpenWorkspace }) {
  const t = lang === "id"
    ? {
        eyebrow: "PDFin Browser Tools",
        h1: "Kelola PDF langsung di browser.",
        sub: "Gunakan alat PDF tanpa membuat akun. Untuk alat yang mendukung pemrosesan lokal, dokumen diproses di perangkat Anda dan tidak dikirim ke server pemrosesan PDFin.",
        explore: "Pilih alat PDF",
        feedback: "Kirim masukan",
        trustFacts: ["Tanpa akun untuk fungsi dasar", "Processing location dijelaskan per tool", "Self-hosted API untuk local network"],
        privacyLink: "Baca Privacy & Security",
        selfHostedTitle: "Memerlukan API untuk aplikasi internal?",
        selfHostedBody: "PDFin Self-hosted menjalankan pemrosesan PDF di infrastruktur Anda dan menyediakan API untuk workflow internal, automation, dan integrasi aplikasi.",
        selfHostedStatus: "Dijalankan di local network",
        selfHostedCta: "Pelajari Self-hosted",
        categories: {
          pages: "Kelola halaman",
          conversion: "Konversi dan optimasi",
          security: "Keamanan dan informasi",
        },
        categoryDesc: {
          pages: "Gabungkan, pisahkan, susun, putar, dan beri nomor halaman PDF.",
          conversion: "Kurangi ukuran, ubah format, atau buat PDF hasil pindaian dapat dicari.",
          security: "Tambahkan password, watermark, paraf visual, metadata, dan flatten sesuai dukungan alat.",
        },
        inDevelopment: "Dalam pengembangan",
        privacyTitle: "Batasan yang perlu diketahui",
        privacyFacts: [
          "Browser mengunduh JavaScript, PDF.js worker, WASM, dan OCR language assets saat diperlukan.",
          "Mengunduh runtime asset bukan berarti dokumen Anda diunggah.",
          "Dokumen besar bergantung pada memori dan performa perangkat/browser.",
          "Password PDF dan hasil OCR tidak boleh dikirim melalui feedback.",
          "Paraf visual PDF bukan tanda tangan elektronik atau tanda tangan digital berbasis sertifikat.",
          "Unlock PDF masih dalam pengembangan dan tidak ditampilkan sebagai fitur final.",
          "Preferensi bahasa/tema dapat tersimpan di localStorage browser; recent filename tidak disimpan.",
        ],
      }
    : {
        eyebrow: "PDFin Browser Tools",
        h1: "Manage PDFs directly in your browser.",
        sub: "Use PDF tools without creating an account. For tools that support local processing, documents are processed on your device and are not sent to PDFin processing servers.",
        explore: "Choose PDF tool",
        feedback: "Send feedback",
        trustFacts: ["No account for basic tools", "Processing location explained per tool", "Self-hosted API for local networks"],
        privacyLink: "Read Privacy & Security",
        selfHostedTitle: "Need an API for internal apps?",
        selfHostedBody: "PDFin Self-hosted runs PDF processing in your infrastructure and provides an API for internal workflows, automation, and application integration.",
        selfHostedStatus: "Runs on your local network",
        selfHostedCta: "Explore Self-hosted",
        categories: {
          pages: "Manage pages",
          conversion: "Conversion and optimization",
          security: "Security and information",
        },
        categoryDesc: {
          pages: "Merge, split, organize, rotate, and number PDF pages.",
          conversion: "Reduce size, convert formats, or make scanned PDFs searchable.",
          security: "Add passwords, watermarks, visual initials, metadata, and flattening where supported.",
        },
        inDevelopment: "In development",
        privacyTitle: "Known limits",
        privacyFacts: [
          "The browser downloads JavaScript, the PDF.js worker, WASM, and OCR language assets when needed.",
          "Downloading runtime assets does not mean your document is uploaded.",
          "Large documents depend on browser memory and device performance.",
          "PDF passwords and OCR results must not be sent through feedback.",
          "Visual PDF initials are not electronic signatures or certificate-backed digital signatures.",
          "Unlock PDF is still in development and is not shown as a final feature.",
          "Language/theme preferences may be stored in browser localStorage; recent filenames are not stored.",
        ],
      };
  const strings = PDFIN_T[lang];
  const trustKeys = ["account", "local", "selfHosted"];

  return (
    <main id="home-main" tabIndex={-1}>
      <section className="home-hero" style={{ background: "var(--gradient-hero)", borderBottom: "1px solid var(--border-default)", padding: "48px clamp(16px, 5vw, 32px) 36px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gap: 22 }}>
          <div style={{ display: "grid", gap: 14, maxWidth: 740 }}>
            <span style={{ width: "fit-content", display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: "var(--radius-pill)", border: "1px solid var(--privacy-border)", background: "var(--privacy-bg)", color: "var(--privacy-fg)", font: "var(--type-caption)" }}>
              {Icons.privacy(18)}
              {t.eyebrow}
            </span>
            <h1 style={{ font: "var(--type-display)", letterSpacing: "var(--tracking-tight)", maxWidth: 720 }}>{t.h1}</h1>
            <p style={{ font: "var(--type-body)", color: "var(--text-body)", maxWidth: 680, margin: 0 }}>{t.sub}</p>
          </div>
          <div className="home-hero__actions" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="#tool-categories" style={{
              display: "inline-flex", minHeight: 44, alignItems: "center", justifyContent: "center", padding: "0 18px",
              borderRadius: "var(--radius-md)", background: "var(--action-primary)", color: "var(--color-accent-contrast)",
              font: "var(--weight-semibold) var(--text-base)/1 var(--font-sans)", textDecoration: "none",
            }}>{t.explore}</a>
            <a href={feedbackHref(lang)} style={{
              display: "inline-flex", minHeight: 44, alignItems: "center", justifyContent: "center", padding: "0 16px",
              borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", background: "var(--surface-card)",
              color: "var(--text-brand)", font: "var(--weight-semibold) var(--text-base)/1 var(--font-sans)", textDecoration: "none",
            }}>{t.feedback}</a>
          </div>
        </div>
      </section>

      <section className="home-trust" aria-label={lang === "id" ? "Fakta produk" : "Product facts"} style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "24px clamp(16px, 5vw, 32px) 0" }}>
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
          <a href={getPrivacyHref()} style={{ font: "var(--type-label)", color: "var(--text-link)", padding: "8px 2px" }}>{t.privacyLink}</a>
        </div>
      </section>

      <section id="tool-categories" className="home-tools" style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "36px clamp(16px, 5vw, 32px) 32px" }}>
        <div style={{ display: "grid", gap: 30 }}>
          {toolCategories.map((category) => (
            <section key={category.id} aria-labelledby={`category-${category.id}`} style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "grid", gap: 4 }}>
                <h2 id={`category-${category.id}`} style={{ font: "var(--type-h2)" }}>{t.categories[category.id]}</h2>
                <p style={{ margin: 0, font: "var(--type-body-sm)", color: "var(--text-muted)", maxWidth: 680 }}>{t.categoryDesc[category.id]}</p>
              </div>
              <div className="home-tool-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gridAutoRows: "1fr", gap: 16 }}>
                {category.tools.filter((toolId) => WORKSPACE_TOOL_IDS.includes(toolId)).map((toolId) => {
                  const isPrototype = PROTOTYPE_TOOL_IDS.has(toolId);
                  return (
                    <ToolTile
                      key={toolId}
                      href={isPrototype ? undefined : getToolHref(toolId)}
                      onClick={isPrototype || !onOpenWorkspace ? undefined : (event) => {
                        event.preventDefault();
                        onOpenWorkspace(toolId);
                      }}
                      disabled={isPrototype}
                      icon={toolIcon(toolId, 24)}
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

      <section style={{ borderTop: "1px solid var(--border-default)", background: "var(--surface-page)" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "10px clamp(16px, 5vw, 32px) 36px" }}>
          <article style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 18,
            padding: 20, border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)",
            background: "var(--surface-card)", boxShadow: "var(--shadow-card)",
          }}>
            <div style={{ display: "grid", gap: 8 }}>
              <span style={{ width: "fit-content", display: "inline-flex", alignItems: "center", gap: 8, minHeight: 30, padding: "0 10px", borderRadius: "var(--radius-pill)", border: "1px solid var(--border-default)", background: "var(--surface-sunken)", color: "var(--text-muted)", font: "var(--type-caption)" }}>
                {Icons.server(16)}
                {t.selfHostedStatus}
              </span>
              <h2 style={{ margin: 0, font: "var(--type-h3)" }}>{t.selfHostedTitle}</h2>
              <p style={{ margin: 0, maxWidth: 760, font: "var(--type-body-sm)", color: "var(--text-body)" }}>{t.selfHostedBody}</p>
            </div>
            <a href={getSelfHostedHref()} style={{
              display: "inline-flex", minHeight: 44, alignItems: "center", justifyContent: "center", padding: "0 16px",
              borderRadius: "var(--radius-md)", background: "var(--action-primary)", color: "var(--color-accent-contrast)",
              font: "var(--type-label)", textDecoration: "none", whiteSpace: "nowrap",
            }}>{t.selfHostedCta}</a>
          </article>
        </div>
      </section>

      <section style={{ borderTop: "1px solid var(--border-default)", background: "var(--surface-card)" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "36px clamp(16px, 5vw, 32px)", display: "grid", gap: 18 }}>
          <h2 style={{ margin: 0, font: "var(--type-h2)" }}>{t.privacyTitle}</h2>
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
    </main>
  );
}
