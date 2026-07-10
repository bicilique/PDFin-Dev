import React from "react";

/** Surface card. padded by default; raised adds stronger shadow. */
export function Card({ raised = false, padding = "var(--space-6)", style = {}, children }) {
  return (
    <div style={{
      background: "var(--surface-card)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-lg)",
      boxShadow: raised ? "var(--shadow-raised)" : "var(--shadow-card)",
      padding,
      ...style,
    }}>{children}</div>
  );
}
