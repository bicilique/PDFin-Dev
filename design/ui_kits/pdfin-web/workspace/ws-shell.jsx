// PDFin workspace — shell: icons, top nav, sidebar, inspector, empty/processing/success/error states, quick switcher.
const DS = window.PDFinDesignSystem_41a2ca;
const L = (props) => (
  <svg width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{props.children}</svg>
);

// Lucide glyphs used across the workspace
const WSIcons = {
  merge: (s) => <L size={s}><path d="m8 6 4-4 4 4"></path><path d="M12 2v10.3a4 4 0 0 1-1.172 2.872L4 22"></path><path d="m20 22-5-5"></path></L>,
  split: (s) => <L size={s}><path d="M16 3h5v5"></path><path d="M8 3H3v5"></path><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"></path><path d="m15 9 6-6"></path></L>,
  organize: (s) => <L size={s}><rect width="7" height="7" x="3" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="14" rx="1"></rect><rect width="7" height="7" x="3" y="14" rx="1"></rect></L>,
  rotate: (s) => <L size={s}><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path></L>,
  compress: (s) => <L size={s}><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" x2="21" y1="10" y2="3"></line><line x1="3" x2="10" y1="21" y2="14"></line></L>,
  watermark: (s) => <L size={s}><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" x2="15" y1="20" y2="20"></line><line x1="12" x2="12" y1="4" y2="20"></line></L>,
  img2pdf: (s) => <L size={s}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></L>,
  pdf2img: (s) => <L size={s}><path d="M18 22H4a2 2 0 0 1-2-2V6"></path><path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18"></path><circle cx="12" cy="8" r="2"></circle><rect width="16" height="16" x="6" y="2" rx="2"></rect></L>,
  pagenum: (s) => <L size={s}><line x1="4" x2="20" y1="9" y2="9"></line><line x1="4" x2="20" y1="15" y2="15"></line><line x1="10" x2="8" y1="3" y2="21"></line><line x1="16" x2="14" y1="3" y2="21"></line></L>,
  flatten: (s) => <L size={s}><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"></path><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"></path><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"></path></L>,
  protect: (s) => <L size={s}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></L>,
  unlock: (s) => <L size={s}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></L>,
  metadata: (s) => <L size={s}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></L>,
  sign: (s) => <L size={s}><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"></path></L>,
  ocr: (s) => <L size={s}><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><path d="M7 8h8"></path><path d="M7 12h10"></path><path d="M7 16h6"></path></L>,
  chevDown: (s) => <L size={s}><path d="m6 9 6 6 6-6"></path></L>,
  search: (s) => <L size={s}><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></L>,
  plus: (s) => <L size={s}><path d="M12 5v14M5 12h14"></path></L>,
  download: (s) => <L size={s}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"></path></L>,
  check: (s) => <L size={s}><path d="M20 6 9 17l-5-5"></path></L>,
  sparkle: (s) => <L size={s}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path></L>,
};
const toolIcon = (id, s) => (WSIcons[id] || WSIcons.merge)(s);

