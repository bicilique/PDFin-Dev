import React from "react";

/** Floating workspace toolbar: groups IconButtons/controls on a card surface. */
export function Toolbar({ children, style }) {
  return (
    <div
      role="toolbar"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
        padding: 4,
        background: "var(--surface-card)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-card)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Vertical hairline separator between toolbar groups. */
export function ToolbarDivider() {
  return (
    <span
      aria-hidden="true"
      style={{ width: 1, height: 20, background: "var(--border-default)", margin: "0 4px", flex: "none" }}
    ></span>
  );
}
