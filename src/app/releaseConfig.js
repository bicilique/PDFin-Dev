const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

function readEnv(name, fallback = "") {
  const viteValue = import.meta.env?.[name];
  if (viteValue != null) return String(viteValue);
  if (typeof process !== "undefined" && process.env?.[name] != null) return String(process.env[name]);
  const nodeAlias = name.replace(/^VITE_/, "");
  if (typeof process !== "undefined" && process.env?.[nodeAlias] != null) return String(process.env[nodeAlias]);
  return fallback;
}

function readBoolean(name, fallback = false) {
  const value = readEnv(name, fallback ? "true" : "false").trim().toLowerCase();
  return TRUE_VALUES.has(value);
}

export const RELEASE_CONFIG = {
  appStage: readEnv("VITE_APP_STAGE", "limited_access"),
  enablePublicIndexing: readBoolean("VITE_ENABLE_PUBLIC_INDEXING", false),
  enableSelfHostedPage: readBoolean("VITE_ENABLE_SELF_HOSTED_PAGE", false),
  enableSelfHostedInquiry: readBoolean("VITE_ENABLE_SELF_HOSTED_INQUIRY", false),
  enableExperimentalTools: readBoolean("VITE_ENABLE_EXPERIMENTAL_TOOLS", false),
  enableProductAnalytics: readBoolean("VITE_ENABLE_PRODUCT_ANALYTICS", false),
  enablePublicDocumentation: readBoolean("VITE_ENABLE_PUBLIC_DOCUMENTATION", false),
};

export function stageLabel(lang = "id") {
  if (RELEASE_CONFIG.appStage === "public_beta") return "Public Beta";
  if (RELEASE_CONFIG.appStage === "public") return lang === "id" ? "Publik" : "Public";
  return lang === "id" ? "Akses awal terbatas" : "Limited early access";
}
