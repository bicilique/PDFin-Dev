import React from "react";

/** Homepage tool grid tile: icon on violet tile, title, description. */
export function ToolTile({ icon, title, description, href = "#", badge }) {
  const [hover, setHover] = React.useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        height: "100%",
        boxSizing: "border-box",
        background: "var(--surface-card)",
        border: "1px solid " + (hover ? "var(--border-brand)" : "var(--border-default)"),
        borderRadius: "var(--radius-lg)",
        boxShadow: hover ? "var(--shadow-raised)" : "var(--shadow-card)",
        padding: "var(--space-5)",
        textDecoration: "none",
        transition: "box-shadow var(--duration-base) var(--ease-out), border-color var(--duration-base) var(--ease-out)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: "var(--surface-brand-subtle)", color: "var(--text-brand)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>{icon}</div>
        {badge}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ font: "var(--type-h4)", color: "var(--text-heading)", minHeight: "2.6em", display: "flex", alignItems: "flex-start" }}>{title}</span>
        <span style={{ font: "var(--type-body-sm)", color: "var(--text-muted)" }}>{description}</span>
      </div>
    </a>
  );
}
