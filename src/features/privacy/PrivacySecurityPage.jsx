import { Icons } from "../../components/index.js";
import { getToolHref } from "../../app/toolRoutes.js";

const processingRows = [
  ["Merge PDF", "Browser", "No", "pdf-lib, PDF.js", "PDF.js worker", "Memory, object URL for download", "Static PDF.js assets", "PDF documents with very large page counts can use significant memory."],
  ["Split PDF", "Browser", "No", "pdf-lib, PDF.js", "PDF.js worker", "Memory, object URL for download", "Static PDF.js assets", "Encrypted or corrupted PDFs can fail to load."],
  ["Organize PDF", "Browser", "No", "pdf-lib, PDF.js, dnd-kit", "PDF.js worker", "Memory, undo stack", "Static PDF.js assets", "Original file is not modified; output is a new PDF."],
  ["Rotate PDF", "Browser", "No", "pdf-lib, PDF.js", "PDF.js worker", "Memory", "Static PDF.js assets", "Rotation is applied when the output PDF is generated."],
  ["Compress PDF", "Browser", "No", "pdf-lib, PDF.js canvas rendering", "PDF.js worker", "Canvas memory, object URL for download", "Static PDF.js assets", "Pages are rasterized; selectable text may be lost."],
  ["Watermark PDF", "Browser", "No", "pdf-lib", "PDF.js worker for preview", "Memory, optional image object URL", "Static PDF.js assets", "Image watermark object URLs are revoked when replaced/unmounted."],
  ["Protect PDF", "Browser", "No", "qpdf-wasm", "WASM runtime", "WASM MEMFS, memory", "Bundled qpdf WASM asset", "Password cannot be recovered by PDFin."],
  ["OCR PDF", "Browser", "No", "Tesseract.js, PDF.js, pdf-lib", "Tesseract worker, PDF.js worker", "Canvas memory, Tesseract cache, object URL for download", "Local OCR worker/core/language assets", "OCR is slow and can be inaccurate on blurry scans or handwriting."],
  ["PDF to Image", "Browser", "No", "PDF.js canvas rendering", "PDF.js worker", "Canvas memory, object URL for download", "Static PDF.js assets", "Large exports can use high memory."],
  ["Image to PDF", "Browser", "No", "pdf-lib", "None for processing", "Image bytes, image object URL", "None beyond app assets", "Input supports JPG/PNG only."],
  ["Metadata", "Browser", "No", "pdf-lib", "PDF.js worker for preview", "Memory", "Static PDF.js assets", "Only common metadata fields are exposed."],
  ["Flatten", "Browser", "No", "pdf-lib", "PDF.js worker for preview", "Memory", "Static PDF.js assets", "Generic annotation flattening is limited by browser library support."],
  ["Page Number", "Browser", "No", "pdf-lib", "PDF.js worker for preview", "Memory", "Static PDF.js assets", "Applies simple page labels only."],
  ["Paraf", "Browser", "No", "pdf-lib", "PDF.js worker for preview", "Image bytes, memory", "Static PDF.js assets", "Visual initials are not certificate-backed digital signatures."],
];

const dataFacts = [
  ["Filename", "Used in browser UI and output-name suggestions. Current Tahap 1 target is not storing recent filenames."],
  ["File size", "Used locally for validation, UI labels, and optional bucketed future analytics only."],
  ["Page count", "Read locally from PDF.js/pdf-lib for UI and processing decisions."],
  ["Password", "Used only in memory for Protect PDF processing. It must not be logged or sent."],
  ["OCR text", "Used to build the searchable text layer in the output PDF. It must not be logged or sent."],
  ["Document metadata", "Read and edited locally for the Metadata tool."],
  ["Browser information", "Not collected by the app today. A mailto feedback flow may include user-provided browser details."],
  ["Failure code", "No remote error monitoring is configured today. Future reporting must be sanitized."],
];

