import { ToolInput, ToolOutput, ToolPermission, ToolStatus } from "../../types/tool";

export type { ToolInput, ToolOutput };

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: string;
  tags: string[];
  icon?: string;
  cover?: string;
  permissions: ToolPermission;
  visibility: "public" | "hidden" | "private";
  featured: boolean;
  status: ToolStatus;
}

export interface PluginSchema {
  inputs: ToolInput[];
  outputs: ToolOutput[];
}

export interface PluginSEO {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  canonical?: string;
}

export interface PluginIcon {
  svg: string;
  width?: number;
  height?: number;
}

export interface PluginPermissions {
  permissions: ToolPermission;
  visibility: "public" | "hidden" | "private";
  authenticated?: boolean;
  admin?: boolean;
}

export interface PluginContext {
  inputs: Record<string, unknown>;
}

export interface PluginResult {
  outputs: Record<string, unknown>;
  error?: string;
}

export interface Plugin {
  manifest: PluginManifest;
  schema: PluginSchema;
  seo: PluginSEO;
  icon?: PluginIcon;
  permissions: PluginPermissions;
  execute: (context: PluginContext) => PluginResult | Promise<PluginResult>;
  validate?: (inputs: Record<string, unknown>) => string[];
}
