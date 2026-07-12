import { Icons } from "../../components/index.js";
import { SelfHostedFlowDiagram } from "./SelfHostedFlowDiagram.jsx";

const capabilities = [
  ["Merge PDF", "API candidate", "Async job", "Candidate"],
  ["Split PDF", "API candidate", "Async job", "Candidate"],
  ["Watermark PDF", "API candidate", "Async job", "Candidate"],
  ["Protect PDF", "API candidate", "Async job", "Candidate"],
  ["OCR PDF", "Resource-heavy candidate", "Async job only", "Requires sizing"],
];

function inquiryHref(lang) {
  const subject = encodeURIComponent("PDFin Self-hosted deployment discussion");
  const body = encodeURIComponent(lang === "id"
    ? "Nama:\nEmail kerja:\nOrganisasi:\nUse case:\nOperasi PDF yang dibutuhkan:\nPerkiraan volume:\nUkuran file tipikal:\nDeployment environment:\nKebutuhan local network/private cloud:\nKebutuhan OCR:\nTimeline:\n\nJangan lampirkan dokumen sensitif, API key, password, atau informasi rahasia."
    : "Name:\nWork email:\nOrganization:\nUse case:\nRequired PDF operations:\nEstimated volume:\nTypical file size:\nDeployment environment:\nLocal network/private cloud requirements:\nOCR requirements:\nTimeline:\n\nDo not attach sensitive documents, API keys, passwords, or confidential information.");
  return `mailto:afiffaizianur@gmail.com?subject=${subject}&body=${body}`;
}

