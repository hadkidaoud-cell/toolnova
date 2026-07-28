// ============================================================
// ToolNova Core Types
// ============================================================

export interface Tool {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription?: string;
  category: string;
  icon: string;
  href: string;
  keywords: string[];
  isPopular: boolean;
  isNew: boolean;
  isActive: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
  config: ToolConfig;
  seo: ToolSEO;
}

export interface ToolConfig {
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  requiresAuth: boolean;
  isPremium: boolean;
  allowedFileTypes?: string[];
  maxFileSize?: number;
}

export interface ToolSEO {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
}

export interface ToolCategory {
  id: string;
  slug: string;
  name: string;
  nameAr: string;
  description: string;
  icon: string;
  color: string;
  tools: Tool[];
  order: number;
}

export interface ToolRegistryEntry {
  id: string;
  component: React.ComponentType<ToolProps>;
  config: ToolConfig;
  metadata: ToolMetadata;
}

export interface ToolProps {
  tool: Tool;
  isEmbedded?: boolean;
}

export interface ToolMetadata {
  name: string;
  description: string;
  category: string;
  icon: string;
  keywords: string[];
  version: string;
  author: string;
}

export type Theme = "light" | "dark" | "system";

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavItem[];
  isExternal?: boolean;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchParams {
  q?: string;
  category?: string;
  page?: number;
  limit?: number;
  sort?: "popular" | "newest" | "alphabetical";
}
