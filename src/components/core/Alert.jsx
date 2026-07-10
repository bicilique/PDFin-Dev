import React from "react";

/** Inline alert. tone: info | success | warning | error. */
export function Alert({ tone = "info", title, children }) {
  const tones = {
    info: { bg: "var(--status-info-bg)", fg: "var(--status-info-fg)" },
    success: { bg: "var(--status-success-bg)", fg: "var(--status-success-fg)" },
    warning: { bg: "var(--status-warning-bg)", fg: "var(--status-warning-fg)" },
    error: { bg: "var(--status-error-bg)", fg: "var(--status-error-fg)" },
  };
  const t = tones[tone];
  const icons = {
    info: <circle cx="12" cy="12" r="10"></circle>,
    success: <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3"></path>,
    warning: <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3zM12 9v4m0 4h.01"></path>,
    error: <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm3 7-6 6m0-6 6 6"></path>,
  };
  return (
    <div role={tone === "error" ? "alert" : "status"} style={{
      display: "flex",
      gap: 10,
      padding: "12px 14px",
      borderRadius: "var(--radius-md)",
      background: t.bg,
      color: t.fg,
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none", marginTop: 1 }}>{icons[tone]}</svg>
      <div style={{ font: "var(--type-body-sm)" }}>
        {title && <div style={{ font: "var(--type-label)", marginBottom: 2 }}>{title}</div>}
        {children}
      </div>
    </div>
  );
}
