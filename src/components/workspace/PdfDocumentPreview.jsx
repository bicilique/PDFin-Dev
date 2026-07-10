import React from "react";
import { Toolbar, ToolbarDivider } from "./Toolbar.jsx";
import { ZoomControl } from "./ZoomControl.jsx";

const DEFAULT_PAGE_SIZE = { width: 595, height: 842 };
const BASE_WIDTH = 620;
const COMPACT_BASE_WIDTH = 520;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function reducedMotion() {
  return typeof window !== "undefined"
    && window.matchMedia
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function pageId(page) {
  return page.pageInstanceId || page.uid || `${page.fileId}-${page.srcIndex}`;
}

function getPreviewCopy(lang, kind) {
  if (lang === "id") {
    if (kind === "compress") return "Pratinjau dokumen asli. Kompresi terutama memengaruhi ukuran file dan mungkin tidak terlihat di pratinjau.";
    if (kind === "lock-source") return "Pratinjau dokumen asli";
    if (kind === "ocr-source") return "Pratinjau dokumen asli";
    if (kind === "flatten") return "Pratinjau dokumen sebelum diratakan";
    if (kind === "processed") return "Pratinjau hasil yang diharapkan";
    if (kind === "content") return "Pratinjau isi PDF";
    return "Pratinjau dokumen";
  }
  if (kind === "compress") return "Original document preview. Compression mainly affects file size and may not be visible here.";
  if (kind === "lock-source") return "Original document preview";
  if (kind === "ocr-source") return "Original document preview";
  if (kind === "flatten") return "Document preview before flattening";
  if (kind === "processed") return "Expected output preview";
  if (kind === "content") return "PDF content preview";
  return "Document preview";
}

export function PdfDocumentPreview({
  pages,
  lang = "id",
  overlay,
  compact = false,
  previewKind = "source",
  previewKey = "",
  navigationRef,
  onCurrentPageChange,
  renderPage,
  getPageSize,
}) {
  const live = React.useMemo(() => pages.filter((p) => !p.deleted), [pages]);
  const [zoom, setZoom] = React.useState(100);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [draftPage, setDraftPage] = React.useState("");
  const [pageError, setPageError] = React.useState("");
  const [isUpdatingPreview, setIsUpdatingPreview] = React.useState(false);
  const scrollerRef = React.useRef(null);
  const pageRefs = React.useRef(new Map());
  const navInputRef = React.useRef(null);
  const lastPreviewKey = React.useRef(previewKey);
  const totalPages = live.length;
  const baseWidth = compact ? COMPACT_BASE_WIDTH : BASE_WIDTH;
  const pageWidth = (baseWidth * zoom) / 100;

  React.useEffect(() => {
    setCurrentPage((page) => clamp(page, 1, Math.max(1, totalPages)));
  }, [totalPages]);

  React.useEffect(() => {
    if (!previewKey || lastPreviewKey.current === previewKey) return undefined;
    lastPreviewKey.current = previewKey;
    setIsUpdatingPreview(true);
    const timer = window.setTimeout(() => setIsUpdatingPreview(false), 360);
    return () => window.clearTimeout(timer);
  }, [previewKey]);

  const setPageRef = React.useCallback((number, node) => {
    if (node) pageRefs.current.set(number, node);
    else pageRefs.current.delete(number);
  }, []);

  const updateCurrentPageFromScroll = React.useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !totalPages) return;
    const scrollRect = scroller.getBoundingClientRect();
    const targetY = scrollRect.top + Math.min(scroller.clientHeight * 0.42, 260);
    let best = currentPage;
    let bestDist = Infinity;
    pageRefs.current.forEach((node, number) => {
      const rect = node.getBoundingClientRect();
      const pageMid = rect.top + rect.height / 2;
      const dist = Math.abs(pageMid - targetY);
      if (dist < bestDist) {
        best = number;
        bestDist = dist;
      }
    });
    if (best !== currentPage) setCurrentPage(best);
  }, [currentPage, totalPages]);

  const goToPage = React.useCallback((number, focusPage = true) => {
    const targetNumber = clamp(number, 1, Math.max(1, totalPages));
    const scroller = scrollerRef.current;
    const target = pageRefs.current.get(targetNumber);
    if (scroller && target) {
      scroller.scrollTo({
        top: Math.max(0, target.offsetTop - 12),
        behavior: reducedMotion() ? "auto" : "smooth",
      });
      if (focusPage) window.setTimeout(() => target.focus({ preventScroll: true }), reducedMotion() ? 0 : 180);
    }
    setCurrentPage(targetNumber);
    setDraftPage("");
    setPageError("");
  }, [totalPages]);

  React.useEffect(() => {
    if (!navigationRef) return undefined;
    navigationRef.current = {
      goToPage,
      getCurrentPage: () => currentPage,
    };
    return () => {
      if (navigationRef.current?.goToPage === goToPage) navigationRef.current = null;
    };
  }, [currentPage, goToPage, navigationRef]);

  React.useEffect(() => {
    onCurrentPageChange && onCurrentPageChange(currentPage);
  }, [currentPage, onCurrentPageChange]);

  const commitDraftPage = React.useCallback(() => {
    const parsed = Number.parseInt(draftPage || String(currentPage), 10);
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > totalPages) {
      setPageError(lang === "id" ? `Masukkan nomor halaman 1-${totalPages}.` : `Enter a page from 1-${totalPages}.`);
      return;
    }
    goToPage(parsed);
  }, [currentPage, draftPage, goToPage, lang, totalPages]);

  const fitWidth = React.useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const available = Math.max(240, scroller.clientWidth - (compact ? 32 : 56));
    setZoom(clamp(Math.round((available / baseWidth) * 100), 40, 220));
  }, [baseWidth, compact]);

  const fitPage = React.useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const availableW = Math.max(240, scroller.clientWidth - (compact ? 32 : 56));
    const availableH = Math.max(240, scroller.clientHeight - 96);
    const pageSize = DEFAULT_PAGE_SIZE;
    const pageRatio = pageSize.height / pageSize.width;
    const targetW = Math.min(availableW, availableH / pageRatio);
    setZoom(clamp(Math.round((targetW / baseWidth) * 100), 40, 220));
  }, [baseWidth, compact]);

  const handleKeyDown = (event) => {
    if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA" || event.target.tagName === "SELECT") return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    if (event.key === "PageDown") {
      event.preventDefault();
      scroller.scrollBy({ top: scroller.clientHeight * 0.82, behavior: reducedMotion() ? "auto" : "smooth" });
    } else if (event.key === "PageUp") {
      event.preventDefault();
      scroller.scrollBy({ top: -scroller.clientHeight * 0.82, behavior: reducedMotion() ? "auto" : "smooth" });
    } else if (event.key === "Home") {
      event.preventDefault();
      goToPage(1);
    } else if (event.key === "End") {
      event.preventDefault();
      goToPage(totalPages);
    }
  };

  const previousLabel = lang === "id" ? "Halaman sebelumnya" : "Previous page";
  const nextLabel = lang === "id" ? "Halaman berikutnya" : "Next page";
  const pageInputLabel = lang === "id" ? "Ke halaman" : "Go to page";
  const previewStatus = previewKind === "lock-source"
    ? (lang === "id" ? "Password akan diterapkan saat PDF diproses." : "The password will be applied when the PDF is processed.")
    : getPreviewCopy(lang, previewKind);
  const status = isUpdatingPreview ? (lang === "id" ? "Memperbarui pratinjau..." : "Updating preview...") : previewStatus;

  return (
    <section style={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column" }} aria-label={lang === "id" ? "Pratinjau PDF" : "PDF preview"}>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: compact ? "10px 12px" : "12px 18px",
          borderBottom: "1px solid var(--border-default)",
          background: "var(--surface-page)",
          flexWrap: "wrap",
        }}
      >
        <div style={{ minWidth: 160, display: "flex", flexDirection: "column", gap: 3 }}>
          <strong style={{ font: "var(--weight-semibold) 12.5px/1.25 var(--font-sans)", color: "var(--text-heading)" }}>
            {getPreviewCopy(lang, previewKind)}
          </strong>
          <span style={{ font: "var(--type-caption)", color: isUpdatingPreview ? "var(--text-brand)" : "var(--text-muted)" }}>
            {status}
          </span>
        </div>
        <Toolbar style={{ flexWrap: "wrap", justifyContent: "flex-end", maxWidth: "100%" }}>
          <NavButton label={previousLabel} disabled={currentPage <= 1} onClick={() => goToPage(currentPage - 1)} dir="prev" />
          <label style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--text-muted)", font: "var(--weight-medium) 12px/1 var(--font-sans)" }}>
            <span>{lang === "id" ? "Halaman" : "Page"}</span>
            <input
              ref={navInputRef}
              aria-label={pageInputLabel}
              aria-invalid={!!pageError}
              aria-describedby={pageError ? "pdf-preview-page-error" : undefined}
              inputMode="numeric"
              value={draftPage || String(currentPage)}
              onChange={(event) => {
                setDraftPage(event.target.value.replace(/[^0-9]/g, ""));
                setPageError("");
              }}
              onFocus={(event) => event.target.select()}
              onBlur={() => {
                if (draftPage) commitDraftPage();
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  commitDraftPage();
                } else if (event.key === "Escape") {
                  setDraftPage("");
                  setPageError("");
                }
              }}
              style={{
                width: 44,
                border: `1px solid ${pageError ? "var(--red-600)" : "var(--border-default)"}`,
                borderRadius: "var(--radius-sm)",
                background: "var(--surface-sunken)",
                color: "var(--text-heading)",
                font: "var(--weight-medium) 12.5px/1 var(--font-mono)",
                padding: "6px 5px",
                textAlign: "center",
                outline: "none",
              }}
            />
            <span>{lang === "id" ? `dari ${totalPages || 1}` : `of ${totalPages || 1}`}</span>
          </label>
          <NavButton label={nextLabel} disabled={currentPage >= totalPages} onClick={() => goToPage(currentPage + 1)} dir="next" />
          <ToolbarDivider />
          <span className="pdf-preview-zoom-controls" style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
            <ZoomControl
              value={zoom}
              min={40}
              max={220}
              onZoomIn={() => setZoom((value) => Math.min(220, value + 20))}
              onZoomOut={() => setZoom((value) => Math.max(40, value - 20))}
              onReset={() => setZoom(100)}
            />
            <button type="button" onClick={fitWidth} style={toolbarTextButtonStyle}>
              {lang === "id" ? "Sesuaikan lebar" : "Fit width"}
            </button>
            <button type="button" onClick={fitPage} style={toolbarTextButtonStyle}>
              {lang === "id" ? "Sesuaikan halaman" : "Fit page"}
            </button>
          </span>
        </Toolbar>
        {pageError && (
          <span id="pdf-preview-page-error" role="alert" style={{ flexBasis: "100%", textAlign: "right", font: "var(--type-caption)", color: "var(--status-error-fg)" }}>
            {pageError}
          </span>
        )}
      </div>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {lang === "id" ? `Halaman ${currentPage} dari ${totalPages || 1}` : `Page ${currentPage} of ${totalPages || 1}`}
      </div>
      <div
        ref={scrollerRef}
        tabIndex={0}
        aria-label={lang === "id" ? "Viewport pratinjau PDF" : "PDF preview viewport"}
        onScroll={updateCurrentPageFromScroll}
        onKeyDown={handleKeyDown}
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          padding: compact ? "16px 14px 158px" : "22px 24px 90px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: compact ? 14 : 20,
          scrollBehavior: reducedMotion() ? "auto" : "smooth",
          outline: "none",
        }}
      >
        {!live.length ? (
          <div style={{
            minHeight: 220,
            width: "min(520px, 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px dashed var(--border-strong)",
            borderRadius: "var(--radius-lg)",
            color: "var(--text-muted)",
            font: "var(--type-body-sm)",
            textAlign: "center",
            padding: 24,
          }}>
            {lang === "id" ? "Belum ada halaman valid untuk ditampilkan." : "No valid pages to show yet."}
          </div>
        ) : live.map((page, index) => (
          <PreviewPage
            key={pageId(page)}
            page={page}
            pageNumber={index + 1}
            totalPages={totalPages}
            width={pageWidth}
            compact={compact}
            overlay={overlay}
            renderPage={renderPage}
            getPageSize={getPageSize}
            setPageRef={setPageRef}
            lang={lang}
          />
        ))}
      </div>
    </section>
  );
}

