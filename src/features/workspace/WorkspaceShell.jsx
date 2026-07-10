import React from "react";
import { Button, Card, DownloadCard, IconButton, Icons, LangSwitcher, PrivacyPill, ProgressBar, toolIcon, toolIcons } from "../../components/index.js";
import { MobileNavigationDrawer } from "../../app/Chrome.jsx";
import { PDFIN_T } from "./i18n.js";
import { PdfEngine } from "./engine/pdfEngine.js";

// PDFin workspace — shell: top nav, sidebar, inspector, empty/processing/success/error states, quick switcher.
export const WSIcons = { ...Icons, ...toolIcons };

// ---------- Top navigation ----------
export function WorkspaceTopNav({ t, tool, lang, setLang, theme, setTheme, onOpenSwitcher, onHome, compact = false }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const themeToggleLabel = lang === "id"
    ? (theme === "dark" ? "Beralih ke mode terang" : "Beralih ke mode gelap")
    : (theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  return (
    <header className="ws-top-nav" style={{
      height: 56, background: "var(--surface-card)", borderBottom: "1px solid var(--border-default)",
      display: "flex", alignItems: "center", gap: compact ? 8 : 16, padding: compact ? "0 10px" : "0 16px", position: "relative", zIndex: 20, flex: "none",
    }}>
      <a href={import.meta.env.BASE_URL} style={{ textDecoration: "none", display: "flex" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
          <img src={`${import.meta.env.BASE_URL}logo/pdfin-mark-64.png`} alt="" style={{ width: 26, height: 26 }} />
          <span style={{ font: "var(--weight-extrabold) 17px/1 var(--font-sans)", letterSpacing: "-0.02em", color: "var(--text-heading)" }}>
            PDF<span style={{ color: "var(--text-brand)" }}>in</span>
          </span>
        </span>
      </a>
      <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
        {!compact && <span style={{ font: "var(--type-body-sm)", color: "var(--text-muted)" }}>{t.breadcrumbTools}</span>}
        {!compact && <span aria-hidden="true" style={{ color: "var(--text-faint)", font: "var(--type-body-sm)" }}>/</span>}
        <button type="button" onClick={onOpenSwitcher} title={t.quickSwitchHint} aria-current="page" style={{
          display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 10px", border: "none",
          borderRadius: "var(--radius-md)", background: "var(--surface-brand-subtle)", cursor: "pointer",
          font: "var(--weight-semibold) 14px/1 var(--font-sans)", color: "var(--text-heading)",
          boxShadow: "inset 0 0 0 1px var(--border-brand)", minWidth: 0,
        }}
        >
          <span style={{ display: "flex", color: "var(--text-brand)" }}>{toolIcon(tool, 16)}</span>
          <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.toolNames[tool]}</span>
          {WSIcons.chevDown(14)}
        </button>
        {!compact && <kbd style={{ font: "10.5px var(--font-mono)", color: "var(--text-faint)", border: "1px solid var(--border-default)", borderRadius: 5, padding: "3px 6px" }}>Ctrl K</kbd>}
      </nav>
      <div className="ws-top-nav__desktop-controls">
        <LangSwitcher lang={lang} onChange={setLang} />
      </div>
      <IconButton className="ws-top-nav__theme" label={themeToggleLabel} aria-pressed={theme === "dark" ? "true" : "false"} onClick={toggleTheme}
        icon={theme === "dark" ? Icons.sun(18) : Icons.moon(18)} />
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
        current="workspace"
        onHome={onHome || (() => { window.location.href = import.meta.env.BASE_URL; })}
        onWorkspace={() => {}}
      />
    </header>
  );
}

// ---------- Quick switcher (Ctrl+K) ----------
export function QuickSwitcher({ t, toolIds, current, onPick, onClose }) {
  const [q, setQ] = React.useState("");
  const [hi, setHi] = React.useState(0);
  const inputRef = React.useRef(null);
  React.useEffect(() => { inputRef.current && inputRef.current.focus(); }, []);
  const list = toolIds.filter((id) =>
    (t.toolNames[id] + " " + t.toolDesc[id]).toLowerCase().includes(q.toLowerCase()));
  React.useEffect(() => { setHi(0); }, [q]);
  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(list.length - 1, h + 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(0, h - 1)); }
    if (e.key === "Enter" && list[hi]) { onPick(list[hi]); }
    if (e.key === "Escape") onClose();
  };
  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{
      position: "fixed", inset: 0, background: "var(--color-overlay-scrim)", zIndex: 100,
      display: "flex", justifyContent: "center", alignItems: "flex-start", paddingTop: "12vh",
    }}>
      <div role="dialog" aria-label={t.allTools} style={{
        width: 520, maxHeight: "62vh", display: "flex", flexDirection: "column",
        background: "var(--surface-card)", border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-overlay)", overflow: "hidden",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: "1px solid var(--border-default)", color: "var(--text-muted)" }}>
          {WSIcons.search(17)}
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey}
            placeholder={t.searchTools} aria-label={t.searchTools} style={{
              flex: 1, border: "none", outline: "none", background: "transparent",
              font: "15px/1.4 var(--font-sans)", color: "var(--text-heading)",
            }} />
          <kbd style={{ font: "10.5px var(--font-mono)", color: "var(--text-faint)", border: "1px solid var(--border-default)", borderRadius: 5, padding: "3px 6px" }}>Esc</kbd>
        </div>
        <div role="listbox" style={{ overflow: "auto", padding: 6 }}>
          {list.map((id, i) => (
            <button key={id} type="button" role="option" aria-selected={i === hi} onClick={() => onPick(id)} onMouseEnter={() => setHi(i)} style={{
              display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "9px 10px",
              border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", textAlign: "left",
              background: i === hi ? "var(--surface-brand-subtle)" : "transparent",
            }}>
              <span style={{
                display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, flex: "none",
                borderRadius: 10, background: "var(--surface-brand-subtle)", color: "var(--text-brand)",
              }}>{toolIcon(id, 17)}</span>
              <span style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
                <span style={{ font: "var(--weight-semibold) 13.5px/1.3 var(--font-sans)", color: "var(--text-heading)" }}>
                  {t.toolNames[id]}{id === current && <span style={{ color: "var(--text-faint)", fontWeight: 400 }}> — {t.breadcrumbHome === "Beranda" ? "sedang dibuka" : "current"}</span>}
                </span>
                <span style={{ font: "12px/1.4 var(--font-sans)", color: "var(--text-muted)" }}>{t.toolDesc[id]}</span>
              </span>
            </button>
          ))}
          {!list.length && <div style={{ padding: 18, font: "var(--type-body-sm)", color: "var(--text-muted)", textAlign: "center" }}>{t.noToolMatch}</div>}
        </div>
      </div>
    </div>
  );
}

