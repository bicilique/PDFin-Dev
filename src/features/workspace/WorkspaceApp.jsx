import React from "react";
import { Badge, Button, IconButton, MobileBottomSheet, Modal, PrivacyPill, Toast, ZoomControl } from "../../components/index.js";
import { trackPdfEvent } from "../../app/analytics.js";
import { applyTheme, getInitialTheme, migrateLegacyThemePreference, persistExplicitTheme } from "../../app/theme.js";
import { getPersistedLang, persistLangPreference } from "../../app/locale.js";
import { getToolFromHash, getToolFromPath, getToolHref } from "../../app/toolRoutes.js";
import { PDFIN_T } from "./i18n.js";
import { PdfEngine } from "./engine/pdfEngine.js";
import { PdfProcess } from "./engine/pdfProcess.js";
import { EmptyState, ErrorView, ProcessingView, ProcessActionBar, QuickSwitcher, SuccessView, WorkspaceTopNav, WSIcons } from "./WorkspaceShell.jsx";
import { DocPreview, LazyThumb, PageGrid, Sidebar } from "./WorkspaceViews.jsx";
import { TOOL_DEFS } from "./tools/tools-1.jsx";
import "./tools/tools-2.jsx";
import "./tools/tools-3.jsx";
import "./tools/tools-4.jsx";
import { WORKSPACE_TOOL_IDS } from "./toolCatalog.js";
import "./workspace-responsive.css";

// PDFin workspace — app shell: routing, state machine, file/page model, undo, downloads.
const DEFS = TOOL_DEFS;
const TOOL_IDS = WORKSPACE_TOOL_IDS;

let uidCounter = 1;
const nextUid = () => "p" + uidCounter++;
let pendingFileCounter = 1;
const nextPendingFileId = () => "pending-" + pendingFileCounter++;

function createPageInstance(data) {
  const pageInstanceId = data.pageInstanceId || nextUid();
  return {
    ...data,
    pageInstanceId,
    uid: pageInstanceId,
  };
}

const pageIdentity = (page) => page.pageInstanceId || page.uid;
const countPages = (items = []) => items.reduce((sum, item) => sum + (Number(item.pageCount ?? item.pages) || 0), 0);

function workspaceAnalyticsPayload(tool, files = [], pages = [], extras = {}) {
  return {
    tool,
    file_count: files.length,
    page_count: pages.length || countPages(files),
    ...extras,
  };
}

function inferFileType(files = []) {
  if (!files.length) return "unknown";
  const hasImage = files.some((file) => file.isImage);
  const hasPdf = files.some((file) => !file.isImage);
  if (hasImage && hasPdf) return "mixed";
  return hasImage ? "image" : "pdf";
}

function fileSizeBucketFromBytes(totalBytes = 0) {
  const bytes = Math.max(0, Number(totalBytes) || 0);
  const tenMB = 10 * 1024 * 1024;
  const fiftyMB = 50 * 1024 * 1024;

  if (bytes >= fiftyMB) return "50MB+";
  if (bytes >= tenMB) return "10-50MB";
  return "0-10MB";
}

function fileBatchSummary(files = []) {
  const totalBytes = files.reduce((sum, file) => sum + (Number(file.size) || 0), 0);
  return {
    file_type: inferFileType(files),
    file_size_bucket: fileSizeBucketFromBytes(totalBytes),
    file_count: files.length,
    page_count: countPages(files),
  };
}

function processErrorCategory(tool, error) {
  if (tool === "protect") return "protect_failed";
  const message = String(error?.message || error || "").toLowerCase();
  if (message.includes("password") || message.includes("encrypted")) return "encrypted_or_password";
  if (message.includes("abort")) return "aborted";
  return "processing_failed";
}

