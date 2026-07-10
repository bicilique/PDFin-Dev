// PDFin Web — shared chrome (Header, Footer). Exposes to window.
const DS = window.PDFinDesignSystem_41a2ca;

function PdfinLogo({ dark = false }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <img src="../../assets/logo/pdfin-mark-64.png" alt="" style={{ width: 30, height: 30 }} />
      <span style={{ font: "var(--weight-extrabold) 20px/1 var(--font-sans)", letterSpacing: "-0.02em", color: dark ? "#fff" : "var(--text-heading)" }}>
        PDF<span style={{ color: dark ? "var(--cyan-400)" : "var(--text-brand)" }}>in</span>
      </span>
    </span>
  );
}

function Header({ lang, setLang, theme, setTheme, onHome }) {
  const nav = lang === "id" ? ["Semua alat", "Desktop", "Tentang"] : ["All tools", "Desktop", "About"];
  return (
    <header style={{
      height: "var(--header-height)", background: "var(--surface-card)",
      borderBottom: "1px solid var(--border-default)",
      display: "flex", alignItems: "center", gap: 24, padding: "0 32px",
      position: "sticky", top: 0, zIndex: 10,
    }}>
      <a href="#" onClick={(e) => { e.preventDefault(); onHome(); }} style={{ textDecoration: "none" }}><PdfinLogo /></a>
      <nav style={{ display: "flex", gap: 4, flex: 1 }}>
        {nav.map((n) => (
          <a key={n} href="#" onClick={(e) => e.preventDefault()} style={{
            font: "var(--type-label)", color: "var(--text-body)", padding: "8px 12px",
            borderRadius: "var(--radius-md)", textDecoration: "none",
          }}>{n}</a>
        ))}
      </nav>
      <DS.LangSwitcher lang={lang} onChange={setLang} />
      <DS.IconButton
        label={theme === "dark" ? "Light mode" : "Dark mode"}
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        icon={theme === "dark"
          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path></svg>
          : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"></path></svg>}
      />
    </header>
  );
}

function Footer({ lang }) {
  const t = lang === "id"
    ? { privacy: "Kebijakan privasi", terms: "Syarat & ketentuan", desktop: "Aplikasi desktop", note: "File Anda diproses di browser. PDFin tidak mengunggah file Anda untuk alat ini." }
    : { privacy: "Privacy policy", terms: "Terms", desktop: "Desktop app", note: "Your files are processed in your browser. PDFin does not upload your files for this tool." };
  return (
    <footer style={{ borderTop: "1px solid var(--border-default)", padding: "28px 32px", display: "flex", alignItems: "center", gap: 24, background: "var(--surface-card)" }}>
      <PdfinLogo />
      <span style={{ font: "var(--type-caption)", color: "var(--text-muted)", flex: 1 }}>{t.note}</span>
      <a href="#" onClick={(e) => e.preventDefault()} style={{ font: "var(--type-caption)" }}>{t.privacy}</a>
      <a href="#" onClick={(e) => e.preventDefault()} style={{ font: "var(--type-caption)" }}>{t.terms}</a>
      <a href="#" onClick={(e) => e.preventDefault()} style={{ font: "var(--type-caption)" }}>GitHub</a>
      <a href="#" onClick={(e) => e.preventDefault()} style={{ font: "var(--type-caption)" }}>{t.desktop}</a>
    </footer>
  );
}

Object.assign(window, { PdfinLogo, Header, Footer });