// ---------- Empty state ----------
export function EmptyState({ t, tool, onFiles, onSample, acceptImages, busy }) {
  const [drag, setDrag] = React.useState(false);
  const inputRef = React.useRef(null);
  const handle = (fileList) => { const arr = [...fileList]; if (arr.length) onFiles(arr); };
  const isId = t === PDFIN_T.id;
  const mobileTitle = acceptImages ? (isId ? "Pilih file gambar" : "Choose image files") : (isId ? "Pilih file PDF" : "Choose a PDF file");
  const mobileText = acceptImages ? (isId ? "Pilih JPG atau PNG dari perangkat Anda." : "Choose JPG or PNG files from your device.") : (isId ? "Pilih PDF dari perangkat Anda." : "Choose a PDF from your device.");
  const mobileLimit = acceptImages ? (isId ? "JPG/PNG maks. 50 MB" : "JPG/PNG max. 50 MB") : (isId ? "Maks. 100 MB" : "Max. 100 MB");
  const privacyShort = isId ? "File diproses di perangkat Anda." : "Files are processed on your device.";
  const detailsTitle = isId ? "Batas file dan privasi" : "File limits and privacy";
  React.useEffect(() => {
    const onPaste = (e) => { if (e.clipboardData && e.clipboardData.files.length) handle(e.clipboardData.files); };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  });
  return (
    <div className="ws-empty-state" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <div className="ws-empty-state__inner" style={{ width: "100%", maxWidth: 560, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, textAlign: "center" }}>
        <span className="ws-empty-state__icon" style={{
          display: "flex", alignItems: "center", justifyContent: "center", width: 56, height: 56,
          borderRadius: 16, background: "var(--surface-brand-subtle)", color: "var(--text-brand)",
        }}>{toolIcon(tool, 26)}</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <h1 className="ws-empty-state__title" style={{ font: "var(--weight-bold) 22px/1.25 var(--font-sans)", letterSpacing: "-0.02em", color: "var(--text-heading)", margin: 0 }}>
            <span className="ws-empty-state__desktop-title">{t.toolNames[tool]}</span>
            <span className="ws-empty-state__mobile-title">{mobileTitle}</span>
          </h1>
          <p className="ws-empty-state__description" style={{ font: "var(--type-body-sm)", color: "var(--text-muted)", margin: 0, maxWidth: 420 }}>
            <span className="ws-empty-state__desktop-title">{t.toolDesc[tool]}</span>
            <span className="ws-empty-state__mobile-title">{mobileText}</span>
          </p>
        </div>
        <div
          className="ws-upload-card"
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files); }}
          style={{
            width: "100%", padding: "38px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
            border: `2px dashed ${drag ? "var(--border-brand)" : "var(--border-strong)"}`,
            borderRadius: "var(--radius-lg)",
            background: drag ? "var(--surface-brand-subtle)" : "var(--gradient-upload)",
            transition: "background var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out)",
          }}>
          <span className="ws-upload-card__icon" style={{ color: "var(--text-brand)" }}>{Icons.upload(26)}</span>
          <span className="ws-upload-card__title" style={{ font: "var(--weight-semibold) 15px/1.3 var(--font-sans)", color: "var(--text-heading)" }}>{t.drop.title}</span>
          <span className="ws-upload-card__hint" style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>{t.empty.hintKeyboard}</span>
          <div className="ws-upload-card__actions" style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
            <Button variant="primary" fullWidth onClick={() => inputRef.current && inputRef.current.click()} disabled={busy}>{t.drop.browse}</Button>
            <Button variant="ghost" size="sm" onClick={onSample} disabled={busy} icon={WSIcons.sparkle(15)}>{t.sidebar.sample}</Button>
          </div>
          <span className="ws-upload-card__limit" style={{ font: "11.5px var(--font-mono)", color: "var(--text-faint)", marginTop: 2 }}>
            <span className="ws-empty-state__desktop-title">{acceptImages ? t.drop.typesImg : t.drop.types}</span>
            <span className="ws-empty-state__mobile-title">{mobileLimit}</span>
          </span>
          <input ref={inputRef} type="file" accept={acceptImages ? ".png,.jpg,.jpeg" : ".pdf"} multiple style={{ display: "none" }}
            onChange={(e) => { handle(e.target.files); e.target.value = ""; }} />
        </div>
        <div className="ws-empty-state__requirements" style={{
          width: "100%", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8,
          textAlign: "left",
        }}>
          {[acceptImages ? t.drop.typesImg : t.drop.types, t.toolRequirements[tool], t.privacy].map((item) => (
            <span key={item} style={{
              minHeight: 44, display: "flex", alignItems: "center", padding: "8px 10px",
              border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)",
              background: "var(--surface-card)", font: "var(--type-caption)", color: "var(--text-muted)",
            }}>{item}</span>
          ))}
        </div>
        <details className="ws-empty-state__details">
          <summary>{detailsTitle}</summary>
          <div>
            <span>{acceptImages ? t.drop.typesImg : t.drop.types}</span>
            <span>{t.toolRequirements[tool]}</span>
            <span>{privacyShort}</span>
          </div>
        </details>
        <span className="ws-empty-state__privacy-short">{privacyShort}</span>
        <span className="ws-empty-state__privacy-pill"><PrivacyPill lang={isId ? "id" : "en"} /></span>
      </div>
    </div>
  );
}

