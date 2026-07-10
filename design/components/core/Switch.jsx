import React from "react";

/** Toggle switch with label. */
export function Switch({ label, checked = false, onChange, disabled = false }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1 }}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange && onChange(!checked)}
        style={{
          width: 40,
          height: 24,
          borderRadius: 999,
          border: "1px solid " + (checked ? "var(--action-primary)" : "var(--border-strong)"),
          background: checked ? "var(--action-primary)" : "var(--surface-sunken)",
          position: "relative",
          cursor: "inherit",
          padding: 0,
          transition: "background var(--duration-base) var(--ease-out)",
        }}
      >
        <span style={{
          position: "absolute",
          top: 2,
          left: checked ? 18 : 2,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 3px rgba(27,23,48,.25)",
          transition: "left var(--duration-base) var(--ease-out)",
        }}></span>
      </button>
      {label && <span style={{ font: "var(--type-body-sm)", color: "var(--text-body)" }}>{label}</span>}
    </label>
  );
}
