import React from "react";

/** Uploaded-file card: thumbnail, mono filename, meta, actions. */
export function FileCard({ name, meta, thumbnail, onRemove, dragHandle = true, removeLabel = "Hapus file" }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "var(--surface-card)",
        border: "1px solid " + (hover ? "var(--border-strong)" : "var(--border-default)"),
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-card)",
        padding: "10px 12px",
        transition: "border-color var(--duration-fast) var(--ease-out)",
      }}
    >
      {dragHandle && (
        <span aria-hidden="true" style={{ color: "var(--text-faint)", cursor: "grab", display: "flex" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.6"></circle><circle cx="15" cy="5" r="1.6"></circle><circle cx="9" cy="12" r="1.6"></circle><circle cx="15" cy="12" r="1.6"></circle><circle cx="9" cy="19" r="1.6"></circle><circle cx="15" cy="19" r="1.6"></circle></svg>
        </span>
      )}
      <div style={{
        width: 44, height: 56, borderRadius: "var(--radius-sm)", flex: "none",
        background: thumbnail ? "url(" + thumbnail + ") center/cover" : "var(--surface-sunken)",
        border: "1px solid var(--border-default)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--text-faint)",
      }}>
        {!thumbnail && (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><path d="M14 2v6h6"></path></svg>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ font: "var(--type-mono)", fontWeight: 500, color: "var(--text-heading)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
        {meta && <span style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>{meta}</span>}
      </div>
      {onRemove && (
        <button type="button" aria-label={removeLabel} title={removeLabel} onClick={onRemove} style={{
          width: 32, height: 32, border: 0, borderRadius: "var(--radius-sm)",
          background: "transparent", color: "var(--text-muted)", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path></svg>
        </button>
      )}
    </div>
  );
}
