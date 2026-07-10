import React from "react";

/** Page navigator: prev / editable page field of N / next. */
export function PageNavigator({ page = 1, count = 1, onChange, prevLabel = "Previous page", nextLabel = "Next page" }) {
  const [draft, setDraft] = React.useState(null);
  const commit = () => {
    if (draft != null) {
      const n = parseInt(draft, 10);
      if (!isNaN(n)) onChange && onChange(Math.min(count, Math.max(1, n)));
    }
    setDraft(null);
  };
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <NavBtn
        label={prevLabel}
        disabled={page <= 1}
        onClick={() => onChange && onChange(page - 1)}
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"></path></svg>}
      />
      <input
        aria-label="Page"
        value={draft != null ? draft : String(page)}
        onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ""))}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
        style={{
          width: 38,
          textAlign: "center",
          font: "var(--weight-medium) 12.5px/1.2 var(--font-mono)",
          color: "var(--text-heading)",
          background: "var(--surface-sunken)",
          border: "1px solid transparent",
          borderRadius: "var(--radius-sm)",
          padding: "6px 4px",
          outline: "none",
        }}
        onFocus={(e) => { e.target.style.borderColor = "var(--border-focus)"; e.target.select(); }}
      />
      <span style={{ font: "var(--weight-medium) 12.5px/1 var(--font-mono)", color: "var(--text-muted)" }}>/ {count}</span>
      <NavBtn
        label={nextLabel}
        disabled={page >= count}
        onClick={() => onChange && onChange(page + 1)}
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"></path></svg>}
      />
    </div>
  );
}

function NavBtn({ label, icon, onClick, disabled }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 28,
        height: 28,
        border: "none",
        borderRadius: "var(--radius-sm)",
        background: disabled ? "var(--color-disabled-bg)" : hover ? "var(--surface-sunken)" : "transparent",
        color: disabled ? "var(--color-disabled-fg)" : "var(--text-body)",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background var(--duration-fast) var(--ease-out)",
      }}
    >
      {icon}
    </button>
  );
}
