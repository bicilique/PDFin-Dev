import * as React from "react";

/** Segmented ID / EN switcher for the header. */
export interface LangSwitcherProps {
  lang?: "id" | "en";
  onChange?: (lang: "id" | "en") => void;
}
export declare function LangSwitcher(props: LangSwitcherProps): JSX.Element;
