import { Tool, SearchResult, ToolFilter } from "../types";
import { toolRegistry } from "../registry";
import { searchTools } from "../utils";

export class SearchRegistry {
  private queryCache: Map<string, SearchResult[]> = new Map();

  search(query: string): SearchResult[] {
    const cached = this.queryCache.get(query);
    if (cached) return cached;

    const results = searchTools(toolRegistry.getAll(), query);
    this.queryCache.set(query, results);
    return results;
  }

  searchWithFilter(query: string, filter: ToolFilter): SearchResult[] {
    let results = this.search(query);

    if (filter.category) {
      results = results.filter((r) => r.tool.category === filter.category);
    }

    if (filter.tags && filter.tags.length > 0) {
      results = results.filter((r) =>
        filter.tags!.some((tag) => r.tool.tags.includes(tag))
      );
    }

    if (filter.limit) {
      results = results.slice(0, filter.limit);
    }

    return results;
  }

  clearCache(): void {
    this.queryCache.clear();
  }

  resultsToTools(results: SearchResult[]): Tool[] {
    return results.map((r) => r.tool);
  }

  getSuggestions(query: string, limit: number = 5): string[] {
    const tools = toolRegistry.getAll();
    const seen = new Set<string>();
    const suggestions: string[] = [];

    for (const tool of tools) {
      if (tool.status !== "published") continue;

      const words = [
        ...tool.name.split(/\s+/),
        ...tool.tags,
      ];

      for (const word of words) {
        const lower = word.toLowerCase();
        if (lower.startsWith(query.toLowerCase()) && !seen.has(lower)) {
          seen.add(lower);
          suggestions.push(word);
          if (suggestions.length >= limit) return suggestions;
        }
      }
    }

    return suggestions;
  }
}

export const searchRegistry = new SearchRegistry();