function copy(lang) {
  return lang === "id"
    ? {
        title: "Privasi & keamanan",
        eyebrow: "Faktual, bukan klaim berlebihan",
        intro: "PDFin Browser Tools dirancang untuk memproses dokumen di browser. Klaim di halaman ini mengikuti implementasi yang dapat diaudit dan membedakan pemrosesan browser dari rancangan PDFin Self-hosted.",
        browserTitle: "PDFin Browser Tools",
        browserBody: "Untuk alat yang telah diverifikasi, dokumen diproses langsung di browser Anda dan tidak dikirim ke server pemrosesan PDFin. Browser tetap mengunduh runtime asset seperti JavaScript, WASM, PDF.js worker, dan model bahasa OCR lokal.",
        selfHostedTitle: "PDFin Self-hosted",
        selfHostedBody: "PDFin Self-hosted dirancang untuk berjalan di infrastruktur pelanggan. Dokumen dapat dikirim dari aplikasi pelanggan ke API self-hosted melalui jaringan internal pelanggan, tetapi tidak dikirim ke layanan pemrosesan PDFin.",
        matrixTitle: "Matrix pemrosesan Browser Tools",
        dataTitle: "Data yang diproses",
        feedbackTitle: "Feedback pengguna awal",
        feedbackBody: "Jangan kirim dokumen asli, password, API key, atau informasi rahasia melalui email feedback. Jika file diperlukan untuk debugging, gunakan file dummy atau file yang sudah disanitasi setelah ada persetujuan eksplisit.",
        feedbackCta: "Kirim masukan",
        back: "Pilih alat PDF",
        columns: ["Tool", "Lokasi", "File diunggah", "Dependency", "Worker", "Storage", "Network tambahan", "Batasan"],
      }
    : {
        title: "Privacy & security",
        eyebrow: "Factual, not overclaimed",
        intro: "PDFin Browser Tools are designed to process documents in the browser. Claims on this page follow auditable implementation details and distinguish browser processing from the PDFin Self-hosted design.",
        browserTitle: "PDFin Browser Tools",
        browserBody: "For verified tools, documents are processed directly in your browser and are not sent to PDFin processing servers. The browser still downloads runtime assets such as JavaScript, WASM, the PDF.js worker, and local OCR language assets.",
        selfHostedTitle: "PDFin Self-hosted",
        selfHostedBody: "PDFin Self-hosted is designed to run in customer-managed infrastructure. Documents may be sent from a customer application to the self-hosted API over the customer's internal network, but not to PDFin processing services.",
        matrixTitle: "Browser Tools processing matrix",
        dataTitle: "Data handled",
        feedbackTitle: "Early-user feedback",
        feedbackBody: "Do not send original documents, passwords, API keys, or confidential information through feedback email. If a file is needed for debugging, use a dummy or sanitized file after explicit agreement.",
        feedbackCta: "Send feedback",
        back: "Choose PDF tool",
        columns: ["Tool", "Location", "File uploaded", "Dependency", "Worker", "Storage", "Extra network", "Limitation"],
      };
}

function feedbackHref(lang) {
  const subject = encodeURIComponent("PDFin early access feedback");
  const body = encodeURIComponent(lang === "id"
    ? "Tool yang digunakan:\nBerhasil/gagal:\nBrowser dan perangkat:\nRingkasan masalah:\nLangkah reproduksi:\nIzin dihubungi kembali: ya/tidak\n\nJangan lampirkan dokumen asli, password, API key, atau informasi rahasia."
    : "Tool used:\nSucceeded/failed:\nBrowser and device:\nIssue summary:\nReproduction steps:\nPermission to be contacted: yes/no\n\nDo not attach original documents, passwords, API keys, or confidential information.");
  return `mailto:afiffaizianur@gmail.com?subject=${subject}&body=${body}`;
}

