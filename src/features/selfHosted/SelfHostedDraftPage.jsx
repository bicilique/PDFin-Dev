import { Icons } from "../../components/index.js";

export function SelfHostedDraftPage({ lang = "id" }) {
  const isId = lang === "id";
  const t = isId
    ? {
        badge: "Draft internal",
        title: "Pemrosesan PDF di infrastruktur Anda.",
        intro: "PDFin Self-hosted dirancang untuk menjalankan processing service dan API di server, private cloud, VPC, atau infrastruktur pelanggan. Halaman ini masih draft dan tidak ditampilkan di navigasi publik.",
        status: "Limited availability",
        statusBody: "Tersedia hanya untuk evaluasi dan assisted deployment setelah scope operasi, environment, resource, dan batas keamanan disepakati.",
        apiTitle: "API sebagai bagian dari Self-hosted",
        apiBody: "API tidak diposisikan sebagai PDFin Cloud API atau hosted processing. API tersedia sebagai bagian dari deployment Self-hosted di infrastruktur pelanggan.",
        dataTitle: "Data control",
        dataBody: "Dokumen diproses di lingkungan yang dikelola pelanggan dan tidak dikirim ke layanan pemrosesan PDFin untuk processing normal.",
        capabilityTitle: "Capability candidate",
        note: "Matrix ini bukan janji ketersediaan umum. Capability Self-hosted mengikuti versi deployment yang benar-benar dibangun dan diuji.",
      }
    : {
        badge: "Internal draft",
        title: "PDF processing in your infrastructure.",
        intro: "PDFin Self-hosted is designed to run a processing service and API on customer-managed servers, private cloud, VPC, or infrastructure. This page is still a draft and is not shown in public navigation.",
        status: "Limited availability",
        statusBody: "Available only for evaluation and assisted deployment after operation scope, environment, resources, and security boundaries are agreed.",
        apiTitle: "API as part of Self-hosted",
        apiBody: "The API is not positioned as PDFin Cloud API or hosted processing. It is part of a Self-hosted deployment in customer-managed infrastructure.",
        dataTitle: "Data control",
        dataBody: "Documents are processed in the customer-managed environment and are not sent to PDFin processing services for normal processing.",
        capabilityTitle: "Capability candidate",
        note: "This matrix is not a general availability promise. Self-hosted capability follows the deployment version that is actually built and tested.",
      };
  const rows = [
    ["Merge", "Candidate", "Stable candidate"],
    ["Split", "Candidate", "Stable candidate"],
    ["Watermark", "Candidate", "Beta candidate"],
    ["Protect", "Candidate", "Beta candidate"],
    ["Flatten", "Candidate", "Beta candidate"],
    ["Image to PDF", "Candidate", "Beta candidate"],
    ["OCR", "Heavy-workload candidate", "Experimental/Beta only after resource approval"],
  ];

  return (
    <main style={{ background: "var(--surface-page)" }}>
      <section style={{ padding: "52px clamp(16px, 5vw, 32px) 36px", background: "var(--gradient-hero)", borderBottom: "1px solid var(--border-default)" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", display: "grid", gap: 16 }}>
          <span style={{ width: "fit-content", display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: "var(--radius-pill)", border: "1px solid var(--border-default)", background: "var(--surface-card)", color: "var(--text-muted)", font: "var(--type-caption)" }}>
            {Icons.info(17)}
            {t.badge}
          </span>
          <h1 style={{ font: "var(--type-display)", maxWidth: 780 }}>{t.title}</h1>
          <p style={{ margin: 0, maxWidth: 760, font: "var(--type-body)", color: "var(--text-body)" }}>{t.intro}</p>
        </div>
      </section>
      <section style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "34px clamp(16px, 5vw, 32px)", display: "grid", gap: 16 }}>
        {[
          [t.status, t.statusBody],
          [t.apiTitle, t.apiBody],
          [t.dataTitle, t.dataBody],
        ].map(([title, body]) => (
          <article key={title} style={{ padding: 18, border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", background: "var(--surface-card)", display: "grid", gap: 8 }}>
            <h2 style={{ margin: 0, font: "var(--type-h3)" }}>{title}</h2>
            <p style={{ margin: 0, font: "var(--type-body-sm)", color: "var(--text-body)" }}>{body}</p>
          </article>
        ))}
        <article style={{ padding: 18, border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", background: "var(--surface-card)", display: "grid", gap: 12 }}>
          <h2 style={{ margin: 0, font: "var(--type-h3)" }}>{t.capabilityTitle}</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 580 }}>
              <thead>
                <tr>
                  {["Operation", "API availability", "Planning status"].map((head) => (
                    <th key={head} scope="col" style={{ textAlign: "left", padding: "10px 8px", borderBottom: "1px solid var(--border-default)", font: "var(--type-caption)", color: "var(--text-muted)" }}>{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell, index) => (
                      <td key={cell} style={{ padding: "10px 8px", borderBottom: "1px solid var(--border-default)", font: index === 0 ? "var(--type-label)" : "var(--type-caption)", color: "var(--text-body)" }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ margin: 0, font: "var(--type-caption)", color: "var(--text-muted)" }}>{t.note}</p>
        </article>
      </section>
    </main>
  );
}
