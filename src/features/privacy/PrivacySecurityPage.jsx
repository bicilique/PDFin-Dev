import { Icons } from "../../components/index.js";
import { getSelfHostedHref, getToolHref } from "../../app/toolRoutes.js";

function dataItems(lang) {
  return lang === "id"
    ? [
        ["Analytics events", "PDFin dapat mengirim event agregat seperti tool yang dibuka, jumlah file/halaman, status proses, dan klik unduh. Nama file, isi dokumen, password, dan teks OCR tidak dikirim."],
        ["Filename", "Dipakai di UI browser dan saran nama output. Tidak dikirim ke analytics PDFin."],
        ["Password", "Dipakai di memori saat alat password berjalan. Jangan kirim password lewat feedback."],
        ["OCR text", "Dipakai untuk membuat hasil PDF searchable. Tidak boleh masuk log atau feedback."],
        ["Document content", "Untuk Browser Tools yang mendukung pemrosesan lokal, konten dokumen diproses di browser."],
        ["Runtime assets", "Browser dapat mengunduh JavaScript, PDF.js worker, WASM, dan aset OCR saat dibutuhkan."],
        ["Feedback", "Feedback sebaiknya berisi tool, browser, ringkasan masalah, dan langkah reproduksi tanpa dokumen asli."],
      ]
    : [
        ["Analytics events", "PDFin may send aggregate events such as opened tool, file/page counts, process status, and download clicks. Filenames, document contents, passwords, and OCR text are not sent."],
        ["Filename", "Used in the browser UI and output filename suggestions. It is not sent to PDFin analytics."],
        ["Password", "Used in memory while password tools run. Do not send passwords in feedback."],
        ["OCR text", "Used to create searchable PDF output. It must not be included in logs or feedback."],
        ["Document content", "For Browser Tools that support local processing, document content is processed in the browser."],
        ["Runtime assets", "The browser may download JavaScript, the PDF.js worker, WASM, and OCR assets when needed."],
        ["Feedback", "Feedback should include the tool, browser, issue summary, and reproduction steps without original documents."],
      ];
}

function copy(lang) {
  return lang === "id"
    ? {
        eyebrow: "Privacy & Security",
        title: "Lokasi pemrosesan dokumen dibuat jelas.",
        intro: "PDFin membedakan alat browser dari layanan Self-hosted. Browser Tools berjalan di perangkat pengguna jika alat tersebut mendukung pemrosesan lokal. Self-hosted berjalan di infrastruktur yang Anda kelola.",
        browserTitle: "Browser Tools",
        browserBody: "Untuk alat browser yang mendukung pemrosesan lokal, dokumen diproses langsung di browser Anda dan tidak dikirim ke server pemrosesan PDFin. PDFin dapat mengirim analytics agregat tentang penggunaan alat tanpa nama file atau isi dokumen. Browser tetap dapat mengunduh runtime asset yang dibutuhkan untuk menjalankan alat.",
        selfHostedTitle: "Self-hosted",
        selfHostedBody: "PDFin Self-hosted menjalankan processing service dan API di server, private cloud, atau local network Anda. Dokumen dapat dikirim dari aplikasi internal ke API tersebut, tetapi tetap berada di lingkungan yang Anda kelola.",
        dataTitle: "Data yang perlu diperhatikan",
        feedbackTitle: "Kirim feedback tanpa data sensitif",
        feedbackBody: "Jangan lampirkan dokumen asli, password, API key, atau informasi rahasia. Jika file contoh diperlukan untuk debugging, gunakan file dummy atau file yang sudah disanitasi.",
        toolsCta: "Pilih alat PDF",
        selfHostedCta: "Pelajari Self-hosted",
        feedbackCta: "Kirim masukan",
      }
    : {
        eyebrow: "Privacy & Security",
        title: "Document processing location is explicit.",
        intro: "PDFin separates browser tools from the Self-hosted service. Browser Tools run on the user's device where local processing is supported. Self-hosted runs in infrastructure you manage.",
        browserTitle: "Browser Tools",
        browserBody: "For browser tools that support local processing, documents are processed directly in your browser and are not sent to PDFin processing servers. PDFin may send aggregate analytics about tool usage without filenames or document contents. The browser may still download runtime assets required to run the tool.",
        selfHostedTitle: "Self-hosted",
        selfHostedBody: "PDFin Self-hosted runs the processing service and API on your server, private cloud, or local network. Documents may move from internal apps to that API, while staying inside your managed environment.",
        dataTitle: "Data to handle carefully",
        feedbackTitle: "Send feedback without sensitive data",
        feedbackBody: "Do not attach original documents, passwords, API keys, or confidential information. If a sample is needed for debugging, use a dummy or sanitized file.",
        toolsCta: "Choose PDF tool",
        selfHostedCta: "Explore Self-hosted",
        feedbackCta: "Send feedback",
      };
}