// ---------- Top navigation ----------
function WorkspaceTopNav({ t, tool, lang, setLang, theme, setTheme, onOpenSwitcher }) {
  return (
    <header style={{
      height: 56, background: "var(--surface-card)", borderBottom: "1px solid var(--border-default)",
      display: "flex", alignItems: "center", gap: 16, padding: "0 16px", position: "relative", zIndex: 20, flex: "none",
    }}>
      <a href="#" onClick={(e) => e.preventDefault()} style={{ textDecoration: "none", display: "flex" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
          <img src="../../../assets/logo/pdfin-mark-64.png" alt="PDFin" style={{ width: 26, height: 26 }} />
          <span style={{ font: "var(--weight-extrabold) 17px/1 var(--font-sans)", letterSpacing: "-0.02em", color: "var(--text-heading)" }}>
            PDF<span style={{ color: "var(--text-brand)" }}>in</span>
          </span>
        </span>
      </a>
      <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
        <span style={{ font: "var(--type-body-sm)", color: "var(--text-muted)" }}>{t.breadcrumbTools}</span>
        <span aria-hidden="true" style={{ color: "var(--text-faint)", font: "var(--type-body-sm)" }}>/</span>
        <button type="button" onClick={onOpenSwitcher} title={t.quickSwitchHint} style={{
          display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 10px", border: "none",
          borderRadius: "var(--radius-md)", background: "transparent", cursor: "pointer",
          font: "var(--weight-semibold) 14px/1 var(--font-sans)", color: "var(--text-heading)",
        }}
          onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-sunken)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
          <span style={{ display: "flex", color: "var(--text-brand)" }}>{toolIcon(tool, 16)}</span>
          {t.toolNames[tool]}
          {WSIcons.chevDown(14)}
        </button>
        <kbd style={{ font: "10.5px var(--font-mono)", color: "var(--text-faint)", border: "1px solid var(--border-default)", borderRadius: 5, padding: "3px 6px" }}>Ctrl K</kbd>
      </nav>
      <DS.LangSwitcher lang={lang} onChange={setLang} />
      <DS.IconButton label={theme === "dark" ? "Light mode" : "Dark mode"} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        icon={theme === "dark"
          ? <L><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path></L>
          : <L><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"></path></L>} />
    </header>
  );
}

// ---------- Quick switcher (Ctrl+K) ----------
function QuickSwitcher({ t, toolIds, current, onPick, onClose }) {
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
      position: "fixed", inset: 0, background: "rgba(18,15,34,0.45)", zIndex: 100,
      display: "flex", justifyContent: "center", alignItems: "flex-start", paddingTop: "12vh",
    }}>
      <div role="dialog" aria-label={t.allTools} style={{
        width: 520, maxHeight: "62vh", display: "flex", flexDirection: "column",
        background: "var(--surface-card)", border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)", boxShadow: "0 24px 64px rgba(18,15,34,0.3)", overflow: "hidden",
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
function EmptyState({ t, tool, onFiles, onSample, acceptImages, busy }) {
  const [drag, setDrag] = React.useState(false);
  const inputRef = React.useRef(null);
  const accept = acceptImages ? "image/png,image/jpeg" : "application/pdf";
  const handle = (fileList) => { const arr = [...fileList].filter((f) => accept.includes(f.type) || (!acceptImages && f.name.toLowerCase().endsWith(".pdf"))); if (arr.length) onFiles(arr); };
  React.useEffect(() => {
    const onPaste = (e) => { if (e.clipboardData && e.clipboardData.files.length) handle(e.clipboardData.files); };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  });
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <div style={{ width: "100%", maxWidth: 560, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, textAlign: "center" }}>
        <span style={{
          display: "flex", alignItems: "center", justifyContent: "center", width: 56, height: 56,
          borderRadius: 16, background: "var(--surface-brand-subtle)", color: "var(--text-brand)",
        }}>{toolIcon(tool, 26)}</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <h1 style={{ font: "var(--weight-bold) 22px/1.25 var(--font-sans)", letterSpacing: "-0.02em", color: "var(--text-heading)", margin: 0 }}>{t.toolNames[tool]}</h1>
          <p style={{ font: "var(--type-body-sm)", color: "var(--text-muted)", margin: 0, maxWidth: 420 }}>{t.toolDesc[tool]}</p>
        </div>
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files); }}
          style={{
            width: "100%", padding: "38px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
            border: `2px dashed ${drag ? "var(--border-brand)" : "var(--border-strong)"}`,
            borderRadius: "var(--radius-lg)",
            background: drag ? "var(--surface-brand-subtle)" : "var(--gradient-brand-soft)",
            transition: "background var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out)",
          }}>
          <span style={{ color: "var(--text-brand)" }}><L size={26}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="M17 8l-5-5-5 5"></path><path d="M12 3v12"></path></L></span>
          <span style={{ font: "var(--weight-semibold) 15px/1.3 var(--font-sans)", color: "var(--text-heading)" }}>{t.drop.title}</span>
          <span style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>{t.empty.hintKeyboard}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
            <DS.Button variant="primary" onClick={() => inputRef.current && inputRef.current.click()} disabled={busy}>{t.drop.browse}</DS.Button>
            <DS.Button variant="ghost" size="sm" onClick={onSample} disabled={busy} icon={WSIcons.sparkle(15)}>{t.sidebar.sample}</DS.Button>
          </div>
          <span style={{ font: "11.5px var(--font-mono)", color: "var(--text-faint)", marginTop: 2 }}>{acceptImages ? t.drop.typesImg : t.drop.types}</span>
          <input ref={inputRef} type="file" accept={acceptImages ? ".png,.jpg,.jpeg" : ".pdf"} multiple style={{ display: "none" }}
            onChange={(e) => { handle(e.target.files); e.target.value = ""; }} />
        </div>
        <DS.PrivacyPill lang={t === window.PDFIN_T.id ? "id" : "en"} />
      </div>
    </div>
  );
}

