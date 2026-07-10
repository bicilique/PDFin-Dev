import React from "react";
import { Badge, ContextMenu, PageCard, PageNavigator, ProgressBar, Toolbar, ToolbarDivider, ZoomControl } from "../../components/index.js";
import { PdfEngine } from "./engine/pdfEngine.js";
import { WSIcons } from "./WorkspaceShell.jsx";

// PDFin workspace — sidebar, lazy thumbnails, page grid, document preview.

// Render a PDF page canvas lazily when scrolled into view. Canvases are cached in the engine.
export function LazyThumb({ fileId, pageNo, width, style }) {
  const holder = React.useRef(null);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const el = holder.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setVisible(true)), { rootMargin: "400px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  React.useEffect(() => {
    let dead = false;
    if (!visible) return;
    PdfEngine.renderPage(fileId, pageNo, width).then((canvas) => {
      if (dead || !canvas || !holder.current) return;
      holder.current.innerHTML = "";
      holder.current.appendChild(canvas);
    });
    return () => { dead = true; };
  }, [visible, fileId, pageNo, width]);
  return (
    <div ref={holder} style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "#fff", ...style }}>
      <span className="ws-shimmer" style={{ width: "70%", height: "80%", borderRadius: 4 }}></span>
    </div>
  );
}

// ---------- Left sidebar ----------
export function Sidebar({ t, lang, files, onAdd, onSample, onRemove, onMoveFile, recent, stage, progress, acceptImages, allowReorder, compact = false, hideShortcuts = false }) {
  const inputRef = React.useRef(null);
  return (
    <aside style={{
      width: compact ? "100%" : 248, flex: "none", borderRight: compact ? "none" : "1px solid var(--border-default)", background: "var(--surface-card)",
      display: "flex", flexDirection: "column", overflow: "hidden", minHeight: compact ? 0 : undefined,
    }}>
      <div style={{ flex: 1, overflow: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 18 }}>
        <section style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ font: "var(--weight-semibold) 11.5px/1 var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-faint)", margin: 0 }}>{t.sidebar.files}</h2>
            <button type="button" onClick={() => inputRef.current && inputRef.current.click()} style={{
              display: "inline-flex", alignItems: "center", gap: 5, border: "none", background: "transparent",
              color: "var(--text-brand)", font: "var(--weight-semibold) 12px/1 var(--font-sans)", cursor: "pointer", padding: "4px 6px", borderRadius: 6,
            }}>{WSIcons.plus(13)}{t.sidebar.addFile}</button>
            <input ref={inputRef} type="file" accept={acceptImages ? ".png,.jpg,.jpeg" : ".pdf"} multiple style={{ display: "none" }}
              onChange={(e) => { onAdd([...e.target.files]); e.target.value = ""; }} />
          </div>
          {files.length === 0 && (
            <button type="button" onClick={onSample} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: "var(--radius-md)",
              border: "1px dashed var(--border-strong)", background: "transparent", color: "var(--text-muted)",
              font: "12.5px/1.4 var(--font-sans)", cursor: "pointer", textAlign: "left",
            }}>{WSIcons.sparkle(14)}{t.sidebar.sample}</button>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {files.map((f, i) => (
              <div key={f.id} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "8px 8px",
                border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", background: "var(--surface-card)",
              }}>
                <div style={{ width: 30, height: 38, flex: "none", border: "1px solid var(--border-default)", borderRadius: 4, overflow: "hidden" }}>
                  <LazyThumb fileId={f.id} pageNo={1} width={30} />
                </div>
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ font: "var(--weight-medium) 11.5px/1.3 var(--font-mono)", color: "var(--text-heading)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                  <span style={{ font: "10.5px/1 var(--font-sans)", color: "var(--text-muted)" }}>
                    {PdfEngine.fmtSize(f.size, lang)} · {f.pageCount} {t.success.pages}
                  </span>
                </div>
                {allowReorder && files.length > 1 && (
                  <span style={{ display: "flex", flexDirection: "column" }}>
                    <ArrowBtn dir="up" disabled={i === 0} onClick={() => onMoveFile(i, i - 1)} />
                    <ArrowBtn dir="down" disabled={i === files.length - 1} onClick={() => onMoveFile(i, i + 1)} />
                  </span>
                )}
                <button type="button" aria-label={t.sidebar.remove} onClick={() => onRemove(f.id)} style={{
                  display: "flex", border: "none", background: "transparent", color: "var(--text-faint)", cursor: "pointer", padding: 3, borderRadius: 5,
                }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "var(--status-error-fg)"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-faint)"}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"></path></svg>
                </button>
              </div>
            ))}
          </div>
        </section>

        {stage === "processing" && (
          <section style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <h2 style={{ font: "var(--weight-semibold) 11.5px/1 var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-faint)", margin: 0 }}>{t.sidebar.queue}</h2>
            <ProgressBar value={progress} />
          </section>
        )}

        {recent.length > 0 && files.length === 0 && (
          <section style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <h2 style={{ font: "var(--weight-semibold) 11.5px/1 var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-faint)", margin: 0 }}>{t.sidebar.recent}</h2>
            {recent.slice(0, 4).map((r, i) => (
              <span key={i} style={{ font: "11.5px/1.4 var(--font-mono)", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r}</span>
            ))}
          </section>
        )}
      </div>

      {!hideShortcuts && <div style={{ padding: 14, borderTop: "1px solid var(--border-default)", display: "flex", flexDirection: "column", gap: 6 }}>
        <h2 style={{ font: "var(--weight-semibold) 11.5px/1 var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-faint)", margin: "0 0 2px" }}>{t.sidebar.shortcuts}</h2>
        {t.shortcuts.slice(0, 5).map(([k, label]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <kbd style={{ font: "10px var(--font-mono)", color: "var(--text-muted)", border: "1px solid var(--border-default)", borderRadius: 4, padding: "2px 5px", minWidth: 34, textAlign: "center" }}>{k}</kbd>
            <span style={{ font: "11.5px/1 var(--font-sans)", color: "var(--text-muted)" }}>{label}</span>
          </div>
        ))}
      </div>}
    </aside>
  );
}

