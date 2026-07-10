import * as React from "react";

/** Floating workspace toolbar container. Compose with IconButton, ZoomControl, PageNavigator, ToolbarDivider. */
export interface ToolbarProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Toolbar(props: ToolbarProps): JSX.Element;

/** Vertical hairline separator between toolbar groups. */
export declare function ToolbarDivider(): JSX.Element;
