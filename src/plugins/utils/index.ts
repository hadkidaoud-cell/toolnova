// ============================================================
// ToolNova Plugin Utilities
// ============================================================

import type { ToolPlugin } from "../types";

export function getToolUrl(tool: ToolPlugin): string {
  return `/tools/${tool.category}/${tool.slug}`;
}

export function getToolTitle(tool: ToolPlugin): string {
  return `${tool.name} - Free Online Tool | ToolNova`;
}

export function getToolDescription(tool: ToolPlugin): string {
  return tool.longDescription || tool.description;
}

export function validatePlugin(plugin: Partial<ToolPlugin>): string[] {
  const errors: string[] = [];
  if (!plugin.id) errors.push("Plugin id is required");
  if (!plugin.slug) errors.push("Plugin slug is required");
  if (!plugin.name) errors.push("Plugin name is required");
  if (!plugin.description) errors.push("Plugin description is required");
  if (!plugin.category) errors.push("Plugin category is required");
  if (!plugin.component) errors.push("Plugin component is required");
  if (!plugin.version) errors.push("Plugin version is required");
  return errors;
}
