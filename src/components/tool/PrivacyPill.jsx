import React from "react";
import { Icons } from "../icons/PdfinIcons.jsx";

/** Privacy trust pill — the cyan local-processing marker used on every tool page. */
export function PrivacyPill({ lang = "id", text }) {
  const copy = text || (lang === "id" ? "Diproses di browser" : "Processed in browser");
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      background: "var(--privacy-bg)",
      color: "var(--privacy-fg)",
      border: "1px solid var(--privacy-border)",
      borderRadius: "var(--radius-pill)",
      padding: "6px 12px",
      font: "var(--type-caption)",
    }}>
      {Icons.privacy(12, { stroke: 2.5 })}
      {copy}
    </span>
  );
}
