import * as React from "react";

/**
 * File drop zone with keyboard-accessible "Choose file" fallback.
 */
export interface DropzoneProps {
  lang?: "id" | "en";
  multiple?: boolean;
  /** Human label of accepted formats, e.g. "PDF" or "JPG, PNG, WebP" */
  accept?: string;
  onSelect?: (e?: React.DragEvent) => void;
  compact?: boolean;
}
export declare function Dropzone(props: DropzoneProps): JSX.Element;
