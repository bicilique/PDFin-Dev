import React from "react";
import { IconButton, LangSwitcher } from "../components/index.js";
import { DEFAULT_TOOL_ID, getToolHref } from "./toolRoutes.js";

export function PdfinLogo({ dark = false }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <img src={`${import.meta.env.BASE_URL}logo/pdfin-mark-64.png`} alt="" style={{ width: 30, height: 30 }} />
      <span style={{ font: "var(--weight-extrabold) 20px/1 var(--font-sans)", letterSpacing: "-0.02em", color: dark ? "#fff" : "var(--text-heading)" }}>
        PDF<span style={{ color: dark ? "var(--cyan-400)" : "var(--text-brand)" }}>in</span>
      </span>
    </span>
  );
}

export function Header({ lang, setLang, theme, setTheme, current = "home", onHome, onWorkspace }) {
  const nav = lang === "id"
    ? [{ key: "home", label: "Semua alat", href: import.meta.env.BASE_URL, action: onHome }, { key: "workspace", label: "Workspace", href: getToolHref(DEFAULT_TOOL_ID), action: onWorkspace }]
    : [{ key: "home", label: "All tools", href: import.meta.env.BASE_URL, action: onHome }, { key: "workspace", label: "Workspace", href: getToolHref(DEFAULT_TOOL_ID), action: onWorkspace }];
  return (
    <header style={{
      minHeight: "var(--header-height)", background: "var(--surface-card)",
      borderBottom: "1px solid var(--border-default)",
      display: "flex", alignItems: "center", flexWrap: "wrap", gap: 12, padding: "10px clamp(16px, 4vw, 32px)",
      position: "sticky", top: 0, zIndex: 10,
    }}>
      <a href={import.meta.env.BASE_URL} onClick={(e) => { e.preventDefault(); onHome(); }} style={{ textDecoration: "none" }}><PdfinLogo /></a>
      <nav style={{ display: "flex", gap: 4, flex: "1 1 180px", minWidth: 0, flexWrap: "wrap" }}>
        {nav.map((n) => {
          const active = current === n.key;
          return (
            <a
              key={n.label}
              href={n.href}
              aria-current={active ? "page" : undefined}
              onClick={(e) => { e.preventDefault(); n.action && n.action(); }}
              style={{
                font: "var(--type-label)",
                color: active ? "var(--text-brand)" : "var(--text-body)",
                padding: "8px 12px",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                background: active ? "var(--surface-brand-subtle)" : "transparent",
                boxShadow: active ? "inset 0 0 0 1px var(--border-brand)" : "none",
              }}
            >
              {n.label}
            </a>
          );
        })}
      </nav>
      <LangSwitcher lang={lang} onChange={setLang} />
      <IconButton
        label={theme === "dark" ? "Light mode" : "Dark mode"}
        aria-pressed={theme === "dark" ? "true" : "false"}
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        icon={theme === "dark"
          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path></svg>
          : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"></path></svg>}
      />
    </header>
  );
}

export function Footer({ lang }) {
  const t = lang === "id"
    ? { privacy: "Kebijakan privasi", terms: "Syarat & ketentuan", desktop: "Aplikasi desktop", note: "File Anda diproses di browser. PDFin tidak mengunggah file Anda untuk alat ini." }
    : { privacy: "Privacy policy", terms: "Terms", desktop: "Desktop app", note: "Your files are processed in your browser. PDFin does not upload your files for this tool." };
  const mutedItem = {
    font: "var(--type-caption)",
    color: "var(--text-faint)",
  };
  return (
    <footer style={{ borderTop: "1px solid var(--border-default)", padding: "28px clamp(16px, 4vw, 32px)", display: "flex", alignItems: "center", flexWrap: "wrap", gap: 18, background: "var(--surface-card)" }}>
      <PdfinLogo />
      <span style={{ font: "var(--type-caption)", color: "var(--text-muted)", flex: 1 }}>{t.note}</span>
      <span aria-disabled="true" style={mutedItem}>{t.privacy}</span>
      <span aria-disabled="true" style={mutedItem}>{t.terms}</span>
      <span aria-disabled="true" style={mutedItem}>GitHub</span>
      <span aria-disabled="true" style={mutedItem}>{t.desktop}</span>
    </footer>
  );
}
