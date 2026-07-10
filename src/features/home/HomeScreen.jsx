import React from "react";
import { Badge, PrivacyPill, ToolTile } from "../../components/index.js";
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

export function HomeScreen({ lang }) {
  const t = lang === "id"
    ? { h1: "Alat PDF mudah, cepat, dan privat.", sub: "File tetap di perangkat Anda. Semua alat inti memproses file langsung di browser — tanpa unggah, tanpa akun.", prototype: "Prototipe" }
    : { h1: "PDF tools that keep your files on your device.", sub: "All core tools process files directly in your browser — no upload, no account.", prototype: "Prototype" };
  const strings = PDFIN_T[lang];

  return (
    <main id="home-main" tabIndex={-1}>
      <section style={{ background: "var(--gradient-brand-soft)", borderBottom: "1px solid var(--border-default)", padding: "56px 32px 48px", textAlign: "center" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <PrivacyPill lang={lang} />
          <h1 style={{ font: "var(--type-display)", letterSpacing: "var(--tracking-tight)" }}>{t.h1}</h1>
          <p style={{ font: "var(--type-body)", color: "var(--text-muted)", maxWidth: 560, margin: 0 }}>{t.sub}</p>
        </div>
      </section>
      <section style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "40px 32px 64px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gridAutoRows: "1fr", gap: 16 }}>
          {WORKSPACE_TOOL_IDS.map((toolId) => {
            const isPrototype = PROTOTYPE_TOOL_IDS.has(toolId);
            return (
              <ToolTile
                key={toolId}
                href={getToolHref(toolId)}
                icon={homeIcons[toolId] || homeIcons.merge}
                title={strings.toolNames[toolId]}
                description={strings.toolDesc[toolId]}
                badge={isPrototype ? <Badge tone="info">{t.prototype}</Badge> : null}
              />
            );
          })}
        </div>
      </section>
    </main>
  );
}
