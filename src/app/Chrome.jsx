import React from "react";
import { IconButton, Icons, LangSwitcher, MobileDrawer } from "../components/index.js";
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
  const [menuOpen, setMenuOpen] = React.useState(false);
  const themeToggleLabel = lang === "id"
    ? (theme === "dark" ? "Beralih ke mode terang" : "Beralih ke mode gelap")
    : (theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
  const nav = lang === "id"
    ? [
        { key: "home", label: "Semua alat", href: import.meta.env.BASE_URL, action: onHome },
        { key: "workspace", label: "Ruang kerja", href: getToolHref(DEFAULT_TOOL_ID), action: onWorkspace },
        { key: "privacy", label: "Privasi & keamanan", href: `${import.meta.env.BASE_URL}#privacy-security` },
      ]
    : [
        { key: "home", label: "All tools", href: import.meta.env.BASE_URL, action: onHome },
        { key: "workspace", label: "Workspace", href: getToolHref(DEFAULT_TOOL_ID), action: onWorkspace },
        { key: "privacy", label: "Privacy & security", href: `${import.meta.env.BASE_URL}#privacy-security` },
      ];
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  return (
    <header className="app-header" style={{
      minHeight: "var(--header-height)", background: "var(--surface-card)",
      borderBottom: "1px solid var(--border-default)",
      display: "flex", alignItems: "center", flexWrap: "wrap", gap: 12, padding: "10px clamp(16px, 4vw, 32px)",
      position: "sticky", top: 0, zIndex: 10,
    }}>
      <a className="app-header__logo" href={import.meta.env.BASE_URL} onClick={(e) => { e.preventDefault(); onHome(); }} style={{ textDecoration: "none" }}><PdfinLogo /></a>
      <nav className="app-header__nav" style={{ display: "flex", gap: 4, flex: "1 1 180px", minWidth: 0, flexWrap: "wrap" }}>
        {nav.map((n) => {
          const active = current === n.key;
          return (
            <a
              key={n.label}
              href={n.href}
              aria-current={active ? "page" : undefined}
              onClick={(e) => {
                if (!n.action) return;
                e.preventDefault();
                n.action();
              }}
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
      <div className="app-header__desktop-controls">
        <LangSwitcher lang={lang} onChange={setLang} />
      </div>
      <IconButton
        className="app-header__theme"
        label={themeToggleLabel}
        aria-pressed={theme === "dark" ? "true" : "false"}
        onClick={toggleTheme}
        icon={theme === "dark" ? Icons.sun(18) : Icons.moon(18)}
      />
      <button type="button" className="mobile-menu-button" aria-label={lang === "id" ? "Buka menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
        {Icons.menu(21)}
      </button>
      <MobileNavigationDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        lang={lang}
        setLang={setLang}
        theme={theme}
        onThemeToggle={toggleTheme}
        current={current}
        onHome={onHome}
        onWorkspace={onWorkspace}
      />
    </header>
  );
}

export function MobileNavigationDrawer({ open, onClose, lang, setLang, theme, onThemeToggle, current, onHome, onWorkspace }) {
  const themeToggleLabel = lang === "id"
    ? (theme === "dark" ? "Beralih ke mode terang" : "Beralih ke mode gelap")
    : (theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
  const title = lang === "id" ? "Menu" : "Menu";
  const nav = lang === "id"
    ? [
        { key: "home", label: "Semua alat", href: import.meta.env.BASE_URL, action: onHome },
        { key: "workspace", label: "Ruang kerja", href: getToolHref(DEFAULT_TOOL_ID), action: onWorkspace },
        { key: "privacy", label: "Privasi & keamanan", href: `${import.meta.env.BASE_URL}#privacy-security` },
      ]
    : [
        { key: "home", label: "All tools", href: import.meta.env.BASE_URL, action: onHome },
        { key: "workspace", label: "Workspace", href: getToolHref(DEFAULT_TOOL_ID), action: onWorkspace },
        { key: "privacy", label: "Privacy & security", href: `${import.meta.env.BASE_URL}#privacy-security` },
      ];
  const linkStyle = ({ active = false } = {}) => ({
    minHeight: 48,
    display: "flex",
    alignItems: "center",
    padding: "0 14px",
    borderRadius: "var(--radius-md)",
    border: `1px solid ${active ? "var(--border-brand)" : "var(--border-default)"}`,
    background: active ? "var(--surface-brand-subtle)" : "var(--surface-card)",
    color: active ? "var(--text-brand)" : "var(--text-body)",
    font: "var(--type-label)",
    textDecoration: "none",
  });
  return (
    <MobileDrawer open={open} title={title} onClose={onClose}>
      <nav className="mobile-drawer__body" aria-label={title}>
        {nav.map((item) => (
          <a
            key={item.key}
            href={item.href}
            aria-current={current === item.key ? "page" : undefined}
            style={linkStyle({ active: current === item.key })}
            onClick={(event) => {
              if (item.action) {
                event.preventDefault();
                item.action();
              }
              onClose();
            }}
          >
            {item.label}
          </a>
        ))}
        <a href="https://github.com/bicilique" target="_blank" rel="noreferrer" style={{ ...linkStyle(), gap: 8 }} onClick={onClose}>{Icons.github(18)}GitHub</a>
        <a href="mailto:afiffaizianur@gmail.com" style={linkStyle()} onClick={onClose}>Self-hosting / on-premise</a>
      </nav>
      <div className="mobile-drawer__section">
        <span className="mobile-drawer__label">{lang === "id" ? "Bahasa" : "Language"}</span>
        <LangSwitcher lang={lang} onChange={setLang} />
      </div>
      <button type="button" className="mobile-drawer__theme" aria-pressed={theme === "dark" ? "true" : "false"} onClick={onThemeToggle}>
        {themeToggleLabel}
      </button>
    </MobileDrawer>
  );
}

export function Footer({ lang }) {
  const t = lang === "id"
    ? {
        privacy: "Privasi & keamanan",
        github: "GitHub",
        selfHosting: "Self-hosting / on-premise",
        note: "PDFin memproses file langsung di browser Anda. File tidak diunggah ke server.",
      }
    : {
        privacy: "Privacy & security",
        github: "GitHub",
        selfHosting: "Self-hosting / on-premise",
        note: "PDFin processes files directly in your browser. Files are not uploaded to a server.",
      };
  const linkStyle = { font: "var(--type-caption)", color: "var(--text-link)" };
  const iconLinkStyle = { ...linkStyle, display: "inline-flex", alignItems: "center", gap: 6 };
  return (
    <footer className="app-footer" style={{ borderTop: "1px solid var(--border-default)", padding: "28px clamp(16px, 4vw, 32px)", display: "flex", alignItems: "center", flexWrap: "wrap", gap: 18, background: "var(--surface-card)" }}>
      <PdfinLogo />
      <span style={{ font: "var(--type-caption)", color: "var(--text-muted)", flex: 1 }}>{t.note}</span>
      <a href={`${import.meta.env.BASE_URL}#privacy-security`} style={linkStyle}>{t.privacy}</a>
      <a href="https://github.com/bicilique" target="_blank" rel="noreferrer" style={iconLinkStyle}>{Icons.github(16)}{t.github}</a>
      <a href="mailto:afiffaizianur@gmail.com" style={linkStyle}>{t.selfHosting}</a>
      <a href="mailto:afiffaizianur@gmail.com" style={linkStyle}>afiffaizianur@gmail.com</a>
    </footer>
  );
}
