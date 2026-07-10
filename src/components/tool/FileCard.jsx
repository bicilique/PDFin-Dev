import React from "react";
import { Icons } from "../icons/PdfinIcons.jsx";

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
          {Icons.grip(16)}
        </span>
      )}
      <div style={{
        width: 44, height: 56, borderRadius: "var(--radius-sm)", flex: "none",
        background: thumbnail ? "url(" + thumbnail + ") center/cover" : "var(--surface-sunken)",
        border: "1px solid var(--border-default)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--text-faint)",
      }}>
        {!thumbnail && Icons.filePdf(18)}
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
          {Icons.trash(16)}
        </button>
      )}
    </div>
  );
}
