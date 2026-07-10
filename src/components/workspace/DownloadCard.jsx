import React from "react";

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
        {icon || (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path></svg>
        )}
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
          color: "var(--text-inverse)",
          font: "var(--weight-semibold) var(--text-sm)/1 var(--font-sans)",
          cursor: "pointer",
          flex: "none",
          transition: "background var(--duration-fast) var(--ease-out)",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"></path></svg>
        {downloadLabel}
      </button>
    </div>
  );
}
