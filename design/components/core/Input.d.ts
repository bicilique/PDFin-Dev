import * as React from "react";

/** Labeled text input with error/hint slots. */
export interface InputProps {
  label?: string;
  id?: string;
  /** Localized error message shown below and linked via aria-describedby */
  error?: string;
  hint?: string;
  /** Use JetBrains Mono (page ranges, filenames) */
  mono?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}
export declare function Input(props: InputProps): JSX.Element;
