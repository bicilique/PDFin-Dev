import React from "react";

/** Icon-only button with accessible name. variant: ghost | outline. */
export function IconButton({ label, icon, variant = "ghost", size = "md", disabled = false, onClick, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const dim = size === "sm" ? 32 : 40;
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
        width: dim,
        height: dim,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "var(--radius-md)",
        border: variant === "outline" ? "1px solid var(--border-default)" : "1px solid transparent",
        background: hover && !disabled ? "var(--surface-sunken)" : variant === "outline" ? "var(--surface-card)" : "transparent",
        color: "var(--text-body)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "background var(--duration-fast) var(--ease-out)",
      }}
      {...rest}
    >
      {icon}
    </button>
  );
}
