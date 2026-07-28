// ============================================================
// ToolNova Plugin Types
// ============================================================

import type { ComponentType } from "react";

export interface ToolPlugin {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription?: string;
  category: string;
  icon: string;
  keywords: string[];
  version: string;
  author: string;
  isActive: boolean;
  isNew: boolean;
  isPopular: boolean;
  requiresAuth: boolean;
  isPremium: boolean;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  component: ComponentType<ToolPluginProps>;
}

export interface ToolPluginProps {
  plugin: ToolPlugin;
  isEmbedded?: boolean;
}

export interface PluginRegistration {
  plugin: ToolPlugin;
  registeredAt: Date;
}

export interface PluginRegistryInterface {
  register(plugin: ToolPlugin): void;
  registerAll(plugins: ToolPlugin[]): void;
  get(slug: string): ToolPlugin | undefined;
  getAll(): ToolPlugin[];
  getByCategory(category: string): ToolPlugin[];
  search(query: string): ToolPlugin[];
  getPopular(limit?: number): ToolPlugin[];
  getNew(limit?: number): ToolPlugin[];
  getCount(): number;
}
