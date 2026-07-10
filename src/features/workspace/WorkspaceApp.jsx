import React from "react";
import { Badge, Button, IconButton, PrivacyPill, Toast } from "../../components/index.js";
import { PDFIN_T } from "./i18n.js";
import { PdfEngine } from "./engine/pdfEngine.js";
import { PdfProcess } from "./engine/pdfProcess.js";
import { EmptyState, ErrorView, ProcessingView, ProcessActionBar, QuickSwitcher, SuccessView, WorkspaceTopNav } from "./WorkspaceShell.jsx";
import { DocPreview, PageGrid, Sidebar } from "./WorkspaceViews.jsx";
import { TOOL_DEFS } from "./tools/tools-1.jsx";
import "./tools/tools-2.jsx";
import "./tools/tools-3.jsx";
import { WORKSPACE_TOOL_IDS } from "./toolCatalog.js";
import "./workspace-responsive.css";

// PDFin workspace — app shell: routing, state machine, file/page model, undo, downloads.
const DEFS = TOOL_DEFS;
const TOOL_IDS = WORKSPACE_TOOL_IDS;

let uidCounter = 1;
const nextUid = () => "p" + uidCounter++;

function hashTool() {
  const h = (location.hash || "").replace("#", "");
  return TOOL_IDS.includes(h) ? h : "merge";
}

function useMediaQuery(query) {
  const getMatch = () => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia(query).matches : false);
  const [matches, setMatches] = React.useState(getMatch);

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    onChange();
    if (media.addEventListener) {
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    }
    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, [query]);

  return matches;
}

