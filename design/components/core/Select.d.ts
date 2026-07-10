import * as React from "react";

/** Labeled native select. */
export interface SelectProps {
  label?: string;
  id?: string;
  options?: { value: string; label: string }[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}
export declare function Select(props: SelectProps): JSX.Element;