// ---------- Processing / success / error ----------
function ProcessingView({ t, progress, label, onCancel }) {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <DS.Card style={{ width: 420 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <DS.ProgressBar value={progress} label={label || t.stage.processing} />
          <span style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>{t.privacy}</span>
          <div><DS.Button variant="ghost" size="sm" onClick={onCancel}>{t.stage.cancel}</DS.Button></div>
        </div>
      </DS.Card>
    </div>
  );
}

function SuccessView({ t, result, onDownload, onDownloadAll, onRestart, onBack, note }) {
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
            {t.success.size}: <span style={{ font: "11.5px var(--font-mono)" }}>{window.PdfEngine.fmtSize(total, "id")}</span>
            {" · "}{t.success.time}: <span style={{ font: "11.5px var(--font-mono)" }}>{(result.ms / 1000).toFixed(1)}s</span>
          </span>
          {note && <span style={{ font: "var(--type-caption)", color: "var(--status-warning-fg)", background: "var(--status-warning-bg)", padding: "4px 10px", borderRadius: 999 }}>{note}</span>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 300, overflow: "auto" }}>
          {result.outputs.slice(0, 20).map((o, i) => (
            <DS.DownloadCard key={i} name={o.name} downloadLabel={t.stage.download}
              meta={window.PdfEngine.fmtSize(o.size, "id") + (o.pages ? ` · ${o.pages} ${t.success.pages}` : "")}
              onDownload={() => onDownload(o)} />
          ))}
          {result.outputs.length > 20 && <span style={{ font: "var(--type-caption)", color: "var(--text-muted)", textAlign: "center" }}>+{result.outputs.length - 20}</span>}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
          {result.outputs.length > 1 && <DS.Button variant="primary" icon={WSIcons.download(16)} onClick={onDownloadAll}>{t.stage.downloadAll}</DS.Button>}
          <DS.Button variant="secondary" onClick={onBack}>{t.stage.back}</DS.Button>
          <DS.Button variant="ghost" onClick={onRestart}>{t.stage.restart}</DS.Button>
        </div>
      </div>
    </div>
  );
}

function ErrorView({ t, message, onRetry, onRestart }) {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <div style={{ width: 420, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, borderRadius: "50%", background: "var(--status-error-bg)", color: "var(--status-error-fg)" }}>
          <L size={24}><circle cx="12" cy="12" r="10"></circle><path d="m15 9-6 6M9 9l6 6"></path></L>
        </span>
        <h2 style={{ font: "var(--weight-bold) 18px/1.3 var(--font-sans)", color: "var(--text-heading)", margin: 0 }}>{t.error.title}</h2>
        <p style={{ font: "var(--type-body-sm)", color: "var(--text-muted)", margin: 0 }}>{message || t.error.body}</p>
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <DS.Button variant="primary" onClick={onRetry}>{t.error.retry}</DS.Button>
          <DS.Button variant="ghost" onClick={onRestart}>{t.stage.restart}</DS.Button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { WSIcons, toolIcon, WorkspaceTopNav, QuickSwitcher, EmptyState, ProcessingView, SuccessView, ErrorView });
