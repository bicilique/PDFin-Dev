import * as React from "react";

/** Icon-only button; `label` is required for accessibility. */
export interface IconButtonProps {
  /** Accessible name (aria-label + title) — required */
  label: string;
  icon: React.ReactNode;
  variant?: "ghost" | "outline";
  size?: "sm" | "md";
  disabled?: boolean;
  onClick?: () => void;
}
export declare function IconButton(props: IconButtonProps): JSX.Element;
