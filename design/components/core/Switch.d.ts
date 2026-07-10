import * as React from "react";

/** Toggle switch. */
export interface SwitchProps {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}
export declare function Switch(props: SwitchProps): JSX.Element;
