import React from "react";

/** Privacy trust pill — the cyan local-processing marker used on every tool page. */
export function PrivacyPill({ lang = "id", text }) {
  const copy = text || (lang === "id" ? "File tetap di perangkat Anda" : "Your files stay on your device");
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
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
      {copy}
    </span>
  );
}
