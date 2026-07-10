import { WORKSPACE_TOOL_IDS } from "../features/workspace/toolCatalog.js";
export { DEFAULT_TOOL_ID, PROTOTYPE_TOOL_IDS, WORKSPACE_TOOL_IDS } from "../features/workspace/toolCatalog.js";

export function normalizeHash(hash = "") {
  return hash.replace(/^#/, "").trim();
}

export function getToolFromHash(hash = window.location.hash) {
  const tool = normalizeHash(hash);
  return WORKSPACE_TOOL_IDS.includes(tool) ? tool : null;
}

export function isWorkspaceRoute(pathname = window.location.pathname, hash = window.location.hash) {
  return pathname.endsWith("/workspace") || normalizeHash(hash) === "workspace" || getToolFromHash(hash) !== null;
}

export function getToolHref(toolId) {
  return `${import.meta.env.BASE_URL}#${toolId}`;
}
