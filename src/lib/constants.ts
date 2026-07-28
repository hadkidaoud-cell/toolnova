// ============================================================
// ToolNova Constants
// ============================================================

export const APP_NAME = "ToolNova";
export const APP_DESCRIPTION = "Every Tool. One Place.";

export const ROUTES = {
  home: "/",
  tools: "/tools",
  about: "/about",
  contact: "/contact",
  pricing: "/pricing",
  login: "/login",
  register: "/register",
} as const;

export const API_ROUTES = {
  tools: "/api/v1/tools",
  search: "/api/v1/search",
  categories: "/api/v1/categories",
} as const;

export const STORAGE_KEYS = {
  theme: "toolnova-theme",
  recentTools: "toolnova-recent-tools",
} as const;

export const LIMITS = {
  maxFileSize: 10 * 1024 * 1024,
  toolsPerPage: 12,
  maxSearchResults: 50,
} as const;

export const TOOL_CATEGORIES = [
  { slug: "image", name: "Image Tools", icon: "image", color: "#3b82f6" },
  { slug: "text", name: "Text Tools", icon: "type", color: "#8b5cf6" },
  { slug: "calculator", name: "Calculators", icon: "calculator", color: "#10b981" },
  { slug: "converter", name: "Converters", icon: "repeat", color: "#f59e0b" },
  { slug: "generator", name: "Generators", icon: "zap", color: "#ef4444" },
  { slug: "developer", name: "Developer Tools", icon: "code", color: "#6366f1" },
  { slug: "seo", name: "SEO Tools", icon: "search", color: "#ec4899" },
  { slug: "social", name: "Social Media", icon: "share2", color: "#14b8a6" },
] as const;
