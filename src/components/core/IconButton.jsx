import React from "react";

/** Icon-only button with accessible name. variant: ghost | outline. */
export function IconButton({ label, icon, variant = "ghost", size = "md", disabled = false, onClick, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const dim = size === "sm" ? 36 : 44;
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
        border: disabled ? "1px solid var(--color-disabled-border)" : variant === "outline" ? "1px solid var(--border-default)" : "1px solid transparent",
        background: disabled ? "var(--color-disabled-bg)" : hover ? "var(--surface-sunken)" : variant === "outline" ? "var(--surface-card)" : "transparent",
        color: disabled ? "var(--color-disabled-fg)" : "var(--text-body)",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background var(--duration-fast) var(--ease-out)",
      }}
      {...rest}
    >
      {icon}
    </button>
  );
}