function feedbackHref(lang) {
  const subject = encodeURIComponent("PDFin feedback");
  const body = encodeURIComponent(lang === "id"
    ? "Tool yang digunakan:\nBerhasil/gagal:\nBrowser dan perangkat:\nRingkasan masalah:\nLangkah reproduksi:\nIzin dihubungi kembali: ya/tidak\n\nJangan lampirkan dokumen asli, password, API key, atau informasi rahasia."
    : "Tool used:\nSucceeded/failed:\nBrowser and device:\nIssue summary:\nReproduction steps:\nPermission to be contacted: yes/no\n\nDo not attach original documents, passwords, API keys, or confidential information.");
  return `mailto:afiffaizianur@gmail.com?subject=${subject}&body=${body}`;
}

export function PrivacySecurityPage({ lang = "id" }) {
  const t = copy(lang);
  return (
    <main id="privacy-main" tabIndex={-1} style={{ background: "var(--surface-page)" }}>
      <section style={{ padding: "56px clamp(16px, 5vw, 32px) 36px", borderBottom: "1px solid var(--border-default)", background: "var(--gradient-hero)" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", display: "grid", gap: 18 }}>
          <span style={{ width: "fit-content", display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: "var(--radius-pill)", border: "1px solid var(--privacy-border)", background: "var(--privacy-bg)", color: "var(--privacy-fg)", font: "var(--type-caption)" }}>
            {Icons.privacy(17)}
            {t.eyebrow}
          </span>
          <h1 style={{ margin: 0, font: "var(--type-display)", maxWidth: 780 }}>{t.title}</h1>
          <p style={{ margin: 0, maxWidth: 780, font: "var(--type-body)", color: "var(--text-body)" }}>{t.intro}</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href={getToolHref("merge")} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 44, padding: "0 16px", borderRadius: "var(--radius-md)", background: "var(--action-primary)", color: "var(--color-accent-contrast)", font: "var(--type-label)", textDecoration: "none" }}>
              {t.toolsCta}
            </a>
            <a href={getSelfHostedHref()} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 44, padding: "0 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", background: "var(--surface-card)", color: "var(--text-brand)", font: "var(--type-label)", textDecoration: "none" }}>
              {t.selfHostedCta}
            </a>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "34px clamp(16px, 5vw, 32px)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        {[
          [t.browserTitle, t.browserBody, Icons.desktop(22)],
          [t.selfHostedTitle, t.selfHostedBody, Icons.server(22)],
        ].map(([title, body, icon]) => (
          <article key={title} style={{ padding: 20, border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", background: "var(--surface-card)", display: "grid", gap: 10, boxShadow: "var(--shadow-card)" }}>
            <span aria-hidden="true" style={{ color: "var(--text-brand)" }}>{icon}</span>
            <h2 style={{ margin: 0, font: "var(--type-h3)" }}>{title}</h2>
            <p style={{ margin: 0, font: "var(--type-body-sm)", color: "var(--text-body)" }}>{body}</p>
          </article>
        ))}
      </section>

      <section style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "0 clamp(16px, 5vw, 32px) 44px", display: "grid", gap: 18 }}>
        <h2 style={{ margin: 0, font: "var(--type-h2)" }}>{t.dataTitle}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
          {dataItems(lang).map(([label, body]) => (
            <article key={label} style={{ padding: 14, border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", background: "var(--surface-card)", display: "grid", gap: 6 }}>
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
