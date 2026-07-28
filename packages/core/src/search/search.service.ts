import { Tool, ToolFilter } from "../types";
import { SearchIndex, searchIndex } from "./search.index";
import { RankingSystem, rankingSystem } from "./ranking";
import { SuggestionEngine, suggestionEngine, Suggestion } from "./suggestions";
import { SearchHistory, searchHistory } from "./history";

export interface SearchConfig {
  maxResults: number;
  enableRanking: boolean;
  enableSuggestions: boolean;
  enableHistory: boolean;
  minQueryLength: number;
}

export interface SearchResult {
  tool: Tool;
  score: number;
  rank: number;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  suggestions: string[];
  total: number;
  took: number;
}

const DEFAULT_SEARCH_CONFIG: SearchConfig = {
  maxResults: 50,
  enableRanking: true,
  enableSuggestions: true,
  enableHistory: true,
  minQueryLength: 1,
};

export class SearchService {
  private index: SearchIndex;
  private ranking: RankingSystem;
  private suggestions: SuggestionEngine;
  private history: SearchHistory;
  private config: SearchConfig;

  constructor(config: Partial<SearchConfig> = {}) {
    this.config = { ...DEFAULT_SEARCH_CONFIG, ...config };
    this.index = searchIndex;
    this.ranking = rankingSystem;
    this.suggestions = suggestionEngine;
    this.history = searchHistory;
  }

  indexTools(tools: Tool[]): void {
    for (const tool of tools) {
      this.index.addTool(tool);
    }
    this.suggestions.setTools(tools);
  }

  indexTool(tool: Tool): void {
    this.index.addTool(tool);
  }

  removeTool(toolId: string): void {
    this.index.removeTool(toolId);
  }

  search(query: string, filter?: ToolFilter): SearchResponse {
    const start = performance.now();

    if (!query || query.trim().length < this.config.minQueryLength) {
      return {
        query,
        results: [],
        suggestions: this.config.enableSuggestions
          ? this.suggestions.getTopSuggestions(query)
          : [],
        total: 0,
        took: 0,
      };
    }

    const queryTokens = this.index.tokenize(query);
    const indexResults = this.index.search(queryTokens);

    let results: SearchResult[];

    if (this.config.enableRanking && indexResults.length > 0) {
      const toolMap = new Map<string, Tool>();
      for (const r of indexResults) {
        const entry = this.index.getEntry(r.toolId);
        if (entry) {
          const tools = this.getAllTools();
          const tool = tools.find((t) => t.id === r.toolId);
          if (tool) toolMap.set(r.toolId, tool);
        }
      }

      const toolsToRank = indexResults
        .map((r) => toolMap.get(r.toolId))
        .filter((t): t is Tool => t !== undefined);

      const ranked = this.ranking.rank(toolsToRank, query);

      results = ranked.slice(0, this.config.maxResults).map((r, i) => ({
        tool: r.tool,
        score: r.score,
        rank: i + 1,
      }));
    } else {
      const tools = this.getAllTools();
      results = indexResults
        .slice(0, this.config.maxResults)
        .map((r, i) => {
          const tool = tools.find((t) => t.id === r.toolId);
          return tool
            ? { tool, score: r.score, rank: i + 1 }
            : null;
        })
        .filter((r): r is SearchResult => r !== null);
    }

    if (filter) {
      results = this.applyFilter(results, filter);
    }

    if (this.config.enableHistory) {
      this.history.record(query, results.length);
    }

    const took = performance.now() - start;

    return {
      query,
      results,
      suggestions: this.config.enableSuggestions
        ? this.suggestions.getTopSuggestions(query)
        : [],
      total: results.length,
      took,
    };
  }

  private applyFilter(results: SearchResult[], filter: ToolFilter): SearchResult[] {
    return results.filter((r) => {
      if (filter.category && r.tool.category !== filter.category) return false;
      if (filter.tags && filter.tags.length > 0) {
        if (!filter.tags.some((t: string) => r.tool.tags.includes(t))) return false;
      }
      if (filter.featured !== undefined && r.tool.featured !== filter.featured) return false;
      if (filter.visible !== undefined && r.tool.visibility !== (filter.visible ? "public" : "hidden")) return false;
      if (filter.status !== undefined && r.tool.status !== filter.status) return false;
      return true;
    });
  }

  private getAllTools(): Tool[] {
    const tools: Tool[] = [];
    for (const entry of Array.from(this.index["index"].values())) {
      tools.push({ id: entry.toolId } as Tool);
    }
    return tools;
  }

  getSuggestions(query: string): Suggestion[] {
    return this.suggestions.getSuggestions(query);
  }

  getRecentSearches(limit: number = 10): string[] {
    return this.history.getRecent(limit);
  }

  getPopularSearches(limit: number = 10): Array<{ query: string; count: number }> {
    return this.history.getPopular(limit);
  }

  clearHistory(): void {
    this.history.clear();
  }

  clearIndex(): void {
    this.index.clear();
  }

  indexCount(): number {
    return this.index.count();
  }
}

export const searchService = new SearchService();