// ---------- Processing / success / error ----------
export function ProcessingView({ t, progress, label, onCancel }) {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <Card style={{ width: 420 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <ProgressBar value={progress} label={label || t.stage.processing} />
          <span style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>{t.privacy}</span>
          <div><Button variant="ghost" size="sm" onClick={onCancel}>{t.stage.cancel}</Button></div>
        </div>
      </Card>
    </div>
  );
}

export function ProcessActionBar({ t, label, disabled, helper, onRun, actionFields = null }) {
  const helperId = "workspace-process-helper";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {actionFields}
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <span style={{
          font: "var(--weight-semibold) 11.5px/1.2 var(--font-sans)",
          color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em",
        }}>{t.cta.nextAction}</span>
        <span id={helperId} style={{
          minHeight: 18, font: "var(--type-caption)",
          color: disabled ? "var(--status-warning-fg)" : "var(--text-muted)",
        }}>{helper || t.cta.ready}</span>
      </div>
      <Button
        variant="primary"
        size="lg"
        fullWidth
        disabled={disabled}
        onClick={onRun}
        aria-describedby={helperId}
      >
        {label}
      </Button>
    </div>
  );
}

export function SuccessView({ t, result, onDownload, onDownloadAll, onRestart, onBack, note, summary, continuationActions = [], onContinue }) {
  const total = result.outputs.reduce((a, o) => a + o.size, 0);
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32, overflow: "auto" }}>
      <div style={{ width: "100%", maxWidth: 520, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" }}>
          <span className="ws-pop" style={{
            display: "flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: "50%",
            background: "var(--status-success-bg)", color: "var(--status-success-fg)",
          }}>{WSIcons.check(28)}</span>
          <h2 style={{ font: "var(--weight-bold) 20px/1.3 var(--font-sans)", letterSpacing: "-0.02em", color: "var(--text-heading)", margin: 0 }}>{t.stage.done}</h2>
          <span style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>
            {t.success.size}: <span style={{ font: "11.5px var(--font-mono)" }}>{PdfEngine.fmtSize(total, "id")}</span>
            {" · "}{t.success.time}: <span style={{ font: "11.5px var(--font-mono)" }}>{(result.ms / 1000).toFixed(1)}s</span>
          </span>
          {summary && <p style={{ font: "var(--type-body-sm)", color: "var(--text-body)", margin: 0, maxWidth: 420 }}>{summary}</p>}
          {note && <span style={{ font: "var(--type-caption)", color: "var(--status-warning-fg)", background: "var(--status-warning-bg)", padding: "4px 10px", borderRadius: 999 }}>{note}</span>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 300, overflow: "auto" }}>
          {result.outputs.slice(0, 20).map((o, i) => (
            <DownloadCard key={i} name={o.name} downloadLabel={t.stage.download}
              meta={PdfEngine.fmtSize(o.size, "id") + (o.pages ? ` · ${o.pages} ${t.success.pages}` : "")}
              onDownload={() => onDownload(o)} />
          ))}
          {result.outputs.length > 20 && <span style={{ font: "var(--type-caption)", color: "var(--text-muted)", textAlign: "center" }}>+{result.outputs.length - 20}</span>}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
          {result.outputs.length > 1 && <Button variant="primary" icon={WSIcons.download(16)} onClick={onDownloadAll}>{t.stage.downloadAll}</Button>}
          <Button variant="secondary" onClick={onBack}>{t.stage.back}</Button>
          <Button variant="ghost" onClick={onRestart}>{t.stage.restart}</Button>
        </div>
        {!!continuationActions.length && (
          <section aria-label={t.continue.title} style={{
            display: "flex", flexDirection: "column", gap: 10, paddingTop: 4,
            borderTop: "1px solid var(--border-default)",
          }}>
            <h3 style={{
              font: "var(--weight-semibold) 12px/1 var(--font-sans)", textTransform: "uppercase",
              letterSpacing: "0.06em", color: "var(--text-faint)", margin: 0, textAlign: "center",
            }}>{t.continue.title}</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {continuationActions.map((action) => (
                <Button
                  key={action.tool}
                  variant="secondary"
                  size="sm"
                  icon={toolIcon(action.tool, 15)}
                  onClick={() => onContinue(action.tool)}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export function ErrorView({ t, message, onRetry, onRestart }) {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <div style={{ width: 420, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, borderRadius: "50%", background: "var(--status-error-bg)", color: "var(--status-error-fg)" }}>
          {WSIcons.error(24)}
        </span>
        <h2 style={{ font: "var(--weight-bold) 18px/1.3 var(--font-sans)", color: "var(--text-heading)", margin: 0 }}>{t.error.title}</h2>
        <p style={{ font: "var(--type-body-sm)", color: "var(--text-muted)", margin: 0 }}>{message || t.error.body}</p>
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <Button variant="primary" onClick={onRetry}>{t.error.retry}</Button>
          <Button variant="ghost" onClick={onRestart}>{t.stage.restart}</Button>
        </div>
      </div>
    </div>
  );
}
