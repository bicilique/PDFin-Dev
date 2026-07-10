import React from "react";

/** Context menu at a fixed position. items: {label, icon?, shortcut?, danger?, onSelect} or "divider". */
export function ContextMenu({ items = [], x = 0, y = 0, onClose }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const away = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose && onClose(); };
    const key = (e) => { if (e.key === "Escape") onClose && onClose(); };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("keydown", key); };
  }, [onClose]);
  return (
    <div
      ref={ref}
      role="menu"
      style={{
        position: "fixed",
        left: x,
        top: y,
        zIndex: 120,
        minWidth: 190,
        padding: 5,
        background: "var(--surface-card)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-overlay)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {items.map((it, i) =>
        it === "divider" ? (
          <div key={i} style={{ height: 1, background: "var(--border-default)", margin: "5px 6px" }}></div>
        ) : (
          <MenuItem key={i} item={it} onClose={onClose} />
        )
      )}
    </div>
  );
}

function MenuItem({ item, onClose }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      role="menuitem"
      disabled={item.disabled}
      onClick={() => { item.onSelect && item.onSelect(); onClose && onClose(); }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        padding: "7px 9px",
        border: "none",
        borderRadius: "var(--radius-sm)",
        background: hover && !item.disabled ? (item.danger ? "var(--status-error-bg)" : "var(--surface-sunken)") : "transparent",
        color: item.disabled ? "var(--color-disabled-fg)" : item.danger ? "var(--status-error-fg)" : "var(--text-body)",
        font: "var(--type-body-sm)",
        cursor: item.disabled ? "not-allowed" : "pointer",
        textAlign: "left",
        width: "100%",
      }}
    >
      {item.icon && <span style={{ display: "flex", flex: "none" }}>{item.icon}</span>}
      <span style={{ flex: 1 }}>{item.label}</span>
      {item.shortcut && (
        <kbd style={{ font: "11px var(--font-mono)", color: "var(--text-faint)", background: "transparent", border: "none" }}>{item.shortcut}</kbd>
      )}
    </button>
  );
}
