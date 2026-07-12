import React from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge, ContextMenu, PageCard, PdfDocumentPreview, ProgressBar, Toolbar, ZoomControl } from "../../components/index.js";
import { PdfEngine } from "./engine/pdfEngine.js";
import { WSIcons } from "./WorkspaceShell.jsx";

// PDFin workspace — sidebar, lazy thumbnails, page grid, document preview.
const pageIdentity = (page) => page.pageInstanceId || page.uid;

// Render a PDF page canvas lazily when scrolled into view. Canvases are cached in the engine.
export function LazyThumb({ fileId, pageNo, width, style }) {
  const holder = React.useRef(null);
  const [visible, setVisible] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [retry, setRetry] = React.useState(0);
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
    setError(false);
    PdfEngine.renderPage(fileId, pageNo, width).then((canvas) => {
      if (dead || !holder.current) return;
      if (!canvas) {
        setError(true);
        return;
      }
      holder.current.innerHTML = "";
      holder.current.appendChild(canvas);
    }).catch(() => {
      if (!dead) setError(true);
    });
    return () => { dead = true; };
  }, [visible, fileId, pageNo, width, retry]);
  if (error) {
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: 10, textAlign: "center", background: "var(--surface-sunken)", color: "var(--status-error-fg)", ...style }}>
        <span style={{ font: "11px/1.35 var(--font-sans)" }}>Thumbnail gagal dirender.</span>
        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setError(false); setRetry((n) => n + 1); }} style={{
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-sm)",
          background: "var(--surface-card)",
          color: "var(--text-brand)",
          font: "var(--weight-semibold) 11px/1 var(--font-sans)",
          padding: "6px 8px",
          cursor: "pointer",
        }}>Coba lagi</button>
      </div>
    );
  }
  return (
    <div ref={holder} style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "var(--color-pdf-page)", ...style }}>
      <span className="ws-shimmer" style={{ width: "70%", height: "80%", borderRadius: 4 }}></span>
    </div>
  );
}

