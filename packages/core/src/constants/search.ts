export const SEARCH_CONFIG = {
  minScore: 0.1,
  maxResults: 50,
  weights: {
    name: 3,
    description: 2,
    tags: 2.5,
    category: 1.5,
  },
} as const;

export const TOOL_DEFAULTS = {
  version: "1.0.0",
  popularity: 0,
  featured: false,
  visible: true,
} as const;

export const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 100,
} as const;
