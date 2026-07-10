import React from "react";

const tones = {
  neutral: { icon: null, color: "var(--text-body)" },
  success: {
    color: "var(--status-success-fg)",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><path d="m9 11 3 3L22 4"></path></svg>,
  },
  error: {
    color: "var(--status-error-fg)",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m15 9-6 6M9 9l6 6"></path></svg>,
  },
  info: {
    color: "var(--status-info-fg)",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>,
  },
};

/** Transient toast notification. Render inside a fixed bottom-center stack. */
export function Toast({ tone = "neutral", children, action = null, onDismiss }) {
  const t = tones[tone] || tones.neutral;
  return (
    <div
      role="status"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        background: "var(--color-tooltip-bg)",
        color: "var(--color-tooltip-fg)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-overlay)",
        font: "var(--type-body-sm)",
        maxWidth: 480,
      }}
    >
      {t.icon && <span style={{ display: "flex", color: t.color === "var(--text-body)" ? "inherit" : t.color, flex: "none" }}>{t.icon}</span>}
      <span style={{ flex: 1 }}>{children}</span>
      {action}
      {onDismiss && (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onDismiss}
          style={{ display: "flex", border: "none", background: "transparent", color: "inherit", cursor: "pointer", padding: 2 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"></path></svg>
        </button>
      )}
    </div>
  );
}
