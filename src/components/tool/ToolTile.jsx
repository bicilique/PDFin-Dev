import React from "react";

/** Homepage tool grid tile: icon on violet tile, title, description. */
export function ToolTile({ icon, title, description, href, badge, disabled = false, onClick }) {
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const interactive = !!href && !disabled;
  const Tag = interactive ? "a" : "div";
  const stateStyle = active && interactive;
  const sharedProps = interactive
    ? { href, onClick }
    : { "aria-disabled": disabled ? "true" : undefined };

  return (
    <Tag
      {...sharedProps}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        height: "100%",
        boxSizing: "border-box",
        background: "var(--surface-card)",
        border: "1px solid " + (hover && interactive ? "var(--border-brand)" : "var(--border-default)"),
        borderRadius: "var(--radius-lg)",
        boxShadow: hover && interactive ? "var(--shadow-raised)" : "var(--shadow-card)",
        padding: "var(--space-5)",
        textDecoration: "none",
        cursor: interactive ? "pointer" : "default",
        opacity: disabled ? 0.62 : 1,
        transition: "box-shadow var(--duration-base) var(--ease-out), border-color var(--duration-base) var(--ease-out)",
        transform: stateStyle ? "translateY(1px)" : "none",
      }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: disabled ? "var(--surface-sunken)" : "var(--surface-brand-subtle)",
          color: disabled ? "var(--text-faint)" : "var(--text-brand)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>{icon}</div>
        {badge}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ font: "var(--type-h4)", color: "var(--text-heading)", minHeight: "2.6em", display: "flex", alignItems: "flex-start" }}>{title}</span>
        <span style={{ font: "var(--type-body-sm)", color: "var(--text-muted)" }}>{description}</span>
      </div>
    </Tag>
  );
}
