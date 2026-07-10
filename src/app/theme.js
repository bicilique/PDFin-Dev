export const THEME_STORAGE_KEY = "pdfin-theme";
export const LEGACY_WORKSPACE_THEME_KEY = "pdfin-ws-theme";

const THEMES = new Set(["light", "dark"]);

export function normalizeTheme(value) {
  return THEMES.has(value) ? value : null;
}

export function getStoredTheme() {
  if (typeof window === "undefined") return null;
  try {
    return normalizeTheme(window.localStorage.getItem(THEME_STORAGE_KEY))
      || normalizeTheme(window.localStorage.getItem(LEGACY_WORKSPACE_THEME_KEY));
  } catch {
    return null;
  }
}

export function getPreferredTheme() {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getInitialTheme(fallback) {
  return getStoredTheme() || normalizeTheme(fallback) || getPreferredTheme();
}

export function persistTheme(theme) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    window.localStorage.setItem(LEGACY_WORKSPACE_THEME_KEY, theme);
  } catch {
    // Storage can be unavailable in private browsing or embedded contexts.
  }
}

export function applyTheme(theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}
