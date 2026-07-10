import React from "react";

/** Text input with label + optional error, mono option for technical values. */
export function Input({ label, id, error, hint, mono = false, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && <label htmlFor={inputId} style={{ font: "var(--type-label)", color: "var(--text-heading)" }}>{label}</label>}
      <input
        id={inputId}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        aria-invalid={!!error}
        aria-describedby={error && inputId ? inputId + "-error" : undefined}
        style={{
          padding: "9px 12px",
          borderRadius: "var(--radius-md)",
          border: "1px solid " + (error ? "var(--red-600)" : focus ? "var(--border-focus)" : "var(--border-default)"),
          background: "var(--surface-card)",
          color: "var(--text-heading)",
          font: mono ? "var(--type-mono)" : "var(--type-body)",
          outline: "none",
          boxShadow: focus ? "var(--shadow-focus)" : "none",
          transition: "border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)",
        }}
        {...rest}
      />
      {error
        ? <span id={inputId ? inputId + "-error" : undefined} style={{ font: "var(--type-caption)", color: "var(--status-error-fg)" }}>{error}</span>
        : hint ? <span style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>{hint}</span> : null}
    </div>
  );
}