function copy(lang) {
  return lang === "id"
    ? {
        badge: "Self-hosted API",
        title: "Pemrosesan PDF di local network Anda.",
        intro: "Jalankan PDFin Self-hosted di server, private cloud, atau jaringan internal Anda, lalu integrasikan pemrosesan PDF melalui API. Dokumen diproses di lingkungan yang Anda kelola.",
        primaryCta: "Diskusikan deployment",
        secondaryCta: "Lihat cara kerja",
        status: "Dijalankan di infrastruktur pelanggan",
        statusBody: "API tersedia sebagai bagian dari PDFin Self-hosted. Ini bukan PDFin Cloud API dan tidak menggunakan hosted processing milik PDFin.",
        howTitle: "Cara kerja",
        howBody: "Aplikasi Anda mengirim dokumen ke PDFin Self-hosted API melalui jaringan internal. Dokumen diproses di infrastruktur Anda dan hasilnya dikembalikan ke aplikasi.",
        flow: {
          ariaLabel: "Alur pemrosesan PDFin Self-hosted di infrastruktur Anda",
          srSummary: "Aplikasi internal mengirim PDF dan opsi melalui jaringan internal ke API PDFin Self-hosted. API mengelola job dan meneruskannya ke mesin pemrosesan. Mesin pemrosesan membaca input dan menulis hasil melalui penyimpanan sementara yang dikelola pelanggan. Status dan hasil kemudian dikembalikan ke aplikasi internal.",
          boundary: "Infrastruktur Anda",
          application: "Aplikasi internal",
          applicationDetail: "Workflow atau sistem Anda",
          request: "PDF + opsi melalui HTTPS",
          requestNote: "Melalui jaringan internal Anda",
          product: "PDFin Self-hosted",
          api: "API",
          apiDetail: "Menerima request dan mengelola job",
          toEngine: "Buat dan jalankan job",
          engine: "Mesin pemrosesan",
          engineDetail: "Memproses job PDF",
          storageLink: "Baca input / tulis hasil",
          storage: "Penyimpanan sementara",
          storageDetail: "Input dan hasil disimpan sesuai konfigurasi",
          response: "Status job dan hasil",
          responseStrip: "Status job dan hasil dikembalikan ke aplikasi internal",
          dataNote: "Pemrosesan dan penyimpanan sementara berlangsung di infrastruktur yang Anda kelola.",
          caption: "Alur request, pemrosesan, dan pengembalian hasil dalam deployment PDFin Self-hosted.",
        },
        apiTitle: "API untuk workflow internal",
        apiBody: "Self-hosted dirancang untuk automation, batch processing, dan integrasi system-to-system. Capability API mengikuti operasi yang benar-benar dibangun, diuji, dan disepakati dalam scope deployment.",
        deploymentTitle: "Deployment",
        deploymentBody: "Baseline deployment menggunakan container di server atau private cloud pelanggan, dengan konfigurasi environment, health check, temporary volume, resource limit, dan reverse proxy/TLS yang dikelola pelanggan.",
        dataTitle: "Data control",
        dataBody: "Dokumen tidak dikirim ke layanan pemrosesan PDFin untuk processing normal. Log dan diagnostics harus disanitasi agar tidak memuat filename, password, OCR text, atau konten dokumen.",
        capabilitiesTitle: "Capability awal",
        capabilityNote: "Matrix ini adalah scope kandidat untuk evaluasi Self-hosted. Jangan menganggap semua Browser Tools otomatis tersedia melalui API.",
        responsibilityTitle: "Shared responsibility",
        pdfinResp: "PDFin: software package, secure defaults, processing engine, release notes, vulnerability fixes, dan deployment documentation.",
        customerResp: "Pelanggan: server, network, TLS, firewall, secret management, storage, retention policy, monitoring, dan compliance requirement.",
        faqTitle: "FAQ",
        faq: [
          ["Apakah ini cloud API?", "Tidak. API berjalan sebagai bagian dari deployment Self-hosted di infrastruktur Anda."],
          ["Apakah bisa berjalan di local network?", "Ya, target utamanya adalah server, private cloud, VPC, atau jaringan internal yang dikelola pelanggan."],
          ["Apakah dokumen dikirim ke server PDFin?", "Tidak untuk processing normal. Dokumen diproses oleh service yang berjalan di lingkungan Anda."],
          ["Apakah semua Browser Tools tersedia via API?", "Tidak selalu. Ketersediaan operasi mengikuti capability matrix dan versi deployment."],
          ["Apakah ada pricing publik?", "Belum. Scope deployment dievaluasi berdasarkan operasi, kapasitas, environment, dan kebutuhan support."],
        ],
      }
    : {
        badge: "Self-hosted API",
        title: "PDF processing on your local network.",
        intro: "Run PDFin Self-hosted on your server, private cloud, or internal network, then integrate PDF processing through an API. Documents are processed in the environment you manage.",
        primaryCta: "Discuss deployment",
        secondaryCta: "See how it works",
        status: "Runs in customer-managed infrastructure",
        statusBody: "The API is part of PDFin Self-hosted. It is not a PDFin Cloud API and does not use PDFin-hosted processing.",
        howTitle: "How it works",
        howBody: "Your application sends documents to the PDFin Self-hosted API over your internal network. Documents are processed in your infrastructure and results are returned to the application.",
        flow: {
          ariaLabel: "PDFin Self-hosted processing flow in your infrastructure",
          srSummary: "The internal application sends the PDF and options over the internal network to the PDFin Self-hosted API. The API manages the job and passes it to the processing engine. The processing engine reads input and writes output through customer-managed temporary storage. Job status and the result are then returned to the internal application.",
          boundary: "Your infrastructure",
          application: "Internal application",
          applicationDetail: "Your workflow or system",
          request: "PDF + options over HTTPS",
          requestNote: "Over your internal network",
          product: "PDFin Self-hosted",
          api: "API",
          apiDetail: "Receives requests and manages jobs",
          toEngine: "Create and run job",
          engine: "Processing engine",
          engineDetail: "Processes PDF jobs",
          storageLink: "Read input / write output",
          storage: "Temporary storage",
          storageDetail: "Inputs and outputs are retained according to configuration",
          response: "Job status and result",
          responseStrip: "Job status and result are returned to the internal application",
          dataNote: "Processing and temporary storage remain within infrastructure you manage.",
          caption: "Request, processing, and result flow within a PDFin Self-hosted deployment.",
        },
        apiTitle: "API for internal workflows",
        apiBody: "Self-hosted is designed for automation, batch processing, and system-to-system integration. API capability follows operations that are built, tested, and agreed within the deployment scope.",
        deploymentTitle: "Deployment",
        deploymentBody: "The baseline deployment uses a container on customer-managed servers or private cloud, with environment configuration, health checks, temporary volumes, resource limits, and customer-managed reverse proxy/TLS.",
        dataTitle: "Data control",
        dataBody: "Documents are not sent to PDFin processing services for normal processing. Logs and diagnostics must be sanitized so they do not contain filenames, passwords, OCR text, or document content.",
        capabilitiesTitle: "Initial capability",
        capabilityNote: "This matrix is a candidate scope for Self-hosted evaluation. Do not assume every Browser Tool is automatically available through the API.",
        responsibilityTitle: "Shared responsibility",
        pdfinResp: "PDFin: software package, secure defaults, processing engine, release notes, vulnerability fixes, and deployment documentation.",
        customerResp: "Customer: server, network, TLS, firewall, secret management, storage, retention policy, monitoring, and compliance requirements.",
        faqTitle: "FAQ",
        faq: [
          ["Is this a cloud API?", "No. The API runs as part of a Self-hosted deployment in your infrastructure."],
          ["Can it run on a local network?", "Yes. The target environment is a customer-managed server, private cloud, VPC, or internal network."],
          ["Are documents sent to PDFin servers?", "Not for normal processing. Documents are processed by the service running in your environment."],
          ["Are all Browser Tools available through the API?", "Not always. Operation availability follows the capability matrix and deployment version."],
          ["Is public pricing available?", "Not yet. Deployment scope is evaluated based on operations, capacity, environment, and support needs."],
        ],
      };
}

