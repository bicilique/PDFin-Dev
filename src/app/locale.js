export const LANG_STORAGE_KEY = "pdfin-lang";
const LEGACY_LANG_STORAGE_KEY = "pdfin-ws-lang";

function sanitizeLang(value) {
  if (value === "id" || value === "en") return value;
  return null;
}

export function detectBrowserLang() {
  if (typeof navigator === "undefined") return "id";
  const candidate = navigator.language || navigator.userLanguage || "";
  if (typeof candidate !== "string") return "id";
  const [language] = candidate.toLowerCase().split("-");
  return language === "id" ? "id" : "en";
}

export function getPersistedLang() {
  if (typeof localStorage === "undefined") return null;
  try {
    const preferred = localStorage.getItem(LANG_STORAGE_KEY) || localStorage.getItem(LEGACY_LANG_STORAGE_KEY);
    return sanitizeLang(preferred);
  } catch {
    return null;
  }
}

export function getInitialLang() {
  return getPersistedLang() || detectBrowserLang();
}

export function persistLangPreference(lang) {
  if (typeof localStorage === "undefined") return;
  const normalized = sanitizeLang(lang);
  if (!normalized) return;
  try {
    localStorage.setItem(LANG_STORAGE_KEY, normalized);
    if (localStorage.getItem(LEGACY_LANG_STORAGE_KEY) !== null) {
      localStorage.removeItem(LEGACY_LANG_STORAGE_KEY);
    }
  } catch {
    // ignore storage failures (private mode/readonly env)
  }
}
