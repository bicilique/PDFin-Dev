import React from "react";

/** Determinate progress bar, announced to screen readers. */
export function ProgressBar({ value = 0, label }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <div style={{ display: "flex", justifyContent: "space-between", font: "var(--type-caption)", color: "var(--text-muted)" }}>
          <span>{label}</span><span style={{ fontFamily: "var(--font-mono)" }}>{Math.round(pct)}%</span>
        </div>
      )}
      <div role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={label}
        style={{ height: 8, borderRadius: 999, background: "var(--surface-sunken)", overflow: "hidden" }}>
        <div style={{ width: pct + "%", height: "100%", borderRadius: 999, background: "var(--gradient-brand)", transition: "width var(--duration-base) linear" }}></div>
      </div>
    </div>
  );
}
