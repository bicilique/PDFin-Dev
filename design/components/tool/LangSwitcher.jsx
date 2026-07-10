import React from "react";

/** Segmented ID/EN language switcher. */
export function LangSwitcher({ lang = "id", onChange }) {
  const opts = ["id", "en"];
  return (
    <div role="group" aria-label="Language" style={{
      display: "inline-flex",
      background: "var(--surface-sunken)",
      borderRadius: "var(--radius-pill)",
      padding: 3,
      gap: 2,
    }}>
      {opts.map((o) => (
        <button key={o} type="button" aria-pressed={lang === o} onClick={() => onChange && onChange(o)} style={{
          border: 0,
          borderRadius: "var(--radius-pill)",
          padding: "5px 12px",
          font: "var(--type-caption)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          cursor: "pointer",
          background: lang === o ? "var(--surface-card)" : "transparent",
          color: lang === o ? "var(--text-brand)" : "var(--text-muted)",
          boxShadow: lang === o ? "var(--shadow-card)" : "none",
          transition: "background var(--duration-fast) var(--ease-out)",
        }}>{o}</button>
      ))}
    </div>
  );
}