// ---------- Left sidebar ----------
export function Sidebar({ t, lang, files, onAdd, onSample, onRemove, onMoveFile, recent, stage, progress, acceptImages, allowReorder, compact = false, hideShortcuts = false }) {
  const inputRef = React.useRef(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id || !allowReorder) return;
    const from = files.findIndex((f) => String(f.id) === String(active.id));
    const to = files.findIndex((f) => String(f.id) === String(over.id));
    if (from >= 0 && to >= 0) onMoveFile(from, to);
  };
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
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={files.map((f) => String(f.id))} strategy={verticalListSortingStrategy}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {files.map((f, i) => (
                  <SortableFileItem
                    key={f.id}
                    file={f}
                    index={i}
                    count={files.length}
                    t={t}
                    lang={lang}
                    allowReorder={allowReorder}
                    onMoveFile={onMoveFile}
                    onRemove={onRemove}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
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
            {recent.slice(0, 4).map((r) => (
              <span key={r} style={{ font: "11.5px/1.4 var(--font-mono)", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.toolNames[r] || r}</span>
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

function SortableFileItem({ file: f, index: i, count, t, lang, allowReorder, onMoveFile, onRemove }) {
  const disabled = !allowReorder || count < 2;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: String(f.id),
    disabled,
  });
  const tone = f.status === "error" || f.status === "duplicate" ? "var(--status-error-fg)" : f.status === "loading" ? "var(--status-info-fg)" : "var(--text-muted)";
  const statusLabel = fileStatusLabel(f, t, lang);
  return (
    <div ref={setNodeRef} style={{
      display: "flex", alignItems: "center", gap: 8, padding: "8px 8px",
      border: isDragging ? "1px solid var(--border-brand)" : "1px solid var(--border-default)",
      borderRadius: "var(--radius-md)",
      background: isDragging ? "var(--surface-brand-subtle)" : "var(--surface-card)",
      boxShadow: isDragging ? "var(--shadow-card)" : "none",
      opacity: isDragging ? 0.85 : 1,
      transform: CSS.Transform.toString(transform),
      transition,
    }}>
      <button
        className="ws-file-drag-handle"
        type="button"
        aria-label={lang === "id" ? `Seret ${f.name}` : `Drag ${f.name}`}
        disabled={disabled}
        {...attributes}
        {...listeners}
        style={{
          width: 24,
          height: 34,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          border: "none",
          background: "transparent",
          color: disabled ? "var(--text-faint)" : "var(--text-muted)",
          cursor: disabled ? "default" : "grab",
          touchAction: "none",
          padding: 0,
        }}
      >
        {WSIcons.grip(14)}
      </button>
      <div style={{ width: 30, height: 38, flex: "none", border: "1px solid var(--border-default)", borderRadius: 4, overflow: "hidden", background: "var(--surface-sunken)" }}>
        {f.status === "ready" ? <LazyThumb fileId={f.id} pageNo={1} width={30} /> : <span className="ws-shimmer" style={{ display: "block", width: "100%", height: "100%" }}></span>}
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ font: "var(--weight-medium) 11.5px/1.3 var(--font-mono)", color: "var(--text-heading)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
        <span style={{ font: "10.5px/1.2 var(--font-sans)", color: tone }}>
          {f.status === "ready"
            ? `${PdfEngine.fmtSize(f.size, lang)} · ${f.pageCount} ${t.success.pages} · ${statusLabel}`
            : `${PdfEngine.fmtSize(f.size, lang)} · ${statusLabel}`}
        </span>
        {f.error && <span style={{ font: "10.5px/1.25 var(--font-sans)", color: "var(--status-error-fg)" }}>{f.error}</span>}
      </div>
      {allowReorder && count > 1 && (
        <span style={{ display: "flex", flexDirection: "column" }}>
          <ArrowBtn dir="up" disabled={i === 0} onClick={() => onMoveFile(i, i - 1)} label={lang === "id" ? `Pindahkan ${f.name} ke atas` : `Move ${f.name} up`} />
          <ArrowBtn dir="down" disabled={i === count - 1} onClick={() => onMoveFile(i, i + 1)} label={lang === "id" ? `Pindahkan ${f.name} ke bawah` : `Move ${f.name} down`} />
        </span>
      )}
      <button type="button" aria-label={t.sidebar.remove} onClick={() => onRemove(f.id)} style={{
        display: "flex", border: "none", background: "transparent", color: "var(--text-faint)", cursor: "pointer", padding: 3, borderRadius: 5,
      }}
        onMouseEnter={(e) => e.currentTarget.style.color = "var(--status-error-fg)"}
        onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-faint)"}>
        {WSIcons.x(14)}
      </button>
    </div>
  );
}

function fileStatusLabel(file, t, lang) {
  if (file.status === "loading") return lang === "id" ? "Memuat…" : "Loading…";
  if (file.status === "duplicate") return lang === "id" ? "Duplikat" : "Duplicate";
  if (file.status === "error") return lang === "id" ? "Gagal" : "Failed";
  return lang === "id" ? "Siap" : "Ready";
}

function ArrowBtn({ dir, disabled, onClick, label }) {
  return (
    <button type="button" className="ws-file-move-button" aria-label={label || dir} disabled={disabled} onClick={onClick} style={{
      display: "flex", border: "none", background: "transparent", color: disabled ? "var(--color-disabled-fg)" : "var(--text-faint)",
      cursor: disabled ? "default" : "pointer", padding: "1px 2px",
    }}>
      {dir === "up" ? WSIcons.chevUp(12, { stroke: 2.4 }) : WSIcons.chevDown(12, { stroke: 2.4 })}
    </button>
  );
}

// ---------- Page grid (thumbnails, selection, drag reorder, context menu) ----------
export function PageGrid({ t, pages, selection, setSelection, cardWidth = 148, compact = false, onReorder, onMovePage, lastMovedPageUid, onRotate, onDelete, onDuplicate, selectable = true, badges, zoom = 100, onZoomIn, onZoomOut, onZoomReset, onPreview, headerActions = null, selectionToolbar = null, checkboxSelection = false, checkboxSelectionActive = false, onTogglePageSelection, highlightedPageUids, focusFirstSelectionTick = 0 }) {
  const [menu, setMenu] = React.useState(null); // {x, y, uid}
  const live = pages.filter((p) => !p.deleted);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const toggle = (uid, e) => {
    if (checkboxSelection) {
      if (onPreview) onPreview(uid);
      return;
    }
    if (!selectable) {
      if (onPreview) onPreview(uid);
      return;
    }
    setSelection((sel) => {
      const next = new Set(sel);
      if (next.has(uid)) next.delete(uid); else next.add(uid);
      return next;
    });
  };

  React.useEffect(() => {
    if (!selectable) return;
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") { e.preventDefault(); setSelection(new Set(live.map((p) => pageIdentity(p)))); }
      if (e.key === "Escape") setSelection(new Set());
      if (e.key.toLowerCase() === "r" && onRotate && selection.size) { e.preventDefault(); onRotate([...selection], 90); }
      if ((e.key === "Delete" || e.key === "Backspace") && onDelete && selection.size) { e.preventDefault(); onDelete([...selection]); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selection, live.length, selectable]);

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id || !onReorder) return;
    onReorder(active.id, over.id);
  };

  React.useEffect(() => {
    if (!lastMovedPageUid) return;
    const target = document.querySelector(`[data-page-uid="${lastMovedPageUid}"] [role="option"]`);
    if (target) target.focus();
  }, [lastMovedPageUid, live.map((p) => pageIdentity(p)).join("|")]);

  React.useEffect(() => {
    if (!focusFirstSelectionTick) return;
    const target = document.querySelector("[data-page-select-checkbox]");
    if (target) target.focus();
  }, [focusFirstSelectionTick, live.map((p) => pageIdentity(p)).join("|")]);

  const onWheel = (e) => {
    if (!(e.ctrlKey || e.metaKey) || (!onZoomIn && !onZoomOut)) return;
    e.preventDefault();
    if (e.deltaY < 0) onZoomIn && onZoomIn();
    else onZoomOut && onZoomOut();
  };

  return (
    <div style={{ flex: 1, overflow: "auto", padding: compact ? "16px 16px 150px" : "14px 24px 24px" }}
      onWheel={onWheel}
      onClick={(e) => { if (e.target === e.currentTarget && selectable) setSelection(new Set()); }}>
      <div style={{
        position: "sticky", top: -14, zIndex: 5, display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 12, margin: "0 0 14px", padding: "10px 0", background: "var(--surface-page)", flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <h2 style={{ font: "var(--weight-bold) 15px/1.2 var(--font-sans)", color: "var(--text-heading)", margin: 0 }}>{t.workspaceTabs.pages}</h2>
          <span style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>{live.length} {t.success.pages}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {headerActions}
          <Toolbar>
          <ZoomControl value={zoom} min={70} max={180} onZoomIn={onZoomIn} onZoomOut={onZoomOut} onReset={onZoomReset} />
          </Toolbar>
        </div>
      </div>
      {selectionToolbar}
      {!live.length ? (
        <div style={{
          minHeight: 220, display: "flex", alignItems: "center", justifyContent: "center",
          border: "1px dashed var(--border-strong)", borderRadius: "var(--radius-lg)", color: "var(--text-muted)",
          font: "var(--type-body-sm)", textAlign: "center", padding: 24,
        }}>{t.empty.noPages}</div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={live.map((p) => pageIdentity(p))} strategy={rectSortingStrategy}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: compact ? 12 : 16, alignContent: "flex-start", justifyContent: compact ? "center" : "flex-start" }} role="listbox" aria-multiselectable="true">
              {live.map((p, i) => (
                <SortablePageItem
                  key={pageIdentity(p)}
                  page={p}
                  index={i}
                  t={t}
                  width={cardWidth}
                  selectable={selectable}
                  selected={selection.has(pageIdentity(p))}
                  highlighted={highlightedPageUids && highlightedPageUids.has(pageIdentity(p))}
                  badge={badges ? badges(p, i) : (p.rotation ? <Badge tone="brand">{p.rotation}°</Badge> : sourceBadge(p))}
                  onClick={(e) => toggle(pageIdentity(p), e)}
                  onContextMenu={(e) => { e.preventDefault(); setMenu({ x: e.clientX, y: e.clientY, uid: pageIdentity(p) }); }}
                  checkboxSelection={checkboxSelection}
                  checkboxSelectionActive={checkboxSelectionActive}
                  onTogglePageSelection={onTogglePageSelection}
                  onMoveUp={onMovePage ? () => onMovePage(pageIdentity(p), "prev") : null}
                  onMoveDown={onMovePage ? () => onMovePage(pageIdentity(p), "next") : null}
                  canMoveUp={i > 0}
                  canMoveDown={i < live.length - 1}
                  disabled={!onReorder && !onMovePage}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      {menu && (onRotate || onDelete || onDuplicate) && (
        <ContextMenu x={menu.x} y={menu.y} onClose={() => setMenu(null)} items={[
          onRotate && { label: t.pageMenu.rotateR, shortcut: "R", icon: WSIcons.rotate(15), onSelect: () => onRotate([menu.uid], 90) },
          onRotate && { label: t.pageMenu.rotateL, icon: WSIcons.rotate(15), onSelect: () => onRotate([menu.uid], -90) },
          onDuplicate && { label: t.breadcrumbHome === "Beranda" ? "Duplikat halaman" : "Duplicate page", shortcut: "Ctrl+D", onSelect: () => onDuplicate([menu.uid]) },
          onDelete && "divider",
          onDelete && { label: t.pageMenu.delete, shortcut: "Del", danger: true, onSelect: () => onDelete([menu.uid]) },
        ].filter(Boolean)} />
      )}
    </div>
  );
}

function SortablePageItem({ page, index, t, width, selected, highlighted, badge, onClick, onContextMenu, checkboxSelection, checkboxSelectionActive, onTogglePageSelection, onMoveUp, onMoveDown, canMoveUp, canMoveDown, disabled }) {
  const id = pageIdentity(page);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  });
  return (
    <div ref={setNodeRef} data-page-uid={id} style={{
      position: "relative",
      opacity: isDragging ? 0.72 : 1,
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 3 : 1,
    }}>
      {!disabled && (
        <button
          className="ws-page-drag-handle"
          type="button"
          aria-label={`Drag page ${index + 1}`}
          {...attributes}
          {...listeners}
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            zIndex: 4,
            width: 28,
            height: 28,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-sm)",
            background: "var(--surface-card)",
            color: "var(--text-muted)",
            cursor: "grab",
            touchAction: "none",
            boxShadow: "var(--shadow-card)",
          }}
        >
          {WSIcons.grip(14)}
        </button>
      )}
      <PageCard
        pageNumber={index + 1}
        width={width}
        selected={selected}
        highlighted={highlighted}
        rotation={page.rotation}
        badge={page.transientBadge ? <Badge tone="brand">{page.transientBadge}</Badge> : badge}
        label={`Page ${index + 1}${page.sourceName ? `, ${page.sourceName}` : ""}`}
        onClick={onClick}
        onContextMenu={onContextMenu}>
        <LazyThumb fileId={page.fileId} pageNo={page.srcIndex + 1} width={width} />
      </PageCard>
      {checkboxSelection && (
        <label style={{
          position: "absolute",
          top: 42,
          left: 8,
          zIndex: 5,
          width: 30,
          height: 30,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "var(--radius-sm)",
          border: `1px solid ${selected ? "var(--border-brand)" : "var(--border-default)"}`,
          background: selected ? "var(--action-primary)" : "var(--surface-card)",
          color: selected ? "var(--color-accent-contrast)" : "var(--text-muted)",
          boxShadow: "var(--shadow-card)",
          cursor: "pointer",
        }}>
          <input
            data-page-select-checkbox
            type="checkbox"
            checked={selected}
            aria-label={t.breadcrumbHome === "Beranda" ? `Pilih halaman ${index + 1}` : `Select page ${index + 1}`}
            onChange={(e) => { e.stopPropagation(); onTogglePageSelection && onTogglePageSelection(id); }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.001,
              cursor: "pointer",
            }}
          />
          {selected ? (
            WSIcons.tick(14, { stroke: 3 })
          ) : (
            <span aria-hidden="true" style={{ width: 13, height: 13, border: "1.5px solid currentColor", borderRadius: 3 }}></span>
          )}
        </label>
      )}
      {checkboxSelectionActive && (
        <span style={{
          display: "block",
          marginTop: !disabled ? 4 : 6,
          textAlign: "center",
          font: "10.5px/1 var(--font-sans)",
          color: selected ? "var(--text-brand)" : "var(--text-faint)",
        }}>
          {selected ? (t.breadcrumbHome === "Beranda" ? "Dipilih" : "Selected") : (t.breadcrumbHome === "Beranda" ? "Tidak dipilih" : "Not selected")}
        </span>
      )}
      {!disabled && (
        <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 5 }}>
          <button
            className="ws-page-move-button"
            type="button"
            aria-label={moveLabel(page, "earlier")}
            disabled={!onMoveUp || !canMoveUp}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMoveUp && canMoveUp && onMoveUp(); }}
            style={pageMoveButtonStyle(!onMoveUp || !canMoveUp)}
          >
            {WSIcons.chevLeft(12, { stroke: 2.4 })}
          </button>
          <button
            className="ws-page-move-button"
            type="button"
            aria-label={moveLabel(page, "later")}
            disabled={!onMoveDown || !canMoveDown}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMoveDown && canMoveDown && onMoveDown(); }}
            style={pageMoveButtonStyle(!onMoveDown || !canMoveDown)}
          >
            {WSIcons.chevRight(12, { stroke: 2.4 })}
          </button>
        </div>
      )}
    </div>
  );
}

