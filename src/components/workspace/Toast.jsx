import React from "react";
import { Icons } from "../icons/PdfinIcons.jsx";

const tones = {
  neutral: { icon: null, color: "var(--text-body)" },
  success: {
    color: "var(--status-success-fg)",
    icon: Icons.check(16),
  },
  error: {
    color: "var(--status-error-fg)",
    icon: Icons.error(16),
  },
  info: {
    color: "var(--status-info-fg)",
    icon: Icons.info(16),
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
          {Icons.x(14)}
        </button>
      )}
    </div>
  );
}