export function WorkspaceApp({ initialLang = "id", initialTheme = "light" }) {
  const [lang, setLang] = React.useState(localStorage.getItem("pdfin-ws-lang") || initialLang);
  const [theme, setTheme] = React.useState(localStorage.getItem("pdfin-ws-theme") || initialTheme);
  const [tool, setTool] = React.useState(hashTool());
  const [files, setFiles] = React.useState([]);
  const [pages, setPages] = React.useState([]);
  const [selection, setSelection] = React.useState(new Set());
  const [opts, setOpts] = React.useState(DEFS[hashTool()].defaults);
  const [stage, setStage] = React.useState("empty");
  const [progress, setProgress] = React.useState(0);
  const [procLabel, setProcLabel] = React.useState("");
  const [result, setResult] = React.useState(null);
  const [errMsg, setErrMsg] = React.useState("");
  const [switcher, setSwitcher] = React.useState(false);
  const [inspOpen, setInspOpen] = React.useState(true);
  const [activeCompactPanel, setActiveCompactPanel] = React.useState("files");
  const [toasts, setToasts] = React.useState([]);
  const [recent, setRecent] = React.useState(() => { try { return JSON.parse(localStorage.getItem("pdfin-ws-recent") || "[]"); } catch (e) { return []; } });
  const undoStack = React.useRef([]);
  const cancelled = React.useRef(false);
  const t = PDFIN_T[lang];
  const def = DEFS[tool];
  const isCompact = useMediaQuery("(max-width: 1023px)");
  const isMobile = useMediaQuery("(max-width: 767px)");

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("lang", lang);
    localStorage.setItem("pdfin-ws-theme", theme);
    localStorage.setItem("pdfin-ws-lang", lang);
  }, [theme, lang]);

  React.useEffect(() => {
    const onHash = () => switchTool(hashTool(), false);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  });

  React.useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSwitcher((s) => !s); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && undoStack.current.length) {
        if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") { e.preventDefault(); undo(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  const toast = (msg, tone = "neutral", action = null) => {
    const id = Date.now() + Math.random();
    setToasts((ts) => [...ts, { id, msg, tone, action }]);
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 5000);
  };

  const switchTool = (next, pushHash = true) => {
    if (next === tool) { setSwitcher(false); return; }
    // Files with a mismatched kind (images vs pdf) don't carry across
    const nextDef = DEFS[next];
    const keep = !!files.length && !!nextDef.acceptImages === !!def.acceptImages;
    setTool(next);
    setOpts(nextDef.defaults);
    setSelection(new Set());
    setResult(null); setErrMsg("");
    undoStack.current = [];
    if (!keep) { PdfEngine.reset(); PdfProcess.clearCache(); setFiles([]); setPages([]); setStage("empty"); }
    else setStage(files.length ? "ready" : "empty");
    if (pushHash) location.hash = next;
    setSwitcher(false);
  };

  const addFiles = async (fileList) => {
    try {
      const added = [];
      for (const f of fileList) {
        const rec = def.acceptImages ? await PdfEngine.loadImage(f) : await PdfEngine.loadFile(f);
        added.push(rec);
      }
      let base = def.multiFile ? files : [];
      if (!def.multiFile && files.length) { files.forEach((f) => PdfEngine.removeFile(f.id)); setPages([]); }
      const nextFiles = [...base, ...added.map((r) => ({ id: r.id, name: r.name, size: r.size, pageCount: r.pageCount, isImage: !!r.isImage }))];
      setFiles(nextFiles);
      setPages((prev) => {
        const kept = def.multiFile ? prev : [];
        const extra = [];
        added.forEach((r) => { for (let i = 0; i < r.pageCount; i++) extra.push({ uid: nextUid(), fileId: r.id, srcIndex: i, rotation: 0 }); });
        return [...kept, ...extra];
      });
      setStage("ready");
      const names = [...new Set([...added.map((r) => r.name), ...recent])].slice(0, 6);
      setRecent(names);
      localStorage.setItem("pdfin-ws-recent", JSON.stringify(names));
    } catch (e) {
      console.warn(e);
      setErrMsg(lang === "id" ? "File tidak dapat dibaca. Pastikan file PDF valid dan tidak terenkripsi." : "The file could not be read. Make sure it is a valid, unencrypted PDF.");
      setStage("error");
    }
  };

  const addSample = async () => {
    if (def.acceptImages) {
      const mk = (label, hue) => new Promise((res) => {
        const c = document.createElement("canvas"); c.width = 1200; c.height = 900;
        const g = c.getContext("2d");
        g.fillStyle = hue; g.fillRect(0, 0, 1200, 900);
        g.fillStyle = "rgba(255,255,255,0.85)"; g.font = "600 64px sans-serif"; g.fillText(label, 60, 120);
        g.fillStyle = "rgba(255,255,255,0.25)"; for (let i = 0; i < 5; i++) g.fillRect(60, 200 + i * 110, 1080 - i * 150, 60);
        c.toBlob((b) => res(new File([b], label.toLowerCase().replace(" ", "-") + ".jpg", { type: "image/jpeg" })), "image/jpeg", 0.9);
      });
      addFiles([await mk("Foto rapat 1", "#5518B4"), await mk("Foto rapat 2", "#128FA6"), await mk("Foto rapat 3", "#370C7C")]);
    } else {
      const f1 = await PdfEngine.makeSamplePdf(12, "contoh-laporan-tahunan.pdf");
      if (def.multiFile && tool === "merge") {
        const f2 = await PdfEngine.makeSamplePdf(5, "contoh-lampiran.pdf");
        addFiles([f1, f2]);
      } else addFiles([f1]);
    }
  };

  const removeFile = (id) => {
    PdfEngine.removeFile(id);
    const nf = files.filter((f) => f.id !== id);
    setFiles(nf);
    setPages((ps) => ps.filter((p) => p.fileId !== id));
    if (!nf.length) setStage("empty");
  };

  const moveFile = (from, to) => {
    const nf = [...files];
    const [m] = nf.splice(from, 1);
    nf.splice(to, 0, m);
    setFiles(nf);
    // rebuild page order to follow file order
    setPages((ps) => nf.flatMap((f) => ps.filter((p) => p.fileId === f.id)));
  };

  // ---- page ops with undo ----
  const snapshot = () => { undoStack.current.push(pages); if (undoStack.current.length > 30) undoStack.current.shift(); };
  const undo = () => {
    const prev = undoStack.current.pop();
    if (prev) { setPages(prev); setSelection(new Set()); }
  };
  const pageOps = {
    reorder: (from, to) => { snapshot(); setPages((ps) => { const n = [...ps]; const [m] = n.splice(from, 1); n.splice(to, 0, m); return n; }); },
    rotate: (uids, delta) => { snapshot(); setPages((ps) => ps.map((p) => uids.includes(p.uid) ? { ...p, rotation: ((p.rotation + delta) % 360 + 360) % 360 } : p)); },
    remove: (uids) => {
      snapshot();
      setPages((ps) => ps.filter((p) => !uids.includes(p.uid)));
      setSelection(new Set());
      toast(lang === "id" ? `${uids.length} halaman dihapus.` : `${uids.length} page(s) deleted.`, "neutral",
        <Button variant="ghost" size="sm" onClick={undo}>{t.stage.undo}</Button>);
    },
    duplicate: (uids) => {
      snapshot();
      setPages((ps) => ps.flatMap((p) => uids.includes(p.uid) ? [p, { ...p, uid: nextUid() }] : [p]));
    },
  };

  const ctx = { files, pages, selection, setSelection, pageOps };

  const run = async () => {
    cancelled.current = false;
    setStage("processing"); setProgress(0);
    setProcLabel(def.processLabel ? def.processLabel(t, lang) : t.stage.processing);
    const t0 = performance.now();
    try {
      const res = await def.process(ctx, opts, (pct) => setProgress(Math.round(pct)), lang);
      if (cancelled.current) return;
      setResult({ ...res, ms: performance.now() - t0 });
      setStage("done");
    } catch (e) {
      console.warn(e);
      if (!cancelled.current) { setErrMsg(""); setStage("error"); }
    }
  };
  const cancel = () => { cancelled.current = true; setStage(files.length ? "ready" : "empty"); };

  const download = (o) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(o.blob);
    a.download = o.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };
  const downloadAll = () => result.outputs.forEach((o, i) => setTimeout(() => download(o), i * 350));
  const continuationActions = React.useMemo(() => {
    if (!result || !result.outputs?.length) return [];
    const hasPdfOutput = result.outputs.some((o) => /\.pdf$/i.test(o.name) || o.blob?.type === "application/pdf");
    if (!hasPdfOutput) return [];
    return ["compress", "split", "watermark"]
      .filter((id) => id !== tool && TOOL_IDS.includes(id))
      .map((id) => ({ tool: id, label: t.toolNames[id] }));
  }, [result, tool, t.toolNames]);

  // ---- main content by stage ----
  const selectable = def.selectable != null ? def.selectable : def.selectableWhen ? def.selectableWhen(opts) : false;
  const processDisabled = def.disabled ? def.disabled(ctx, opts) : false;
  const disabledReason = processDisabled
    ? (def.disabledReason ? def.disabledReason(ctx, opts, t, lang) : t.toolRequirements[tool])
    : "";
  const nextAction = processDisabled
    ? disabledReason
    : (def.nextAction ? def.nextAction(ctx, opts, t, lang) : t.cta.ready);
  let main;
  if (stage === "processing") main = <ProcessingView t={t} progress={progress} label={procLabel} onCancel={cancel} />;
  else if (stage === "done") main = (
    <SuccessView t={t} result={result} note={def.simulated ? t.sim : null}
      summary={def.successSummary ? def.successSummary(result, ctx, opts, t, lang) : null}
      onDownload={download} onDownloadAll={downloadAll}
      onBack={() => setStage("ready")} onRestart={() => switchToolResetSame()}
      continuationActions={continuationActions} onContinue={(next) => switchTool(next)} />
  );
  else if (stage === "error") main = <ErrorView t={t} message={errMsg} onRetry={() => setStage(files.length ? "ready" : "empty")} onRestart={() => switchToolResetSame()} />;
  else if (stage === "empty") main = <EmptyState t={t} tool={tool} onFiles={addFiles} onSample={addSample} acceptImages={def.acceptImages} />;
  else if (def.view === "preview") main = (
    <DocPreview t={t} pages={pages} overlay={def.overlay ? def.overlay(opts, setOpts) : null} compact={isCompact} />
  );
  else main = (
    <PageGrid t={t} pages={pages} selection={selection}
      setSelection={selectable ? setSelection : () => {}}
      cardWidth={isMobile ? 136 : 148}
      compact={isCompact}
      selectable={selectable}
      onReorder={def.reorder ? pageOps.reorder : null}
      onRotate={def.pageActions || tool === "rotate" ? pageOps.rotate : null}
      onDelete={def.pageActions ? pageOps.remove : null}
      onDuplicate={def.pageActions ? pageOps.duplicate : null} />
  );

  function switchToolResetSame() {
    PdfEngine.reset(); PdfProcess.clearCache();
    setFiles([]); setPages([]); setSelection(new Set());
    setOpts(def.defaults); setResult(null); setStage("empty");
    undoStack.current = [];
  }

  const showInspector = (stage === "ready") && def.Panel;
  const sidebarPanel = stage !== "done" && stage !== "error" ? (
    <Sidebar t={t} lang={lang} files={files} recent={recent}
      onAdd={addFiles} onSample={addSample} onRemove={removeFile} onMoveFile={moveFile}
      stage={stage} progress={progress} acceptImages={def.acceptImages}
      allowReorder={def.allowReorderFiles}
      compact={isCompact}
      hideShortcuts={isCompact} />
  ) : null;
  const processAction = showInspector ? (
    <ProcessActionBar
      t={t}
      label={t.toolNames[tool]}
      disabled={processDisabled}
      helper={nextAction}
      onRun={run}
    />
  ) : null;
  const settingsPanel = showInspector ? (
    <section className="ws-compact-panel" aria-label={t.workspaceTabs.settings}>
      <div className="ws-compact-panel__header">
        <h2>{t.inspector.title}</h2>
        {def.simulated && <Badge tone="warning">{t.release.prototype}</Badge>}
      </div>
      <div className="ws-compact-panel__body">
        <def.Panel t={t} lang={lang} opts={opts} setOpts={setOpts} ctx={ctx} />
      </div>
    </section>
  ) : null;
  const compactReadyMain = activeCompactPanel === "files"
    ? sidebarPanel
    : activeCompactPanel === "settings" && settingsPanel
      ? settingsPanel
      : main;
  const tabs = [
    ["files", t.workspaceTabs.files],
    ["pages", t.workspaceTabs.pages],
    ...(showInspector ? [["settings", t.workspaceTabs.settings]] : []),
  ];
  const compactPanelId = `workspace-panel-${activeCompactPanel}`;
  const compactTabId = `workspace-tab-${activeCompactPanel}`;
  const liveStatus = stage === "processing"
    ? `${t.a11y.processing} ${t.toolNames[tool]}${progress ? ` ${progress}%` : ""}.`
    : stage === "done"
      ? `${t.toolNames[tool]} ${t.a11y.completed}.`
      : "";
  const liveError = stage === "error" ? (errMsg || t.error.body) : "";

  const focusWorkspaceMain = (event) => {
    event.preventDefault();
    const target = document.getElementById("workspace-main");
    if (target) {
      target.focus();
    }
  };

  React.useEffect(() => {
    if (stage !== "ready") {
      setActiveCompactPanel("files");
    } else if (isCompact && activeCompactPanel === "settings" && !showInspector) {
      setActiveCompactPanel("pages");
    }
  }, [activeCompactPanel, isCompact, showInspector, stage]);

  return (
    <div className={isCompact ? "ws-root is-compact" : "ws-root"} style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--surface-page)", overflow: "hidden" }}>
      <a className="skip-link" href="#workspace-main" onClick={focusWorkspaceMain}>{t.a11y.skipWorkspace}</a>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true" aria-label={t.a11y.workspaceStatus}>
        {liveStatus}
      </div>
      {liveError && (
        <div className="sr-only" role="alert" aria-live="assertive" aria-atomic="true" aria-label={t.a11y.workspaceError}>
          {liveError}
        </div>
      )}
      <WorkspaceTopNav t={t} tool={tool} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} onOpenSwitcher={() => setSwitcher(true)} compact={isCompact} />
      <div className={isCompact ? "ws-body is-compact" : "ws-body"} style={{ flex: 1, display: "flex", minHeight: 0 }} data-screen-label={t.toolNames[tool]}>
        {!isCompact && sidebarPanel}
        <main id="workspace-main" tabIndex={-1} className="ws-main" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, position: "relative" }}>
          {stage === "ready" && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: isCompact ? "10px 14px 0" : "10px 24px 0" }}>
              <PrivacyPill lang={lang} />
              {selectable && (
                <span style={{ font: "var(--type-caption)", color: "var(--text-faint)" }}>
                  {selection.size ? `${selection.size} ${t.select.selected}` : t.empty.hintKeyboard.split(",")[0]}
                </span>
              )}
            </div>
          )}
          {isCompact && stage === "ready" ? (
            <div
              id={compactPanelId}
              role="tabpanel"
              aria-labelledby={compactTabId}
              style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
            >
              {compactReadyMain}
            </div>
          ) : main}
        </main>
        {!isCompact && showInspector && (
          <aside style={{
            width: inspOpen ? 300 : 44, flex: "none", borderLeft: "1px solid var(--border-default)",
            background: "var(--surface-card)", display: "flex", flexDirection: "column",
            transition: "width var(--duration-base) var(--ease-out)", overflow: "hidden",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: inspOpen ? "12px 14px" : "12px 8px", borderBottom: inspOpen ? "1px solid var(--border-default)" : "none" }}>
              <IconButton size="sm" label={inspOpen ? t.inspector.collapse : t.inspector.expand} onClick={() => setInspOpen(!inspOpen)}
                icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{inspOpen ? <path d="m9 18 6-6-6-6"></path> : <path d="m15 18-6-6 6-6"></path>}</svg>} />
              {inspOpen && <h2 style={{ font: "var(--weight-semibold) 13px/1 var(--font-sans)", color: "var(--text-heading)", margin: 0, flex: 1 }}>{t.inspector.title}</h2>}
              {inspOpen && def.simulated && <Badge tone="warning">{t.release.prototype}</Badge>}
            </div>
            {inspOpen && (
              <React.Fragment>
                <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
                  <def.Panel t={t} lang={lang} opts={opts} setOpts={setOpts} ctx={ctx} />
                </div>
                <div style={{ padding: 14, borderTop: "1px solid var(--border-default)" }}>
                  {processAction}
                </div>
              </React.Fragment>
            )}
          </aside>
        )}
        {isCompact && stage === "ready" && (
          <div className="ws-compact-tabs" role="tablist" aria-label={t.toolNames[tool]}>
            {tabs.map(([id, label]) => (
              <button
                key={id}
                id={`workspace-tab-${id}`}
                type="button"
                role="tab"
                aria-selected={activeCompactPanel === id}
                aria-controls={`workspace-panel-${id}`}
                className={activeCompactPanel === id ? "ws-compact-tab is-active" : "ws-compact-tab"}
                onClick={() => setActiveCompactPanel(id)}
              >
                {label}
              </button>
            ))}
          </div>
        )}
        {isCompact && stage === "ready" && showInspector && (
          <div className="ws-mobile-cta">
            {processAction}
          </div>
        )}
      </div>
      {switcher && <QuickSwitcher t={t} toolIds={TOOL_IDS} current={tool} onPick={switchTool} onClose={() => setSwitcher(false)} />}
      <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", gap: 8, zIndex: 90, alignItems: "center" }}>
        {toasts.map((x) => (
          <Toast key={x.id} tone={x.tone} action={x.action} onDismiss={() => setToasts((ts) => ts.filter((y) => y.id !== x.id))}>{x.msg}</Toast>
        ))}
      </div>
    </div>
  );
}
