import { Tool } from "../../types/tool";

export interface Suggestion {
  text: string;
  type: "tool" | "category" | "tag" | "keyword";
  score: number;
}

export interface SuggestionConfig {
  maxSuggestions: number;
  minScore: number;
  enableFuzzy: boolean;
  fuzzyThreshold: number;
}

const DEFAULT_SUGGESTION_CONFIG: SuggestionConfig = {
  maxSuggestions: 10,
  minScore: 0.1,
  enableFuzzy: true,
  fuzzyThreshold: 0.6,
};

export class SuggestionEngine {
  private tools: Tool[] = [];
  private config: SuggestionConfig;

  constructor(config: Partial<SuggestionConfig> = {}) {
    this.config = { ...DEFAULT_SUGGESTION_CONFIG, ...config };
  }

  setTools(tools: Tool[]): void {
    this.tools = tools;
  }

  private levenshtein(a: string, b: string): number {
    const m = a.length;
    const n = b.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0) as number[]);

    for (let i = 0; i <= m; i++) {
      const row = dp[i];
      if (row) row[0] = i;
    }
    for (let j = 0; j <= n; j++) {
      const row = dp[0];
      if (row) row[j] = j;
    }

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const row = dp[i];
        const prevRow = dp[i - 1];
        if (row && prevRow) {
          const aChar = a[i - 1];
          const bChar = b[j - 1];
          const prevJ = row[j - 1] ?? 0;
          const prevI = prevRow[j] ?? 0;
          const prevIJ = prevRow[j - 1] ?? 0;
          row[j] = aChar === bChar
            ? prevIJ
            : Math.min(prevI + 1, prevJ + 1, prevIJ + 1);
        }
      }
    }

    const lastRow = dp[m];
    return lastRow ? lastRow[n] ?? 0 : 0;
  }

  private fuzzyMatch(query: string, target: string): number {
    const lowerQuery = query.toLowerCase();
    const lowerTarget = target.toLowerCase();

    if (lowerTarget.startsWith(lowerQuery)) return 1;
    if (lowerTarget.includes(lowerQuery)) return 0.8;

    const distance = this.levenshtein(lowerQuery, lowerTarget);
    const maxLen = Math.max(lowerQuery.length, lowerTarget.length);
    const similarity = 1 - distance / maxLen;

    return similarity >= this.config.fuzzyThreshold ? similarity : 0;
  }

  private extractSuggestions(query: string): Suggestion[] {
    const suggestions: Suggestion[] = [];
    const lowerQuery = query.toLowerCase();

    for (const tool of this.tools) {
      if (tool.status !== "published") continue;

      const nameScore = this.fuzzyMatch(lowerQuery, tool.name.toLowerCase());
      if (nameScore > 0) {
        suggestions.push({
          text: tool.name,
          type: "tool",
          score: nameScore * 3,
        });
      }

      for (const tag of tool.tags) {
        const tagScore = this.fuzzyMatch(lowerQuery, tag.toLowerCase());
        if (tagScore > 0) {
          suggestions.push({
            text: tag,
            type: "tag",
            score: tagScore * 2,
          });
        }
      }

      for (const keyword of tool.keywords) {
        const keywordScore = this.fuzzyMatch(lowerQuery, keyword.toLowerCase());
        if (keywordScore > 0) {
          suggestions.push({
            text: keyword,
            type: "keyword",
            score: keywordScore * 2,
          });
        }
      }

      const categoryScore = this.fuzzyMatch(lowerQuery, tool.category.toLowerCase());
      if (categoryScore > 0) {
        suggestions.push({
          text: tool.category,
          type: "category",
          score: categoryScore,
        });
      }
    }

    return suggestions;
  }

  private deduplicate(suggestions: Suggestion[]): Suggestion[] {
    const seen = new Map<string, Suggestion>();

    for (const s of suggestions) {
      const key = `${s.type}:${s.text.toLowerCase()}`;
      const existing = seen.get(key);

      if (!existing || s.score > existing.score) {
        seen.set(key, s);
      }
    }

    return Array.from(seen.values());
  }

  getSuggestions(query: string): Suggestion[] {
    if (!query.trim()) return [];

    const raw = this.extractSuggestions(query);
    const deduped = this.deduplicate(raw);

    return deduped
      .filter((s) => s.score >= this.config.minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, this.config.maxSuggestions);
  }

  getTopSuggestions(query: string, limit: number = 5): string[] {
    return this.getSuggestions(query).slice(0, limit).map((s) => s.text);
  }
}

export const suggestionEngine = new SuggestionEngine();
