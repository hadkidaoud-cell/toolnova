import { Tool, SearchResult } from "../types";
import { SEARCH_CONFIG } from "../constants";

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s\-_]+/)
    .filter((t) => t.length > 0);
}

function scoreToken(query: string, token: string, weight: number): number {
  if (token === query) return weight * 2;
  if (token.startsWith(query)) return weight * 1.5;
  if (token.includes(query)) return weight;
  return 0;
}

export function searchTools(tools: Tool[], query: string): SearchResult[] {
  if (!query.trim()) return [];

  const tokens = tokenize(query);
  const results: SearchResult[] = [];

  for (const tool of tools) {
    if (tool.status !== "published") continue;

    let score = 0;

    for (const token of tokens) {
      score += scoreToken(token, tool.name.toLowerCase(), SEARCH_CONFIG.weights.name);
      score += scoreToken(token, tool.description.toLowerCase(), SEARCH_CONFIG.weights.description);

      for (const tag of tool.tags) {
        score += scoreToken(token, tag.toLowerCase(), SEARCH_CONFIG.weights.tags);
      }

      score += scoreToken(token, tool.category.toLowerCase(), SEARCH_CONFIG.weights.category);
    }

    if (score >= SEARCH_CONFIG.minScore) {
      results.push({ tool, score });
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, SEARCH_CONFIG.maxResults);
}