function ArrowBtn({ dir, disabled, onClick }) {
  return (
    <button type="button" aria-label={dir} disabled={disabled} onClick={onClick} style={{
      display: "flex", border: "none", background: "transparent", color: "var(--text-faint)",
      cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.3 : 1, padding: "1px 2px",
    }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        {dir === "up" ? <path d="m18 15-6-6-6 6"></path> : <path d="m6 9 6 6 6-6"></path>}
      </svg>
    </button>
  );
}

// ---------- Page grid (thumbnails, selection, drag reorder, context menu) ----------
export function PageGrid({ t, pages, selection, setSelection, cardWidth = 148, compact = false, onReorder, onRotate, onDelete, onDuplicate, selectable = true, badges }) {
  const [menu, setMenu] = React.useState(null); // {x, y, uid}
  const dragFrom = React.useRef(null);
  const [dropAt, setDropAt] = React.useState(null);
  const live = pages.filter((p) => !p.deleted);

  const toggle = (uid, e) => {
    if (!selectable) return;
    setSelection((sel) => {
      const next = new Set(e && (e.metaKey || e.ctrlKey || e.shiftKey) || true ? sel : []);
      if (next.has(uid)) next.delete(uid); else next.add(uid);
      return next;
    });
  };

  React.useEffect(() => {
    if (!selectable) return;
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") { e.preventDefault(); setSelection(new Set(live.map((p) => p.uid))); }
      if (e.key === "Escape") setSelection(new Set());
      if (e.key.toLowerCase() === "r" && onRotate && selection.size) { e.preventDefault(); onRotate([...selection], 90); }
      if ((e.key === "Delete" || e.key === "Backspace") && onDelete && selection.size) { e.preventDefault(); onDelete([...selection]); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selection, live.length, selectable]);

  return (
    <div style={{ flex: 1, overflow: "auto", padding: compact ? "16px 16px 150px" : "20px 24px" }}
      onClick={(e) => { if (e.target === e.currentTarget && selectable) setSelection(new Set()); }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: compact ? 12 : 16, alignContent: "flex-start", justifyContent: compact ? "center" : "flex-start" }} role="listbox" aria-multiselectable="true">
        {live.map((p, i) => (
          <div key={p.uid}
            draggable={!!onReorder}
            onDragStart={() => { dragFrom.current = i; }}
            onDragOver={(e) => { if (onReorder) { e.preventDefault(); setDropAt(i); } }}
            onDrop={(e) => { e.preventDefault(); if (onReorder && dragFrom.current != null && dragFrom.current !== i) onReorder(dragFrom.current, i); dragFrom.current = null; setDropAt(null); }}
            onDragEnd={() => { dragFrom.current = null; setDropAt(null); }}
            style={{ position: "relative", outline: dropAt === i && dragFrom.current !== i ? "2px solid var(--cyan-400)" : "none", outlineOffset: 3, borderRadius: "var(--radius-md)" }}>
            <PageCard
              pageNumber={i + 1}
              width={cardWidth}
              selected={selection.has(p.uid)}
              rotation={p.rotation}
              badge={badges ? badges(p, i) : (p.rotation ? <Badge tone="brand">{p.rotation}°</Badge> : null)}
              onClick={(e) => toggle(p.uid, e)}
              onContextMenu={(e) => { e.preventDefault(); setMenu({ x: e.clientX, y: e.clientY, uid: p.uid }); }}>
              <LazyThumb fileId={p.fileId} pageNo={p.srcIndex + 1} width={cardWidth} />
            </PageCard>
          </div>
        ))}
      </div>
      {menu && (onRotate || onDelete || onDuplicate) && (
        <ContextMenu x={menu.x} y={menu.y} onClose={() => setMenu(null)} items={[
          onRotate && { label: t.pageMenu.rotateR, shortcut: "R", icon: WSIcons.rotate(15), onSelect: () => onRotate([menu.uid], 90) },
          onRotate && { label: t.pageMenu.rotateL, icon: WSIcons.rotate(15), onSelect: () => onRotate([menu.uid], -90) },
          onDuplicate && { label: t.pageMenu.duplicate, shortcut: "Ctrl+D", onSelect: () => onDuplicate([menu.uid]) },
          onDelete && "divider",
          onDelete && { label: t.pageMenu.delete, shortcut: "Del", danger: true, onSelect: () => onDelete([menu.uid]) },
        ].filter(Boolean)} />
      )}
    </div>
  );
}

// ---------- Continuous document preview with zoom + floating toolbar + per-page overlay ----------
export function DocPreview({ t, pages, overlay, compact = false, children }) {
  const [zoom, setZoom] = React.useState(100);
  const [page, setPage] = React.useState(1);
  const scroller = React.useRef(null);
  const live = pages.filter((p) => !p.deleted);
  const baseW = compact ? 520 : 620;
  const w = (baseW * zoom) / 100;

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const kids = el.querySelectorAll("[data-pv-page]");
    let best = 1, bestDist = Infinity;
    kids.forEach((k) => {
      const r = k.getBoundingClientRect();
      const mid = r.top + r.height / 2 - el.getBoundingClientRect().top;
      const d = Math.abs(mid - el.clientHeight / 2);
      if (d < bestDist) { bestDist = d; best = +k.dataset.pvPage; }
    });
    setPage(best);
  };
  const goTo = (n) => {
    const el = scroller.current;
    const target = el && el.querySelector(`[data-pv-page="${n}"]`);
    const reducedMotion = typeof window !== "undefined"
      && window.matchMedia
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (target && el) el.scrollTo({ top: target.offsetTop - 16, behavior: reducedMotion ? "auto" : "smooth" });
    setPage(n);
  };

  return (
    <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", minWidth: 0 }}>
      <div ref={scroller} onScroll={onScroll} style={{ flex: 1, overflow: "auto", padding: compact ? "16px 14px 158px" : "24px 24px 90px", display: "flex", flexDirection: "column", alignItems: "center", gap: compact ? 14 : 20 }}>
        {live.map((p, i) => (
          <div key={p.uid} data-pv-page={i + 1} style={{
            width: w, maxWidth: "100%", position: "relative", background: "#fff",
            border: "1px solid var(--border-default)", borderRadius: 4, boxShadow: "var(--shadow-card)",
            transform: p.rotation ? `rotate(${p.rotation}deg)` : "none",
          }}>
            <div style={{ aspectRatio: "210 / 297" }}>
              <LazyThumb fileId={p.fileId} pageNo={p.srcIndex + 1} width={Math.min(w, 900)} />
            </div>
            {overlay && overlay(p, i)}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", bottom: compact ? 92 : 18, left: "50%", transform: "translateX(-50%)", zIndex: 10, maxWidth: "calc(100% - 24px)" }}>
        <Toolbar>
          <ZoomControl value={zoom} onZoomIn={() => setZoom((z) => Math.min(220, z + 20))} onZoomOut={() => setZoom((z) => Math.max(40, z - 20))} onReset={() => setZoom(100)} />
          <ToolbarDivider></ToolbarDivider>
          <PageNavigator page={page} count={live.length} onChange={goTo} />
          {children}
        </Toolbar>
      </div>
    </div>
  );
}
