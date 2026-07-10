import * as React from "react";

/** Page navigator for the workspace toolbar: prev / editable "n / N" field / next. */
export interface PageNavigatorProps {
  /** Current page (1-based) */
  page?: number;
  count?: number;
  onChange?: (page: number) => void;
  /** Localized aria-labels */
  prevLabel?: string;
  nextLabel?: string;
}
export declare function PageNavigator(props: PageNavigatorProps): JSX.Element;
