import React from "react";

/** File drop zone — dashed border, keyboard-accessible button fallback. */
export function Dropzone({ lang = "id", multiple = false, accept = "PDF", onSelect, compact = false }) {
  const [over, setOver] = React.useState(false);
  const t = lang === "id"
    ? { drop: "Letakkan file di sini", or: "atau", choose: "Pilih file", hint: "Format " + accept + (multiple ? " · beberapa file" : "") }
    : { drop: "Drop files here", or: "or", choose: "Choose file", hint: accept + " format" + (multiple ? " · multiple files" : "") };
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); onSelect && onSelect(e); }}
      style={{
        border: "2px dashed " + (over ? "var(--border-focus)" : "var(--border-strong)"),
        background: over ? "var(--surface-brand-subtle)" : "var(--surface-card)",
        borderRadius: "var(--radius-xl)",
        padding: compact ? "24px 20px" : "48px 32px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        textAlign: "center",
        transition: "border-color var(--duration-fast) var(--ease-out), background var(--duration-fast) var(--ease-out)",
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: "var(--radius-lg)",
        background: "var(--surface-brand-subtle)", color: "var(--text-brand)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"></path>
        </svg>
      </div>
      <div style={{ font: "var(--type-h4)", color: "var(--text-heading)" }}>{t.drop}</div>
      <div style={{ font: "var(--type-caption)", color: "var(--text-faint)" }}>{t.or}</div>
      <button type="button" onClick={() => onSelect && onSelect()} style={{
        background: "var(--action-primary)", color: "#fff", border: 0,
        borderRadius: "var(--radius-md)", padding: "9px 20px",
        font: "var(--type-label)", fontSize: "var(--text-base)", cursor: "pointer",
      }}>{t.choose}</button>
      <span style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>{t.hint}</span>
    </div>
  );
}
