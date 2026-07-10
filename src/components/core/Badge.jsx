import React from "react";

/** Small status badge. tone: neutral | brand | success | warning | error | info. */
export function Badge({ tone = "neutral", children }) {
  const tones = {
    neutral: { background: "var(--surface-sunken)", color: "var(--text-muted)" },
    brand: { background: "var(--surface-brand-subtle)", color: "var(--text-brand)" },
    success: { background: "var(--status-success-bg)", color: "var(--status-success-fg)" },
    warning: { background: "var(--status-warning-bg)", color: "var(--status-warning-fg)" },
    error: { background: "var(--status-error-bg)", color: "var(--status-error-fg)" },
    info: { background: "var(--status-info-bg)", color: "var(--status-info-fg)" },
  };
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "3px 10px",
      borderRadius: "var(--radius-pill)",
      font: "var(--type-caption)",
      ...tones[tone],
    }}>{children}</span>
  );
}