export function PrivacySecurityPage({ lang = "id" }) {
  const t = copy(lang);
  return (
    <main id="privacy-main" tabIndex={-1} style={{ background: "var(--surface-page)" }}>
      <section style={{ padding: "48px clamp(16px, 5vw, 32px) 30px", borderBottom: "1px solid var(--border-default)", background: "var(--gradient-hero)" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", display: "grid", gap: 16 }}>
          <span style={{ width: "fit-content", display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: "var(--radius-pill)", border: "1px solid var(--privacy-border)", background: "var(--privacy-bg)", color: "var(--privacy-fg)", font: "var(--type-caption)" }}>
            {Icons.privacy(17)}
            {t.eyebrow}
          </span>
          <h1 style={{ font: "var(--type-display)", maxWidth: 780 }}>{t.title}</h1>
          <p style={{ margin: 0, maxWidth: 760, font: "var(--type-body)", color: "var(--text-body)" }}>{t.intro}</p>
          <a href={getToolHref("merge")} style={{ width: "fit-content", display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 44, padding: "0 16px", borderRadius: "var(--radius-md)", background: "var(--action-primary)", color: "var(--color-accent-contrast)", font: "var(--type-label)", textDecoration: "none" }}>
            {t.back}
          </a>
        </div>
      </section>

      <section style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "34px clamp(16px, 5vw, 32px)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        {[
          [t.browserTitle, t.browserBody],
          [t.selfHostedTitle, t.selfHostedBody],
        ].map(([title, body]) => (
          <article key={title} style={{ padding: 18, border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", background: "var(--surface-card)", display: "grid", gap: 8 }}>
            <h2 style={{ margin: 0, font: "var(--type-h3)" }}>{title}</h2>
            <p style={{ margin: 0, font: "var(--type-body-sm)", color: "var(--text-body)" }}>{body}</p>
          </article>
        ))}
      </section>

      <section style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "0 clamp(16px, 5vw, 32px) 36px", display: "grid", gap: 16 }}>
        <h2 style={{ margin: 0, font: "var(--type-h2)" }}>{t.matrixTitle}</h2>
        <div style={{ overflowX: "auto", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", background: "var(--surface-card)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}>
            <thead>
              <tr>
                {t.columns.map((column) => (
                  <th key={column} scope="col" style={{ padding: "12px 10px", textAlign: "left", borderBottom: "1px solid var(--border-default)", font: "var(--type-caption)", color: "var(--text-muted)", background: "var(--surface-sunken)" }}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {processingRows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, index) => (
                    <td key={`${row[0]}-${index}`} style={{ padding: "12px 10px", verticalAlign: "top", borderBottom: "1px solid var(--border-default)", font: index === 0 ? "var(--type-label)" : "var(--type-caption)", color: index === 0 ? "var(--text-heading)" : "var(--text-body)" }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "0 clamp(16px, 5vw, 32px) 44px", display: "grid", gap: 18 }}>
        <h2 style={{ margin: 0, font: "var(--type-h2)" }}>{t.dataTitle}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
          {dataFacts.map(([label, body]) => (
            <article key={label} style={{ padding: 14, border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", background: "var(--surface-card)", display: "grid", gap: 5 }}>
              <h3 style={{ margin: 0, font: "var(--type-label)", color: "var(--text-heading)" }}>{label}</h3>
              <p style={{ margin: 0, font: "var(--type-caption)", color: "var(--text-body)" }}>{body}</p>
            </article>
          ))}
        </div>
        <article style={{ padding: 18, border: "1px solid var(--privacy-border)", borderRadius: "var(--radius-md)", background: "var(--privacy-bg)", color: "var(--text-body)", display: "grid", gap: 10 }}>
          <h2 style={{ margin: 0, font: "var(--type-h3)" }}>{t.feedbackTitle}</h2>
          <p style={{ margin: 0, font: "var(--type-body-sm)" }}>{t.feedbackBody}</p>
          <a href={feedbackHref(lang)} style={{ width: "fit-content", display: "inline-flex", alignItems: "center", minHeight: 42, padding: "0 14px", borderRadius: "var(--radius-md)", background: "var(--action-primary)", color: "var(--color-accent-contrast)", font: "var(--type-label)", textDecoration: "none" }}>{t.feedbackCta}</a>
        </article>
      </section>
    </main>
  );
}
