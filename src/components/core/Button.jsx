import React from "react";

/**
 * PDFin button. variant: primary | secondary | ghost | danger; size: sm | md | lg.
 */
export function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
  icon = null,
  children,
  onClick,
  type = "button",
  ...rest
}) {
  const [state, setState] = React.useState("idle");
  const base = {
    display: fullWidth ? "flex" : "inline-flex",
    width: fullWidth ? "100%" : undefined,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontFamily: "var(--font-sans)",
    fontWeight: "var(--weight-semibold)",
    letterSpacing: 0,
    border: "1px solid transparent",
    borderRadius: "var(--radius-md)",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "background var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)",
    whiteSpace: "nowrap",
  };
  const sizes = {
    sm: { padding: "6px 12px", fontSize: "var(--text-sm)" },
    md: { padding: "9px 18px", fontSize: "var(--text-base)" },
    lg: { padding: "13px 26px", fontSize: "var(--text-md)" },
  };
  const active = !disabled && state === "active";
  const hover = !disabled && (state === "hover" || active);
  const variants = {
    primary: {
      background: active ? "var(--action-primary-active)" : hover ? "var(--action-primary-hover)" : "var(--action-primary)",
      color: "var(--color-accent-contrast)",
    },
    secondary: {
      background: hover ? "var(--surface-brand-subtle)" : "var(--surface-card)",
      color: "var(--text-brand)",
      borderColor: hover ? "var(--border-brand)" : "var(--border-default)",
    },
    ghost: {
      background: hover ? "var(--surface-sunken)" : "transparent",
      color: "var(--text-body)",
    },
    danger: {
      background: hover ? "var(--red-700)" : "var(--red-600)",
      color: "var(--color-accent-contrast)",
    },
  };
  const disabledStyle = disabled
    ? {
        background: "var(--color-disabled-bg)",
        color: "var(--color-disabled-fg)",
        borderColor: "var(--color-disabled-border)",
      }
    : null;
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{ ...base, ...sizes[size], ...variants[variant], ...disabledStyle }}
      onMouseEnter={() => setState("hover")}
      onMouseLeave={() => setState("idle")}
      onMouseDown={() => setState("active")}
      onMouseUp={() => setState("hover")}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
