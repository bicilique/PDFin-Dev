import { WORKSPACE_TOOL_IDS } from "../features/workspace/toolCatalog.js";
export { DEFAULT_TOOL_ID, PROTOTYPE_TOOL_IDS, WORKSPACE_TOOL_IDS } from "../features/workspace/toolCatalog.js";

export const PRIVACY_SECURITY_PATH = "/privacy-security/";
export const SELF_HOSTED_PATH = "/self-hosted/";

const TOOL_PATH_ALIASES = {
  paraf: "sign",
  sign: "sign",
};

export function normalizeHash(hash = "") {
  return hash.replace(/^#/, "").trim();
}

export function getToolFromHash(hash = window.location.hash) {
  const tool = normalizeHash(hash);
  return WORKSPACE_TOOL_IDS.includes(tool) ? tool : null;
}

export function normalizePath(pathname = window.location.pathname) {
  const base = import.meta.env.BASE_URL || "/";
  let path = pathname || "/";
  if (base !== "/" && path.startsWith(base)) path = `/${path.slice(base.length)}`;
  return `/${path.replace(/^\/|\/$/g, "")}${path === "/" ? "" : "/"}`;
}

export function getToolSlug(toolId) {
  if (toolId === "sign") return "paraf";
  return toolId;
}

export function getToolFromPath(pathname = window.location.pathname) {
  const slug = normalizePath(pathname).replace(/^\/|\/$/g, "");
  if (!slug) return null;
  const toolId = TOOL_PATH_ALIASES[slug] || slug;
  return WORKSPACE_TOOL_IDS.includes(toolId) ? toolId : null;
}

export function isPrivacyRoute(pathname = window.location.pathname) {
  return normalizePath(pathname) === PRIVACY_SECURITY_PATH;
}

export function isSelfHostedRoute(pathname = window.location.pathname) {
  return normalizePath(pathname) === SELF_HOSTED_PATH;
}

export function isWorkspaceRoute(pathname = window.location.pathname, hash = window.location.hash) {
  return pathname.endsWith("/workspace") || normalizeHash(hash) === "workspace" || getToolFromHash(hash) !== null || getToolFromPath(pathname) !== null;
}

export function getToolHref(toolId) {
  return `${import.meta.env.BASE_URL}${getToolSlug(toolId)}/`;
}

export function getPrivacyHref() {
  return `${import.meta.env.BASE_URL}${PRIVACY_SECURITY_PATH.replace(/^\//, "")}`;
}

export function getSelfHostedHref() {
  return `${import.meta.env.BASE_URL}${SELF_HOSTED_PATH.replace(/^\//, "")}`;
}
