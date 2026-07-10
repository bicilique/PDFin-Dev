import * as React from "react";

/** Determinate progress bar (0–100) with optional label row. */
export interface ProgressBarProps {
  value?: number;
  label?: string;
}
export declare function ProgressBar(props: ProgressBarProps): JSX.Element;
