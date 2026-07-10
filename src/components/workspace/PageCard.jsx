import React from "react";
import { Icons } from "../icons/PdfinIcons.jsx";

/**
 * Card for one PDF page in a grid: thumbnail slot, page number, selection ring,
 * rotation, hover action slot. Selection via click; checkbox appears on hover/selected.
 */
export function PageCard({
  pageNumber,
  selected = false,
  highlighted = false,
  rotation = 0,
  children,
  width = 148,
  onClick,
  onContextMenu,
  badge = null,
  actions = null,
  dimmed = false,
  label,
}) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      role="option"
      aria-selected={selected}
      aria-label={label || `Page ${pageNumber}`}
      tabIndex={0}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && onClick) { e.preventDefault(); onClick(e); } }}
      style={{
        width,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        cursor: "pointer",
        opacity: dimmed ? 0.35 : 1,
        transition: "opacity var(--duration-fast) var(--ease-out)",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "relative",
          aspectRatio: "3 / 4",
          border: selected ? "2px solid var(--action-primary)" : highlighted ? "2px solid var(--border-brand)" : "1px solid var(--border-default)",
          boxShadow: selected || highlighted ? "var(--shadow-focus)" : hover ? "var(--shadow-card)" : "none",
          background: highlighted && !selected ? "var(--surface-brand-subtle)" : "var(--surface-card)",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: selected || highlighted ? 0 : 1,
          transition: "box-shadow var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out)",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: rotation ? `rotate(${rotation}deg)` : "none",
            transition: "transform var(--duration-base) var(--ease-out)",
          }}
        >
          {children}
        </div>
        {(hover || selected) && (
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 6,
              left: 6,
              width: 20,
              height: 20,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: selected ? "var(--action-primary)" : "var(--surface-card)",
              border: selected ? "none" : "1px solid var(--border-strong)",
              color: "var(--color-accent-contrast)",
            }}
          >
            {selected && (
              Icons.tick(12, { stroke: 3 })
            )}
          </span>
        )}
        {badge && <span style={{ position: "absolute", top: 6, right: 6 }}>{badge}</span>}
        {actions && hover && (
          <span
            style={{
              position: "absolute",
              bottom: 6,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 2,
              padding: 2,
              background: "var(--surface-card)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-sm)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            {actions}
          </span>
        )}
      </div>
      <span
        style={{
          font: "var(--weight-medium) 11.5px/1 var(--font-mono)",
          color: selected ? "var(--text-brand)" : "var(--text-muted)",
          textAlign: "center",
        }}
      >
        {pageNumber}
      </span>
    </div>
  );
}
