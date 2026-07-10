import * as React from "react";

/** Cyan privacy/trust pill shown above every upload area. */
export interface PrivacyPillProps {
  /** "id" | "en" — picks the canonical string */
  lang?: "id" | "en";
  /** Override text (rare) */
  text?: string;
}
export declare function PrivacyPill(props: PrivacyPillProps): JSX.Element;
