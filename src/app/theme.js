export const THEME_STORAGE_KEY = "pdfin-theme";
export const LEGACY_WORKSPACE_THEME_KEY = "pdfin-ws-theme";

const THEMES = new Set(["light", "dark"]);

export function normalizeTheme(value) {
  return THEMES.has(value) ? value : null;
}

export function getStoredTheme() {
  if (typeof window === "undefined") return null;
  try {
    return normalizeTheme(window.localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function getLegacyStoredTheme() {
  if (typeof window === "undefined") return null;
  try {
    return normalizeTheme(window.localStorage.getItem(LEGACY_WORKSPACE_THEME_KEY));
  } catch {
    return null;
  }
}

export function getExplicitThemePreference() {
  return getStoredTheme() || getLegacyStoredTheme();
}

export function getInitialTheme(fallback) {
  return getExplicitThemePreference() || normalizeTheme(fallback) || "light";
}

export function persistExplicitTheme(theme) {
  if (typeof window === "undefined") return;
  const nextTheme = normalizeTheme(theme);
  if (!nextTheme) return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    window.localStorage.removeItem(LEGACY_WORKSPACE_THEME_KEY);
  } catch {
    // Storage can be unavailable in private browsing or embedded contexts.
  }
}

export function migrateLegacyThemePreference() {
  if (typeof window === "undefined") return;
  try {
    if (normalizeTheme(window.localStorage.getItem(THEME_STORAGE_KEY))) return;
    const legacyTheme = normalizeTheme(window.localStorage.getItem(LEGACY_WORKSPACE_THEME_KEY));
    if (legacyTheme) {
      window.localStorage.setItem(THEME_STORAGE_KEY, legacyTheme);
      window.localStorage.removeItem(LEGACY_WORKSPACE_THEME_KEY);
    }
  } catch {
    // Storage can be unavailable in private browsing or embedded contexts.
  }
}

export function applyTheme(theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}
