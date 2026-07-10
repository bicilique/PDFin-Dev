import React from "react";
import { Icons } from "../icons/PdfinIcons.jsx";

/** Result file card: success icon, mono filename, meta, primary download action. */
export function DownloadCard({ name, meta, downloadLabel = "Download", onDownload, icon = null }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 16px",
        background: "var(--surface-card)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 40,
          height: 40,
          borderRadius: "var(--radius-md)",
          background: "var(--status-success-bg)",
          color: "var(--status-success-fg)",
          flex: "none",
        }}
      >
        {icon || Icons.filePdf(20)}
      </span>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
        <span style={{ font: "var(--weight-medium) 13px/1.3 var(--font-mono)", color: "var(--text-heading)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
        {meta && <span style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>{meta}</span>}
      </div>
      <button
        type="button"
        onClick={onDownload}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 16px",
          border: "1px solid transparent",
          borderRadius: "var(--radius-md)",
          background: hover ? "var(--action-primary-hover)" : "var(--action-primary)",
          color: "var(--color-accent-contrast)",
          font: "var(--weight-semibold) var(--text-sm)/1 var(--font-sans)",
          cursor: "pointer",
          flex: "none",
          transition: "background var(--duration-fast) var(--ease-out)",
        }}
      >
        {Icons.download(16)}
        {downloadLabel}
      </button>
    </div>
  );
}
