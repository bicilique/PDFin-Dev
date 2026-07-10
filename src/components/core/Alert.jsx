import React from "react";
import { Icons } from "../icons/PdfinIcons.jsx";

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
    info: Icons.info,
    success: Icons.check,
    warning: Icons.alert,
    error: Icons.error,
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
      <span style={{ display: "flex", flex: "none", marginTop: 1 }}>{icons[tone](18)}</span>
      <div style={{ font: "var(--type-body-sm)" }}>
        {title && <div style={{ font: "var(--type-label)", marginBottom: 2 }}>{title}</div>}
        {children}
      </div>
    </div>
  );
}