function moveLabel(page, direction) {
  const source = page.sourceName ? `${page.sourceName} page ${page.sourcePageNumber || page.srcIndex + 1}` : `page ${page.srcIndex + 1}`;
  return `Move ${source} ${direction}`;
}

function pageMoveButtonStyle(disabled) {
  return {
    width: 28,
    height: 28,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid var(--border-default)",
    borderRadius: "var(--radius-sm)",
    background: "var(--surface-card)",
    color: disabled ? "var(--color-disabled-fg)" : "var(--text-muted)",
    cursor: disabled ? "not-allowed" : "pointer",
  };
}

function sourceBadge(page) {
  if (!page.sourceName) return null;
  return (
    <Badge tone="neutral">
      {`Sumber ${page.sourcePageNumber || page.srcIndex + 1}`}
    </Badge>
  );
}

// ---------- Shared continuous document preview ----------
export function DocPreview({ pages, overlay, compact = false, lang = "id", previewKind = "source", previewKey = "", navigationRef, onCurrentPageChange }) {
  const renderPage = React.useCallback((fileId, pageNo, width, rotation) => PdfEngine.renderPage(fileId, pageNo, width, rotation), []);
  const getPageSize = React.useCallback((fileId, pageNo) => PdfEngine.pageSize(fileId, pageNo), []);
  return (
    <PdfDocumentPreview
      pages={pages}
      lang={lang}
      overlay={overlay}
      compact={compact}
      previewKind={previewKind}
      previewKey={previewKey}
      navigationRef={navigationRef}
      onCurrentPageChange={onCurrentPageChange}
      renderPage={renderPage}
      getPageSize={getPageSize}
    />
  );
}
