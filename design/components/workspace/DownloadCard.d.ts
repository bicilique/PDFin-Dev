import * as React from "react";

/** Result file card: success icon, mono filename, meta line, primary download button. */
export interface DownloadCardProps {
  name: string;
  /** e.g. "1,8 MB · 24 halaman" */
  meta?: string;
  /** Localized button label ("Unduh" / "Download") */
  downloadLabel?: string;
  onDownload?: () => void;
  /** Override the leading icon */
  icon?: React.ReactNode;
}
export declare function DownloadCard(props: DownloadCardProps): JSX.Element;
