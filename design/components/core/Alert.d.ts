import * as React from "react";

/** Inline alert / notice with tone icon. */
export interface AlertProps {
  tone?: "info" | "success" | "warning" | "error";
  title?: string;
  children?: React.ReactNode;
}
export declare function Alert(props: AlertProps): JSX.Element;
