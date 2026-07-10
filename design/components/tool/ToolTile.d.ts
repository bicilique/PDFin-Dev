import * as React from "react";

/** Homepage / related-tools grid tile. */
export interface ToolTileProps {
  /** Lucide icon, ~22px */
  icon?: React.ReactNode;
  title: string;
  description?: string;
  href?: string;
  /** Optional Badge (e.g. "Coming soon") */
  badge?: React.ReactNode;
}
export declare function ToolTile(props: ToolTileProps): JSX.Element;