function hashTool() {
  return getToolFromPath() || getToolFromHash() || "merge";
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

function SplitSelectionToolbar({ lang, selectedCount, totalCount, onSelectAll, onClear }) {
  const allSelected = totalCount > 0 && selectedCount === totalCount;
  return (
    <div style={{
      position: "sticky",
      top: 48,
      zIndex: 4,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      flexWrap: "wrap",
      margin: "0 0 14px",
      padding: "10px 12px",
      border: "1px solid var(--border-brand)",
      borderRadius: "var(--radius-md)",
      background: "var(--surface-card)",
      boxShadow: "var(--shadow-card)",
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 180 }}>
        <span style={{ font: "var(--weight-semibold) 12.5px/1.25 var(--font-sans)", color: "var(--text-heading)" }}>
          {lang === "id" ? `${selectedCount} dari ${totalCount} halaman dipilih` : `${selectedCount} of ${totalCount} pages selected`}
        </span>
        <span style={{ font: "11.5px/1.35 var(--font-sans)", color: "var(--text-muted)" }}>
          {lang === "id" ? "Mode Pilih halaman aktif. Halaman terpilih akan dibuat menjadi 1 file PDF." : "Select pages mode is active. Selected pages will become 1 PDF file."}
        </span>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button size="sm" variant="secondary" disabled={!totalCount} onClick={allSelected ? onClear : onSelectAll}>
          {allSelected ? (lang === "id" ? "Hapus semua" : "Clear all") : (lang === "id" ? "Pilih semua" : "Select all")}
        </Button>
        <Button size="sm" variant="ghost" disabled={!selectedCount} onClick={onClear}>
          {lang === "id" ? "Hapus pilihan" : "Clear selection"}
        </Button>
      </div>
    </div>
  );
}

export function WorkspaceApp({ initialLang = "id", initialTheme = "light", onHome, onLangChange }) {
  const [lang, setLang] = React.useState(getPersistedLang() || initialLang);
  const [theme, setTheme] = React.useState(() => getInitialTheme(initialTheme));
  const [tool, setTool] = React.useState(hashTool());
  const [files, setFiles] = React.useState([]);
  const [pages, setPages] = React.useState([]);
  const [selection, setSelection] = React.useState(new Set());
  const [opts, setOpts] = React.useState(DEFS[hashTool()].defaults);
  // Standalone tools (e.g. Markdown to PDF) have no file-upload empty state.
  const [stage, setStage] = React.useState(() => (DEFS[hashTool()].standalone ? "ready" : "empty"));
  const [progress, setProgress] = React.useState(0);
  const [procLabel, setProcLabel] = React.useState("");
  const [result, setResult] = React.useState(null);
  const [errMsg, setErrMsg] = React.useState("");
  const [switcher, setSwitcher] = React.useState(false);
  const [inspOpen, setInspOpen] = React.useState(true);
  const [activeCompactPanel, setActiveCompactPanel] = React.useState("files");
  const [mobileSheet, setMobileSheet] = React.useState(null);
  const [toasts, setToasts] = React.useState([]);
  const [pageGridZoom, setPageGridZoom] = React.useState(100);
  const [previewPageUid, setPreviewPageUid] = React.useState(null);
  const [previewCurrentPage, setPreviewCurrentPage] = React.useState(1);
  const [workspaceDrag, setWorkspaceDrag] = React.useState(false);
  const [lastMovedPageUid, setLastMovedPageUid] = React.useState(null);
  const [focusFirstSelectionTick, setFocusFirstSelectionTick] = React.useState(0);
  const [recent, setRecent] = React.useState(() => {
    try {
      if (localStorage.getItem("pdfin-ws-recent")) localStorage.removeItem("pdfin-ws-recent");
      return JSON.parse(localStorage.getItem("pdfin-ws-recent-tools") || "[]").filter((id) => TOOL_IDS.includes(id));
    } catch {
      return [];
    }
  });
  const undoStack = React.useRef([]);
  const cancelled = React.useRef(false);
  const duplicatingRef = React.useRef(false);
  const processingRef = React.useRef(false);
  const processingAbortRef = React.useRef(null);
  const previewNavigationRef = React.useRef(null);
  const t = PDFIN_T[lang];
  const def = DEFS[tool];
  const isCompact = useMediaQuery("(max-width: 1023px)");
  const isMobile = useMediaQuery("(max-width: 767px)");

  const setExplicitTheme = React.useCallback((nextTheme) => {
    setTheme(nextTheme);
    persistExplicitTheme(nextTheme);
  }, []);

  React.useEffect(() => {
    applyTheme(theme);
    document.documentElement.setAttribute("lang", lang);
    persistLangPreference(lang);
  }, [theme, lang]);

  React.useEffect(() => {
    onLangChange?.(lang);
  }, [onLangChange, lang]);

  React.useEffect(() => {
    migrateLegacyThemePreference();
  }, []);

  React.useEffect(() => {
    trackPdfEvent("pdf_tool_opened", { tool });
  }, [tool]);

  React.useEffect(() => {
    const onRoute = () => switchTool(hashTool(), false);
    window.addEventListener("hashchange", onRoute);
    window.addEventListener("popstate", onRoute);
    return () => {
      window.removeEventListener("hashchange", onRoute);
      window.removeEventListener("popstate", onRoute);
    };
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
    setToasts((ts) => {
      const withoutSame = ts.filter((x) => x.msg !== msg);
      return [...withoutSame, { id, msg, tone, action }].slice(-2);
    });
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 5000);
  };

  const switchTool = (next, pushHash = true) => {
    if (next === tool) { setSwitcher(false); return; }
    // Files with a mismatched kind (images vs pdf) don't carry across
    const nextDef = DEFS[next];
    const keep = !!files.length && !nextDef.standalone && !def.standalone && !!nextDef.acceptImages === !!def.acceptImages;
    setTool(next);
    setOpts(nextDef.defaults);
    setSelection(new Set());
    setResult(null); setErrMsg("");
    undoStack.current = [];
    if (!keep) { PdfEngine.reset(); PdfProcess.clearCache(); setFiles([]); setPages([]); setStage(nextDef.standalone ? "ready" : "empty"); }
    else setStage(files.length ? "ready" : "empty");
    if (pushHash) window.history.pushState(null, "", getToolHref(next));
    setSwitcher(false);
  };

  const addFiles = async (fileList) => {
    const incoming = [...(fileList || [])];
    if (!incoming.length) return;

    if (!def.multiFile && files.length) {
      files.forEach((f) => PdfEngine.removeFile(f.id));
      setFiles([]);
      setPages([]);
    }

    setStage("ready");
    setResult(null);
    setErrMsg("");

    const seen = new Set((def.multiFile ? files : []).map((f) => f.fingerprint).filter(Boolean));
    const readyBatch = [];

    for (const file of incoming) {
      const fingerprint = await fileFingerprint(file);
      const validation = validateIncomingFile(file, fingerprint, seen, def.acceptImages, lang);
      const pendingId = nextPendingFileId();
      const pendingRecord = {
        id: pendingId,
        name: file.name || (def.acceptImages ? "gambar" : "dokumen.pdf"),
        size: file.size || 0,
        pageCount: 0,
        isImage: !!def.acceptImages,
        fingerprint,
        status: validation.ok ? "loading" : validation.status,
        error: validation.ok ? "" : validation.message,
      };

      setFiles((prev) => [...prev, pendingRecord]);

      if (!validation.ok) {
        toast(validation.message, validation.status === "duplicate" ? "info" : "error");
        continue;
      }

      seen.add(fingerprint);
      try {
        const rec = def.acceptImages ? await PdfEngine.loadImage(file) : await PdfEngine.loadFile(file);
        const readyRecord = {
          id: rec.id,
          name: rec.name,
          size: rec.size,
          pageCount: rec.pageCount,
          isImage: !!rec.isImage,
          fingerprint,
          status: "ready",
          error: "",
        };
        readyBatch.push(readyRecord);
        setFiles((prev) => prev.map((f) => (f.id === pendingId ? readyRecord : f)));
        setPages((prev) => {
          const kept = def.multiFile ? prev : [];
          const extra = [];
          for (let i = 0; i < rec.pageCount; i++) {
            extra.push(createPageInstance({
              fileId: rec.id,
              srcIndex: i,
              rotation: 0,
              sourceName: rec.name,
              sourcePageNumber: i + 1,
            }));
          }
          return [...kept, ...extra];
        });
      } catch (e) {
        console.warn(e);
        const message = classifyFileError(e, lang);
        setFiles((prev) => prev.map((f) => (f.id === pendingId ? { ...f, status: "error", error: message } : f)));
        toast(message, "error");
      }
    }

    if (readyBatch.length) {
      const uploadSummary = fileBatchSummary(readyBatch);
      trackPdfEvent("pdf_file_selected", {
        tool,
        ...uploadSummary,
      });
      trackPdfEvent("file_upload", {
        tool,
        ...uploadSummary,
      });
      const toolIds = [tool, ...recent.filter((id) => id !== tool)].slice(0, 6);
      setRecent(toolIds);
      localStorage.setItem("pdfin-ws-recent-tools", JSON.stringify(toolIds));
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
  const pushUndo = (prev) => { undoStack.current.push(prev); if (undoStack.current.length > 30) undoStack.current.shift(); };
  const undo = () => {
    const prev = undoStack.current.pop();
    if (prev) { setPages(prev); setSelection(new Set()); }
  };
  const pageOps = {
    reorder: (activeUid, overUid) => {
      setPages((ps) => {
        const live = ps.filter((p) => !p.deleted);
        const from = live.findIndex((p) => pageIdentity(p) === activeUid);
        const to = live.findIndex((p) => pageIdentity(p) === overUid);
        if (from < 0 || to < 0 || from === to) return ps;
        pushUndo(ps);
        const liveNext = [...live];
        const [m] = liveNext.splice(from, 1);
        liveNext.splice(to, 0, m);
        const deleted = ps.filter((p) => p.deleted);
        setLastMovedPageUid(activeUid);
        return [...liveNext, ...deleted];
      });
    },
    move: (uid, direction) => {
      setPages((ps) => {
        const live = ps.filter((p) => !p.deleted);
        const from = live.findIndex((p) => pageIdentity(p) === uid);
        if (from < 0) return ps;
        const to = direction === "next" ? from + 1 : from - 1;
        if (to < 0 || to >= live.length) return ps;
        pushUndo(ps);
        const liveNext = [...live];
        const [m] = liveNext.splice(from, 1);
        liveNext.splice(to, 0, m);
        const deleted = ps.filter((p) => p.deleted);
        setLastMovedPageUid(uid);
        return [...liveNext, ...deleted];
      });
    },
    moveByIndex: (from, to) => {
      setPages((ps) => {
        const live = ps.filter((p) => !p.deleted);
        if (from < 0 || to < 0 || from >= live.length || to >= live.length || from === to) return ps;
        pushUndo(ps);
        const liveNext = [...live];
        const [m] = liveNext.splice(from, 1);
        liveNext.splice(to, 0, m);
        const deleted = ps.filter((p) => p.deleted);
        setLastMovedPageUid(pageIdentity(m));
        return [...liveNext, ...deleted];
      });
    },
    rotate: (uids, delta) => { snapshot(); setPages((ps) => ps.map((p) => uids.includes(pageIdentity(p)) ? { ...p, rotation: ((p.rotation + delta) % 360 + 360) % 360 } : p)); },
    remove: (uids) => {
      snapshot();
      setPages((ps) => ps.filter((p) => !uids.includes(pageIdentity(p))));
      setSelection(new Set());
      toast(lang === "id" ? `${uids.length} halaman dihapus.` : `${uids.length} page(s) deleted.`, "neutral",
        <Button variant="ghost" size="sm" onClick={undo}>{t.stage.undo}</Button>);
    },
    duplicate: (uids) => {
      if (duplicatingRef.current) return;
      duplicatingRef.current = true;
      queueMicrotask(() => { duplicatingRef.current = false; });
      const requested = new Set(uids);
      setPages((ps) => {
        const live = ps.filter((p) => !p.deleted);
        const selectedInOrder = live.filter((p) => requested.has(pageIdentity(p)));
        if (!selectedInOrder.length) return ps;
        pushUndo(ps);
        const duplicateIds = [];
        const liveNext = live.flatMap((p) => {
          if (!requested.has(pageIdentity(p))) return [p];
          const copy = createPageInstance({
            ...p,
            pageInstanceId: undefined,
            uid: undefined,
            duplicateOf: pageIdentity(p),
            transientBadge: lang === "id" ? "Salinan" : "Copy",
          });
          duplicateIds.push(copy.pageInstanceId);
          return [p, copy];
        });
        const deleted = ps.filter((p) => p.deleted);
        setSelection(new Set(duplicateIds));
        setLastMovedPageUid(duplicateIds[0] || null);
        toast(lang === "id" ? `${duplicateIds.length} halaman diduplikat.` : `${duplicateIds.length} page(s) duplicated.`, "neutral",
          <Button variant="ghost" size="sm" onClick={undo}>{t.stage.undo}</Button>);
        return [...liveNext, ...deleted];
      });
    },
  };

  const validFiles = files.filter((f) => f.status === "ready");
  const loadingFiles = files.filter((f) => f.status === "loading");
  const ctx = {
    files,
    validFiles,
    loadingFiles,
    pages,
    selection,
    setSelection,
    pageOps,
    previewPage: previewCurrentPage,
    goToPreviewPage: (pageNumber) => previewNavigationRef.current?.goToPage(pageNumber),
  };

  const run = async () => {
    if (processingRef.current || processDisabled) return;
    processingRef.current = true;
    cancelled.current = false;
    const abortController = new AbortController();
    processingAbortRef.current = abortController;
    trackPdfEvent("pdf_process_started", workspaceAnalyticsPayload(tool, validFiles, pages));
    if (def.standalone) {
      // Standalone tools never go through addFiles, so track recent usage here.
      const toolIds = [tool, ...recent.filter((id) => id !== tool)].slice(0, 6);
      setRecent(toolIds);
      localStorage.setItem("pdfin-ws-recent-tools", JSON.stringify(toolIds));
    }
    setStage("processing"); setProgress(0);
    setProcLabel(def.processLabel ? def.processLabel(t, lang) : t.stage.processing);
    const t0 = performance.now();
    try {
      const res = await def.process(ctx, { ...opts, signal: abortController.signal }, (pct, detail) => {
        setProgress(Math.round(pct));
        if (def.progressLabel && detail) setProcLabel(def.progressLabel(detail, t, lang));
      }, lang);
      if (cancelled.current) return;
      if (def.afterProcessOpts) setOpts((current) => def.afterProcessOpts(current, res));
      const durationMs = performance.now() - t0;
      setResult({ ...res, ms: durationMs });
      const convertSummary = fileBatchSummary(validFiles);
      trackPdfEvent("pdf_process_completed", workspaceAnalyticsPayload(tool, validFiles, pages, {
        output_count: res.outputs?.length || 0,
        duration_ms: durationMs,
        ...convertSummary,
      }));
      trackPdfEvent("pdf_convert_success", workspaceAnalyticsPayload(tool, validFiles, pages, {
        ...convertSummary,
        output_count: res.outputs?.length || 0,
        duration_ms: durationMs,
      }));
      setStage("done");
    } catch (e) {
      if (tool !== "protect") console.warn(e);
      if (!cancelled.current) {
        const message = tool === "protect"
          ? (lang === "id" ? "PDF tidak dapat dikunci. Pastikan file valid, belum dilindungi password, dan coba lagi." : "The PDF could not be protected. Make sure it is valid, not already password-protected, and try again.")
          : "";
        setErrMsg(message);
        trackPdfEvent("pdf_process_failed", workspaceAnalyticsPayload(tool, validFiles, pages, {
          error_category: processErrorCategory(tool, e),
        }));
        setStage("error");
      }
    } finally {
      processingRef.current = false;
      if (processingAbortRef.current === abortController) processingAbortRef.current = null;
      if (def.sanitizeAfterProcess) setOpts((current) => def.sanitizeAfterProcess(current));
    }
  };
  const cancel = () => {
    cancelled.current = true;
    processingRef.current = false;
    processingAbortRef.current?.abort();
    trackPdfEvent("pdf_process_cancelled", workspaceAnalyticsPayload(tool, validFiles, pages));
    if (def.sanitizeAfterProcess) setOpts((current) => def.sanitizeAfterProcess(current));
    setStage(def.standalone || files.length ? "ready" : "empty");
  };

  const download = (o) => {
    const outputPayload = fileBatchSummary(validFiles);
    trackPdfEvent("pdf_download_clicked", workspaceAnalyticsPayload(tool, validFiles, pages, {
      output_count: 1,
      page_count: Number(o.pages) || pages.length || countPages(validFiles),
      ...outputPayload,
      file_size_bucket: fileSizeBucketFromBytes(Number(o.size) || 0),
      file_type: "pdf",
    }));
    trackPdfEvent("pdf_download", workspaceAnalyticsPayload(tool, validFiles, pages, {
      output_count: 1,
      page_count: Number(o.pages) || pages.length || countPages(validFiles),
      ...outputPayload,
      file_size_bucket: fileSizeBucketFromBytes(Number(o.size) || 0),
      file_type: "pdf",
    }));
    const a = document.createElement("a");
    a.href = URL.createObjectURL(o.blob);
    a.download = o.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };
  const downloadAll = () => result.outputs.forEach((o, i) => setTimeout(() => download(o), i * 350));
  // Standalone tools have no source files to carry over, so continuation loads the
  // generated PDF output into the next tool instead.
  const continuationFileRef = React.useRef(null);
  const continueWith = (next) => {
    if (def.standalone && result?.outputs?.length) {
      const output = result.outputs.find((o) => /\.pdf$/i.test(o.name));
      if (output) continuationFileRef.current = new File([output.blob], output.name, { type: "application/pdf" });
    }
    switchTool(next);
  };
  React.useEffect(() => {
    if (!continuationFileRef.current) return;
    const file = continuationFileRef.current;
    continuationFileRef.current = null;
    if (!DEFS[tool].standalone && !DEFS[tool].acceptImages) addFiles([file]);
  }, [tool]);
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
  const processDisabled = def.disabled ? def.disabled(ctx, opts, lang) : false;
  const disabledReason = processDisabled
    ? (def.disabledReason ? def.disabledReason(ctx, opts, t, lang) : t.toolRequirements[tool])
    : "";
  const nextAction = processDisabled
    ? disabledReason
    : (def.nextAction ? def.nextAction(ctx, opts, t, lang) : t.cta.ready);
  const processLabel = def.actionLabel ? def.actionLabel(ctx, opts, t, lang) : t.toolNames[tool];

  const splitLivePages = pages.filter((p) => !p.deleted);
  const splitRangePageUids = React.useMemo(() => {
    if (tool !== "split" || opts.mode !== "range") return new Set();
    const parsed = PdfProcess.parseRange(opts.range, splitLivePages.length);
    return new Set(parsed.map((pageIndex) => splitLivePages[pageIndex] ? pageIdentity(splitLivePages[pageIndex]) : null).filter(Boolean));
  }, [tool, opts.mode, opts.range, splitLivePages.map((p) => pageIdentity(p)).join("|")]);

  const activateSplitSelection = React.useCallback(() => {
    setOpts((next) => ({ ...next, mode: "selected" }));
    setFocusFirstSelectionTick((tick) => tick + 1);
  }, []);

  const toggleSplitPageSelection = React.useCallback((uid) => {
    setOpts((next) => next.mode === "selected" ? next : { ...next, mode: "selected" });
    setSelection((sel) => {
      const next = new Set(sel);
      if (next.has(uid)) next.delete(uid); else next.add(uid);
      return next;
    });
  }, []);

  const splitSelectionToolbar = tool === "split" && opts.mode === "selected" ? (
    <SplitSelectionToolbar
      lang={lang}
      selectedCount={selection.size}
      totalCount={splitLivePages.length}
      onSelectAll={() => setSelection(new Set(splitLivePages.map((p) => pageIdentity(p))))}
      onClear={() => setSelection(new Set())}
    />
  ) : null;
  const splitHeaderActions = tool === "split" && stage === "ready" ? (
    <Button size="sm" variant={opts.mode === "selected" ? "secondary" : "primary"} onClick={activateSplitSelection} icon={WSIcons.check(14)}>
      {lang === "id" ? "Pilih halaman" : "Select pages"}
    </Button>
  ) : null;
  let main;
  if (stage === "processing") main = <ProcessingView t={t} progress={progress} label={procLabel} onCancel={cancel} />;
  else if (stage === "done") main = (
    <SuccessView t={t} result={result} note={def.simulated ? t.sim : null}
      summary={def.successSummary ? def.successSummary(result, ctx, opts, t, lang) : null}
      onDownload={download} onDownloadAll={downloadAll}
      onBack={() => setStage("ready")} onRestart={() => switchToolResetSame()}
      continuationActions={continuationActions} onContinue={continueWith} />
  );
  else if (stage === "error") main = <ErrorView t={t} message={errMsg} onRetry={() => setStage(def.standalone || files.length ? "ready" : "empty")} onRestart={() => switchToolResetSame()} />;
  else if (def.Main) main = <def.Main t={t} lang={lang} opts={opts} setOpts={setOpts} ctx={ctx} isCompact={isCompact} isMobile={isMobile} onToast={toast} />;
  else if (stage === "empty") main = <EmptyState t={t} tool={tool} onFiles={addFiles} onSample={addSample} acceptImages={def.acceptImages} />;
  else if (def.view === "preview") main = (
    <DocPreview
      pages={pages}
      lang={lang}
      overlay={def.overlay ? def.overlay(opts, setOpts) : null}
      compact={isCompact}
      previewKind={def.previewKind || "source"}
      previewKey={def.previewKey ? def.previewKey(opts) : JSON.stringify(opts)}
      navigationRef={previewNavigationRef}
      onCurrentPageChange={setPreviewCurrentPage}
    />
  );
  else main = (
    <PageGrid t={t} pages={pages} selection={selection}
      setSelection={selectable ? setSelection : () => {}}
      cardWidth={Math.round((isMobile ? 136 : 148) * (pageGridZoom / 100))}
      compact={isCompact}
      selectable={selectable}
      zoom={pageGridZoom}
      onZoomIn={() => setPageGridZoom((z) => Math.min(180, z + 10))}
      onZoomOut={() => setPageGridZoom((z) => Math.max(70, z - 10))}
      onZoomReset={() => setPageGridZoom(100)}
      onPreview={(uid) => setPreviewPageUid(uid)}
      headerActions={splitHeaderActions}
      selectionToolbar={splitSelectionToolbar}
      checkboxSelection={tool === "split"}
      checkboxSelectionActive={opts.mode === "selected"}
      onTogglePageSelection={tool === "split" ? toggleSplitPageSelection : null}
      highlightedPageUids={splitRangePageUids}
      focusFirstSelectionTick={focusFirstSelectionTick}
      onReorder={def.reorder ? pageOps.reorder : null}
      onMovePage={def.reorder ? pageOps.move : null}
      lastMovedPageUid={lastMovedPageUid}
      onRotate={def.pageActions || tool === "rotate" ? pageOps.rotate : null}
      onDelete={def.pageActions ? pageOps.remove : null}
      onDuplicate={def.pageActions ? pageOps.duplicate : null} />
  );

  function switchToolResetSame() {
    PdfEngine.reset(); PdfProcess.clearCache();
    setFiles([]); setPages([]); setSelection(new Set());
    setOpts(def.defaults); setResult(null); setStage(def.standalone ? "ready" : "empty");
    undoStack.current = [];
  }

  const showInspector = (stage === "ready") && def.Panel;
  const sidebarPanel = !def.standalone && stage !== "done" && stage !== "error" ? (
    <Sidebar t={t} lang={lang} files={files} recent={recent}
      onAdd={addFiles} onSample={addSample} onRemove={removeFile} onMoveFile={moveFile}
      stage={stage} progress={progress} acceptImages={def.acceptImages}
      allowReorder={def.allowReorderFiles}
      compact={isCompact}
      hideShortcuts={isCompact} />
  ) : null;
  const livePages = pages.filter((p) => !p.deleted);
  const previewIndex = previewPageUid ? livePages.findIndex((p) => p.uid === previewPageUid) : -1;
  const previewPage = previewIndex >= 0 ? livePages[previewIndex] : null;
  const processAction = showInspector ? (
    <ProcessActionBar
      t={t}
      label={processLabel}
      disabled={processDisabled}
      helper={nextAction}
      onRun={run}
      actionFields={def.ActionFields ? <def.ActionFields t={t} lang={lang} opts={opts} setOpts={setOpts} ctx={ctx} /> : null}
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
  const compactReadyMain = activeCompactPanel === "files" && sidebarPanel
    ? sidebarPanel
    : activeCompactPanel === "settings" && settingsPanel
      ? settingsPanel
      : main;
  const tabs = [
    ...(def.standalone ? [] : [["files", t.workspaceTabs.files]]),
    ["pages", def.standalone ? t.workspaceTabs.editor : t.workspaceTabs.pages],
    ...(showInspector ? [["settings", t.workspaceTabs.settings]] : []),
  ];
  const compactPanelId = `workspace-panel-${activeCompactPanel}`;
  const compactTabId = `workspace-tab-${activeCompactPanel}`;
  const liveStatus = stage === "processing"
    ? `${t.a11y.processing} ${t.toolNames[tool]}${progress ? ` ${progress}%` : ""}.`
    : stage === "done"
      ? `${t.toolNames[tool]} ${t.a11y.completed}.`
      : "";
  const fileError = files.find((f) => f.status === "error" || f.status === "duplicate")?.error;
  const liveError = stage === "error" ? (errMsg || t.error.body) : (fileError || "");

  const focusWorkspaceMain = (event) => {
    event.preventDefault();
    const target = document.getElementById("workspace-main");
    if (target) {
      target.focus();
    }
  };

  const handleWorkspaceDragOver = (event) => {
    if (event.dataTransfer?.types?.includes("Files")) {
      event.preventDefault();
      setWorkspaceDrag(true);
    }
  };
  const handleWorkspaceDrop = (event) => {
    if (!event.dataTransfer?.files?.length) return;
    event.preventDefault();
    setWorkspaceDrag(false);
    if (def.standalone) {
      if (def.acceptDroppedFile) def.acceptDroppedFile([...event.dataTransfer.files], { setOpts, toast, lang });
      return;
    }
    addFiles(event.dataTransfer.files);
  };

  React.useEffect(() => {
    if (stage !== "ready") {
      setActiveCompactPanel(def.standalone ? "pages" : "files");
    } else if (def.standalone && activeCompactPanel === "files") {
      setActiveCompactPanel("pages");
    } else if (isCompact && activeCompactPanel === "settings" && !showInspector) {
      setActiveCompactPanel("pages");
    }
  }, [activeCompactPanel, def.standalone, isCompact, showInspector, stage]);

  React.useEffect(() => {
    if (!isMobile) setMobileSheet(null);
  }, [isMobile]);

  return (
    <div className={isCompact ? "ws-root is-compact" : "ws-root"} style={{ height: "100dvh", minHeight: "100dvh", display: "flex", flexDirection: "column", background: "var(--surface-page)", overflow: "hidden" }}>
      <a className="skip-link" href="#workspace-main" onClick={focusWorkspaceMain}>{t.a11y.skipWorkspace}</a>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true" aria-label={t.a11y.workspaceStatus}>
        {liveStatus}
      </div>
      {liveError && (
        <div className="sr-only" role="alert" aria-live="assertive" aria-atomic="true" aria-label={t.a11y.workspaceError}>
          {liveError}
        </div>
      )}
      <WorkspaceTopNav t={t} tool={tool} lang={lang} setLang={setLang} theme={theme} setTheme={setExplicitTheme} onOpenSwitcher={() => setSwitcher(true)} compact={isCompact} onHome={onHome} />
      <div
        className={isCompact ? "ws-body is-compact" : "ws-body"}
        style={{ flex: 1, display: "flex", minHeight: 0 }}
        data-screen-label={t.toolNames[tool]}
        onDragOver={handleWorkspaceDragOver}
        onDragLeave={(e) => { if (e.currentTarget === e.target) setWorkspaceDrag(false); }}
        onDrop={handleWorkspaceDrop}
      >
        {!isCompact && sidebarPanel}
        <main id="workspace-main" tabIndex={-1} className="ws-main" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, position: "relative" }}>
          {stage === "ready" && (
            <div className="ws-ready-summary" style={{ display: "flex", alignItems: "center", gap: 10, padding: isCompact ? "10px 14px 0" : "10px 24px 0" }}>
              <div className="ws-ready-summary__title">
                <strong>{t.toolNames[tool]}</strong>
                {!def.standalone && <span>{livePages.length} {t.success.pages}</span>}
              </div>
              <PrivacyPill lang={lang} />
              {selectable && (
                <span style={{ font: "var(--type-caption)", color: "var(--text-faint)" }}>
                  {selection.size ? `${selection.size} ${t.select.selected}` : t.empty.hintKeyboard.split(",")[0]}
                </span>
              )}
            </div>
          )}
          {isCompact && !isMobile && stage === "ready" ? (
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
                icon={inspOpen ? WSIcons.chevRight(15) : WSIcons.chevLeft(15)} />
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
        {isCompact && !isMobile && stage === "ready" && (
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
        {isCompact && !isMobile && stage === "ready" && showInspector && (
          <div className="ws-mobile-cta">
            {processAction}
          </div>
        )}
        {isMobile && stage === "ready" && (
          <div className="ws-mobile-actions" aria-label={lang === "id" ? "Aksi workspace" : "Workspace actions"}>
            <div className="ws-mobile-actions__tools">
              {!def.standalone && <Button variant="secondary" size="sm" fullWidth onClick={() => setMobileSheet("files")}>{t.workspaceTabs.files}</Button>}
              {showInspector && <Button variant="secondary" size="sm" fullWidth onClick={() => setMobileSheet("settings")}>{t.workspaceTabs.settings}</Button>}
            </div>
            {showInspector && processAction}
          </div>
        )}
        {workspaceDrag && (
          <div style={{
            position: "absolute",
            inset: 12,
            zIndex: 40,
            pointerEvents: "none",
            border: "2px dashed var(--border-brand)",
            borderRadius: "var(--radius-lg)",
            background: "var(--surface-brand-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-brand)",
            font: "var(--weight-bold) 18px/1.2 var(--font-sans)",
          }}>
            {t.drop.title}
          </div>
        )}
      </div>
      {switcher && <QuickSwitcher t={t} toolIds={TOOL_IDS} current={tool} onPick={switchTool} onClose={() => setSwitcher(false)} />}
      {isMobile && stage === "ready" && (
        <React.Fragment>
          <MobileBottomSheet open={mobileSheet === "files"} title={t.workspaceTabs.files} onClose={() => setMobileSheet(null)}>
            {sidebarPanel}
          </MobileBottomSheet>
          {showInspector && (
            <MobileBottomSheet open={mobileSheet === "settings"} title={t.inspector.title} onClose={() => setMobileSheet(null)}>
              {settingsPanel}
            </MobileBottomSheet>
          )}
        </React.Fragment>
      )}
      {previewPage && (
        <PagePreviewModal
          t={t}
          lang={lang}
          page={previewPage}
          position={previewIndex + 1}
          count={livePages.length}
          onClose={() => setPreviewPageUid(null)}
        />
      )}
      <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", gap: 8, zIndex: 90, alignItems: "center" }}>
        {toasts.map((x) => (
          <Toast key={x.id} tone={x.tone} action={x.action} onDismiss={() => setToasts((ts) => ts.filter((y) => y.id !== x.id))}>{x.msg}</Toast>
        ))}
      </div>
    </div>
  );
}

async function fileFingerprint(file) {
  const head = file && file.slice ? await file.slice(0, 2048).arrayBuffer().catch(() => null) : null;
  const bytes = head ? Array.from(new Uint8Array(head)).slice(0, 32).join("-") : "";
  return [file?.name || "", file?.size || 0, file?.lastModified || 0, bytes].join(":");
}

function validateIncomingFile(file, fingerprint, seen, acceptImages, lang) {
  const name = file?.name || "";
  const type = file?.type || "";
  const isPdf = type === "application/pdf" || /\.pdf$/i.test(name);
  const isImage = /^image\/(png|jpeg)$/.test(type) || /\.(png|jpe?g)$/i.test(name);
  const validKind = acceptImages ? isImage : isPdf;
  const invalidMessage = acceptImages
    ? (lang === "id" ? "File harus berupa JPG atau PNG." : "The file must be a JPG or PNG image.")
    : (lang === "id" ? "File harus berupa PDF." : "The file must be a PDF.");
  if (!validKind) return { ok: false, status: "error", message: invalidMessage };
  if (seen.has(fingerprint)) {
    return {
      ok: false,
      status: "duplicate",
      message: lang === "id" ? `${name} sudah ditambahkan.` : `${name} has already been added.`,
    };
  }
  return { ok: true };
}

function classifyFileError(error, lang) {
  const text = String(error?.message || error || "").toLowerCase();
  if (text.includes("password") || text.includes("encrypted")) {
    return lang === "id"
      ? "PDF terkunci kata sandi atau terenkripsi sehingga tidak dapat dibaca."
      : "The PDF is password-protected or encrypted and cannot be read.";
  }
  if (text.includes("invalid") || text.includes("corrupt") || text.includes("damaged")) {
    return lang === "id"
      ? "File tidak dapat dibaca. PDF rusak atau tidak valid."
      : "The file could not be read. The PDF is damaged or invalid.";
  }
  return lang === "id"
    ? "File tidak dapat dibaca. Pastikan PDF valid dan tidak terkunci kata sandi."
    : "The file could not be read. Make sure it is a valid PDF and is not password-protected.";
}

function PagePreviewModal({ t, lang, page, position, count, onClose }) {
  const [zoom, setZoom] = React.useState(120);
  const title = lang === "id" ? `Halaman ${position} dari ${count}` : `Page ${position} of ${count}`;
  return (
    <Modal title={title} onClose={onClose} width={980}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <span style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>
            {page.sourceName || ""}{page.sourcePageNumber ? ` · ${lang === "id" ? "halaman asli" : "source page"} ${page.sourcePageNumber}` : ""}
          </span>
          <ZoomControl
            value={zoom}
            min={80}
            max={260}
            onZoomOut={() => setZoom((z) => Math.max(80, z - 20))}
            onZoomIn={() => setZoom((z) => Math.min(260, z + 20))}
            onReset={() => setZoom(120)}
          />
        </div>
        <div style={{
          maxHeight: "68vh",
          overflow: "auto",
          background: "var(--surface-sunken)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-md)",
          padding: 18,
        }}>
          <div style={{
            width: Math.round(620 * (zoom / 100)),
            maxWidth: zoom <= 120 ? "100%" : "none",
            margin: "0 auto",
            background: "var(--color-pdf-page)",
            border: "1px solid var(--border-default)",
            boxShadow: "var(--shadow-card)",
          }}>
            <LazyThumb fileId={page.fileId} pageNo={page.srcIndex + 1} width={Math.min(900, Math.round(620 * (zoom / 100)))} />
          </div>
        </div>
        <span style={{ font: "var(--type-caption)", color: "var(--text-faint)" }}>{t.privacy}</span>
      </div>
    </Modal>
  );
}
