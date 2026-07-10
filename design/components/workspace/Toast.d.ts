import * as React from "react";

/** Transient toast on inverse surface. Render in a fixed bottom-center stack. */
export interface ToastProps {
  tone?: "neutral" | "success" | "error" | "info";
  children?: React.ReactNode;
  /** Optional action button (e.g. Undo) */
  action?: React.ReactNode;
  onDismiss?: () => void;
}
export declare function Toast(props: ToastProps): JSX.Element;
