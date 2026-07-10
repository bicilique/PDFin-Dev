import * as React from "react";

/** Card for a loaded file: thumbnail slot, mono filename, meta line, drag handle, remove. */
export interface FileCardProps {
  name: string;
  /** e.g. "2,4 MB · 18 halaman" */
  meta?: string;
  /** URL of a rendered page thumbnail */
  thumbnail?: string;
  onRemove?: () => void;
  dragHandle?: boolean;
  /** Localized aria-label for the remove button */
  removeLabel?: string;
}
export declare function FileCard(props: FileCardProps): JSX.Element;
