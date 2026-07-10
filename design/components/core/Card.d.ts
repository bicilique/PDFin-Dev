import * as React from "react";

/** Standard PDFin surface card: white, 1px border, 14px radius, soft shadow. */
export interface CardProps {
  raised?: boolean;
  padding?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
export declare function Card(props: CardProps): JSX.Element;
