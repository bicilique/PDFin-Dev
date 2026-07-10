import React from "react";

/** Zoom stepper: minus / mono percent / plus. Click the percent to reset. */
export function ZoomControl({ value = 100, onZoomIn, onZoomOut, onReset, min = 25, max = 400 }) {
  const btn = (label, icon, onClick, disabled) => (
    <ZoomBtn label={label} icon={icon} onClick={onClick} disabled={disabled} />
  );
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
      {btn(
        "Zoom out",
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14"></path></svg>,
        onZoomOut,
        value <= min
      )}
      <button
        type="button"
        onClick={onReset}
        title="Reset zoom"
        style={{
          font: "var(--weight-medium) 12.5px/1 var(--font-mono)",
          color: "var(--text-body)",
          background: "transparent",
          border: "none",
          borderRadius: "var(--radius-sm)",
          padding: "6px 6px",
          minWidth: 46,
          textAlign: "center",
          cursor: onReset ? "pointer" : "default",
        }}
      >
        {Math.round(value)}%
      </button>
      {btn(
        "Zoom in",
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"></path></svg>,
        onZoomIn,
        value >= max
      )}
    </div>
  );
}

function ZoomBtn({ label, icon, onClick, disabled }) {
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
