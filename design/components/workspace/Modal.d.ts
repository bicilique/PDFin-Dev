import * as React from "react";

/** Modal dialog: overlay + card, title row with close, body, footer button row. Esc / overlay click close. */
export interface ModalProps {
  title?: React.ReactNode;
  children?: React.ReactNode;
  /** Button row, right-aligned */
  footer?: React.ReactNode;
  onClose?: () => void;
  /** Max width in px */
  width?: number;
}
export declare function Modal(props: ModalProps): JSX.Element;
