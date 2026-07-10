import * as React from "react";

export interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  /** e.g. "⌘D" or "Del" */
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
}

/** Context menu at fixed coordinates. Closes on outside click / Esc. Items may be "divider". */
export interface ContextMenuProps {
  items?: (ContextMenuItem | "divider")[];
  x?: number;
  y?: number;
  onClose?: () => void;
}
export declare function ContextMenu(props: ContextMenuProps): JSX.Element;
