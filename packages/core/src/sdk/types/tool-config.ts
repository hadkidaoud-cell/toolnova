export interface ToolConfig<TSchema extends Record<string, unknown> = Record<string, unknown>> {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  tags: string[];
  icon?: string;
  cover?: string;
  inputs?: Array<Record<string, unknown>>;
  permissions: ToolConfigPermission;
  timeout: number;
  retries: number;
  retryDelay: number;
  cacheable: boolean;
  cacheTtl: number;
  rateLimit: ToolRateLimit | null;
  metadata: ToolConfigMetadata;
  schema: TSchema;
}

export interface ToolConfigPermission {
  access: "public" | "authenticated" | "admin";
  roles?: string[];
}

export interface ToolRateLimit {
  windowMs: number;
  maxRequests: number;
}

export interface ToolConfigMetadata {
  author: string;
  authorUrl?: string;
  documentation?: string;
  source?: string;
  license?: string;
}

export interface ToolConfigOverrides<TSchema extends Record<string, unknown> = Record<string, unknown>> {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  cacheable?: boolean;
  cacheTtl?: number;
  rateLimit?: ToolRateLimit | null;
  schema?: Partial<TSchema>;
}

export const DEFAULT_TOOL_CONFIG: Omit<ToolConfig, "id" | "name" | "description" | "category"> = {
  version: "1.0.0",
  tags: [],
  permissions: {
    access: "public",
  },
  timeout: 30000,
  retries: 0,
  retryDelay: 1000,
  cacheable: false,
  cacheTtl: 0,
  rateLimit: null,
  metadata: {
    author: "ToolNova",
  },
  schema: {},
};
