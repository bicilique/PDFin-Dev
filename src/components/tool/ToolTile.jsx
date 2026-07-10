import React from "react";

/** Homepage tool grid tile: icon on violet tile, title, description. */
export function ToolTile({ icon, title, description, href, badge, disabled = false, onClick }) {
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
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
      onFocus={() => { setHover(true); setFocused(true); }}
      onBlur={() => { setHover(false); setFocused(false); }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        height: "100%",
        boxSizing: "border-box",
        background: "var(--surface-card)",
        border: "1px solid " + (hover && interactive ? "var(--border-brand)" : "var(--border-default)"),
        borderRadius: "var(--radius-lg)",
        boxShadow: focused && interactive ? "var(--shadow-focus)" : hover && interactive ? "var(--shadow-raised)" : "var(--shadow-card)",
        padding: "var(--space-5)",
        textDecoration: "none",
        cursor: interactive ? "pointer" : "default",
        color: disabled ? "var(--color-disabled-fg)" : undefined,
        transition: "box-shadow var(--duration-base) var(--ease-out), border-color var(--duration-base) var(--ease-out), background var(--duration-fast) var(--ease-out)",
        transform: stateStyle ? "translateY(1px)" : "none",
      }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: disabled ? "var(--color-disabled-bg)" : "var(--surface-brand-subtle)",
          color: disabled ? "var(--color-disabled-fg)" : "var(--text-brand)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>{icon}</div>
        {badge}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ font: "var(--type-h4)", color: "var(--text-heading)", minHeight: "2.6em", display: "flex", alignItems: "flex-start" }}>{title}</span>
        <span style={{ font: "var(--type-body-sm)", color: disabled ? "var(--color-disabled-fg)" : "var(--text-body)" }}>{description}</span>
      </div>
    </Tag>
  );
}
