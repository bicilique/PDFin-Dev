import * as React from "react";

/** Zoom stepper for the workspace toolbar: minus / mono percent / plus. */
export interface ZoomControlProps {
  /** Current zoom in percent (100 = 100%) */
  value?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  /** Clicking the percent label resets zoom */
  onReset?: () => void;
  min?: number;
  max?: number;
}
export declare function ZoomControl(props: ZoomControlProps): JSX.Element;
