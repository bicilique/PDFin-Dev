import * as React from "react";

/** Pill status badge. */
export interface BadgeProps {
  tone?: "neutral" | "brand" | "success" | "warning" | "error" | "info";
  children?: React.ReactNode;
}
export declare function Badge(props: BadgeProps): JSX.Element;
