import React from "react";

/** Modal dialog with overlay, title, body, footer slot. Esc and overlay click close. */
export function Modal({ title, children, footer = null, onClose, width = 440 }) {
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && onClose) onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(18, 15, 34, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 24,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        style={{
          width: "100%",
          maxWidth: width,
          maxHeight: "85vh",
          overflow: "auto",
          background: "var(--surface-card)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 24px 64px rgba(18, 15, 34, 0.28)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 20px 0" }}>
          <h2 style={{ font: "var(--type-h4, var(--weight-bold) 17px/1.3 var(--font-sans))", color: "var(--text-heading)", margin: 0, flex: 1, letterSpacing: "-0.01em" }}>{title}</h2>
          {onClose && (
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 30, height: 30, border: "none", borderRadius: "var(--radius-sm)",
                background: "transparent", color: "var(--text-muted)", cursor: "pointer", flex: "none",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"></path></svg>
            </button>
          )}
        </div>
        <div style={{ padding: "14px 20px 18px", font: "var(--type-body-sm)", color: "var(--text-body)" }}>{children}</div>
        {footer && (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "0 20px 18px" }}>{footer}</div>
        )}
      </div>
    </div>
  );
}
