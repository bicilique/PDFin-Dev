import React from "react";

/** Labeled native select. options: [{value, label}]. */
export function Select({ label, id, options = [], value, onChange, ...rest }) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && <label htmlFor={selectId} style={{ font: "var(--type-label)", color: "var(--text-heading)" }}>{label}</label>}
      <select
        id={selectId}
        value={value}
        onChange={onChange}
        style={{
          padding: "9px 12px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-default)",
          background: "var(--surface-card)",
          color: "var(--text-heading)",
          font: "var(--type-body)",
          cursor: "pointer",
        }}
        {...rest}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