function PreviewPage({ page, pageNumber, totalPages, width, compact, overlay, renderPage, getPageSize, setPageRef, lang }) {
  const holderRef = React.useRef(null);
  const pageRef = React.useRef(null);
  const [visible, setVisible] = React.useState(false);
  const [size, setSize] = React.useState(DEFAULT_PAGE_SIZE);
  const [status, setStatus] = React.useState("idle");
  const renderWidth = Math.min(Math.max(280, width), 1100);

  React.useEffect(() => {
    const node = pageRef.current;
    if (!node) return undefined;
    setPageRef(pageNumber, node);
    return () => setPageRef(pageNumber, null);
  }, [pageNumber, setPageRef]);

  React.useEffect(() => {
    let dead = false;
    getPageSize(page.fileId, page.srcIndex + 1).then((nextSize) => {
      if (!dead && nextSize?.width && nextSize?.height) setSize(nextSize);
    }).catch(() => {});
    return () => { dead = true; };
  }, [getPageSize, page.fileId, page.srcIndex]);

  React.useEffect(() => {
    const node = pageRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setVisible(true);
      });
    }, { rootMargin: "900px 0px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!visible) return undefined;
    let dead = false;
    const holder = holderRef.current;
    setStatus("loading");
    renderPage(page.fileId, page.srcIndex + 1, renderWidth, page.rotation || 0).then((canvas) => {
      if (dead || !holderRef.current) return;
      if (!canvas) {
        setStatus("error");
        return;
      }
      holderRef.current.replaceChildren(canvas);
      setStatus("ready");
    }).catch(() => {
      if (!dead) setStatus("error");
    });
    return () => {
      dead = true;
      if (holder) holder.replaceChildren();
    };
  }, [visible, renderPage, page.fileId, page.srcIndex, page.rotation, renderWidth]);

  const ratio = `${size.width} / ${size.height}`;
  return (
    <article
      ref={pageRef}
      tabIndex={-1}
      data-pdf-preview-page={pageNumber}
      aria-label={lang === "id" ? `Halaman ${pageNumber} dari ${totalPages}` : `Page ${pageNumber} of ${totalPages}`}
      style={{
        width,
        maxWidth: "100%",
        position: "relative",
        outline: "none",
      }}
    >
      <div
        style={{
          position: "relative",
          aspectRatio: ratio,
          background: "#fff",
          border: "1px solid var(--border-default)",
          borderRadius: compact ? 4 : 5,
          boxShadow: "var(--shadow-card)",
          overflow: "hidden",
        }}
      >
        <div ref={holderRef} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }} />
        {status !== "ready" && (
          <div style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            background: "var(--surface-card)",
            color: "var(--text-muted)",
            font: "var(--type-caption)",
          }}>
            <span className="ws-shimmer" style={{ width: "62%", height: "72%", borderRadius: 6 }}></span>
            <span>{status === "error" ? (lang === "id" ? "Halaman gagal dirender." : "Page failed to render.") : (lang === "id" ? "Memuat halaman..." : "Loading page...")}</span>
          </div>
        )}
        {overlay && overlay(page, pageNumber - 1, totalPages)}
      </div>
      <span style={{ display: "block", marginTop: 7, textAlign: "center", color: "var(--text-faint)", font: "var(--weight-medium) 11.5px/1 var(--font-mono)" }}>
        {pageNumber}
      </span>
    </article>
  );
}

function NavButton({ label, disabled, onClick, dir }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      style={{
        width: 32,
        height: 32,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: "none",
        borderRadius: "var(--radius-sm)",
        background: "transparent",
        color: "var(--text-body)",
        opacity: disabled ? 0.38 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {dir === "prev" ? <path d="m15 18-6-6 6-6"></path> : <path d="m9 18 6-6-6-6"></path>}
      </svg>
    </button>
  );
}

const toolbarTextButtonStyle = {
  minHeight: 32,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "none",
  borderRadius: "var(--radius-sm)",
  background: "transparent",
  color: "var(--text-body)",
  cursor: "pointer",
  font: "var(--weight-semibold) 12px/1 var(--font-sans)",
  padding: "0 8px",
  whiteSpace: "nowrap",
};