export function SelfHostedPage({ lang = "id" }) {
  const t = copy(lang);

  return (
    <main id="self-hosted-main" tabIndex={-1} style={{ background: "var(--surface-page)" }}>
      <section style={{ padding: "64px clamp(16px, 5vw, 32px) 40px", background: "linear-gradient(135deg, var(--surface-page) 0%, var(--surface-sunken) 100%)", borderBottom: "1px solid var(--border-default)" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 28, alignItems: "center" }}>
          <div style={{ display: "grid", gap: 18 }}>
            <span style={{ width: "fit-content", display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: "var(--radius-pill)", border: "1px solid var(--border-default)", background: "var(--surface-card)", color: "var(--text-brand)", font: "var(--type-caption)" }}>
              {Icons.server(17)}
              {t.badge}
            </span>
            <h1 style={{ margin: 0, font: "var(--type-display)", maxWidth: 760 }}>{t.title}</h1>
            <p style={{ margin: 0, maxWidth: 720, font: "var(--type-body)", color: "var(--text-body)" }}>{t.intro}</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href={inquiryHref(lang)} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 46, padding: "0 18px", borderRadius: "var(--radius-md)", background: "var(--action-primary)", color: "var(--color-accent-contrast)", font: "var(--type-label)", textDecoration: "none" }}>{t.primaryCta}</a>
              <a href="#how-self-hosted-works" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 46, padding: "0 18px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", background: "var(--surface-card)", color: "var(--text-brand)", font: "var(--type-label)", textDecoration: "none" }}>{t.secondaryCta}</a>
            </div>
          </div>
          <aside style={{ padding: 20, border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", background: "var(--surface-card)", boxShadow: "var(--shadow-card)", display: "grid", gap: 10 }}>
            <span style={{ color: "var(--text-brand)" }}>{Icons.privacy(24)}</span>
            <h2 style={{ margin: 0, font: "var(--type-h3)" }}>{t.status}</h2>
            <p style={{ margin: 0, font: "var(--type-body-sm)", color: "var(--text-body)" }}>{t.statusBody}</p>
          </aside>
        </div>
      </section>

      <section id="how-self-hosted-works" style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "38px clamp(16px, 5vw, 32px)", display: "grid", gap: 18 }}>
        <div style={{ display: "grid", gap: 8, maxWidth: 760 }}>
          <h2 style={{ margin: 0, font: "var(--type-h2)" }}>{t.howTitle}</h2>
          <p style={{ margin: 0, font: "var(--type-body-sm)", color: "var(--text-body)" }}>{t.howBody}</p>
        </div>
        <SelfHostedFlowDiagram flow={t.flow} />
      </section>

      <section style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "0 clamp(16px, 5vw, 32px) 38px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        {[
          [t.apiTitle, t.apiBody, Icons.settings(22)],
          [t.deploymentTitle, t.deploymentBody, Icons.server(22)],
          [t.dataTitle, t.dataBody, Icons.privacy(22)],
        ].map(([title, body, icon]) => (
          <article key={title} style={{ padding: 20, border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", background: "var(--surface-card)", display: "grid", gap: 10 }}>
            <span style={{ color: "var(--text-brand)" }}>{icon}</span>
            <h2 style={{ margin: 0, font: "var(--type-h3)" }}>{title}</h2>
            <p style={{ margin: 0, font: "var(--type-body-sm)", color: "var(--text-body)" }}>{body}</p>
          </article>
        ))}
      </section>

      <section style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "0 clamp(16px, 5vw, 32px) 38px", display: "grid", gap: 16 }}>
        <h2 style={{ margin: 0, font: "var(--type-h2)" }}>{t.capabilitiesTitle}</h2>
        <div style={{ overflowX: "auto", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", background: "var(--surface-card)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}>
            <thead>
              <tr>
                {["Operation", "API availability", "Processing mode", "Status"].map((head) => (
                  <th key={head} scope="col" style={{ textAlign: "left", padding: "12px 10px", borderBottom: "1px solid var(--border-default)", font: "var(--type-caption)", color: "var(--text-muted)", background: "var(--surface-sunken)" }}>{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {capabilities.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, index) => (
                    <td key={`${row[0]}-${cell}`} style={{ padding: "12px 10px", borderBottom: "1px solid var(--border-default)", font: index === 0 ? "var(--type-label)" : "var(--type-caption)", color: index === 0 ? "var(--text-heading)" : "var(--text-body)" }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ margin: 0, font: "var(--type-caption)", color: "var(--text-muted)" }}>{t.capabilityNote}</p>
      </section>

      <section style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "0 clamp(16px, 5vw, 32px) 38px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        <article style={{ padding: 20, border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", background: "var(--surface-card)", display: "grid", gap: 10 }}>
          <h2 style={{ margin: 0, font: "var(--type-h3)" }}>{t.responsibilityTitle}</h2>
          <p style={{ margin: 0, font: "var(--type-body-sm)", color: "var(--text-body)" }}>{t.pdfinResp}</p>
          <p style={{ margin: 0, font: "var(--type-body-sm)", color: "var(--text-body)" }}>{t.customerResp}</p>
        </article>
        <article style={{ padding: 20, border: "1px solid var(--privacy-border)", borderRadius: "var(--radius-md)", background: "var(--privacy-bg)", display: "grid", gap: 10 }}>
          <h2 style={{ margin: 0, font: "var(--type-h3)" }}>{t.primaryCta}</h2>
          <p style={{ margin: 0, font: "var(--type-body-sm)", color: "var(--text-body)" }}>{lang === "id" ? "Jelaskan use case, operasi yang dibutuhkan, volume, ukuran file, dan environment. Jangan kirim dokumen atau informasi rahasia." : "Share the use case, required operations, volume, file size, and environment. Do not send documents or confidential information."}</p>
          <a href={inquiryHref(lang)} style={{ width: "fit-content", display: "inline-flex", alignItems: "center", minHeight: 42, padding: "0 14px", borderRadius: "var(--radius-md)", background: "var(--action-primary)", color: "var(--color-accent-contrast)", font: "var(--type-label)", textDecoration: "none" }}>{t.primaryCta}</a>
        </article>
      </section>

      <section style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "0 clamp(16px, 5vw, 32px) 48px", display: "grid", gap: 14 }}>
        <h2 style={{ margin: 0, font: "var(--type-h2)" }}>{t.faqTitle}</h2>
        <div style={{ display: "grid", gap: 10 }}>
          {t.faq.map(([question, answer]) => (
            <details key={question} style={{ padding: 16, border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", background: "var(--surface-card)" }}>
              <summary style={{ cursor: "pointer", font: "var(--type-label)", color: "var(--text-heading)" }}>{question}</summary>
              <p style={{ margin: "10px 0 0", font: "var(--type-body-sm)", color: "var(--text-body)" }}>{answer}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
