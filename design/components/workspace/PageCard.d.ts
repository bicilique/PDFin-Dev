import * as React from "react";

/** One PDF page in a selectable grid: thumbnail slot (children), page number, selection ring, rotation, hover actions. */
export interface PageCardProps {
  /** 1-based page number shown under the thumbnail */
  pageNumber?: number | string;
  selected?: boolean;
  /** Visual rotation of the thumbnail in degrees (0/90/180/270) */
  rotation?: number;
  /** Thumbnail content: <img> or <canvas> */
  children?: React.ReactNode;
  /** Card width in px (thumbnail keeps 3:4 ratio) */
  width?: number;
  onClick?: (e: React.MouseEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  /** Small Badge shown top-right (e.g. rotation, "OCR") */
  badge?: React.ReactNode;
  /** Hover action buttons (IconButtons) shown bottom-center */
  actions?: React.ReactNode;
  /** Faded (marked for deletion) */
  dimmed?: boolean;
  /** Accessible label override */
  label?: string;
}
export declare function PageCard(props: PageCardProps): JSX.Element;
