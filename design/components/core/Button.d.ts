import * as React from "react";

/**
 * PDFin primary action button.
 */
export interface ButtonProps {
  /** Visual style */
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  fullWidth?: boolean;
  /** Optional leading icon (Lucide, 16–18px) */
  icon?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}
export declare function Button(props: ButtonProps): JSX.Element;
