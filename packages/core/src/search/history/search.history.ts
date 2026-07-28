export interface SearchRecord {
  query: string;
  timestamp: number;
  resultCount: number;
}

export interface SearchHistoryConfig {
  maxRecent: number;
  maxPopular: number;
  recentTTL: number;
}

const DEFAULT_HISTORY_CONFIG: SearchHistoryConfig = {
  maxRecent: 20,
  maxPopular: 50,
  recentTTL: 7 * 24 * 60 * 60 * 1000,
};

export class SearchHistory {
  private recent: SearchRecord[] = [];
  private popular: Map<string, number> = new Map();
  private config: SearchHistoryConfig;

  constructor(config: Partial<SearchHistoryConfig> = {}) {
    this.config = { ...DEFAULT_HISTORY_CONFIG, ...config };
  }

  record(query: string, resultCount: number): void {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return;

    this.recent.unshift({
      query: normalized,
      timestamp: Date.now(),
      resultCount,
    });

    this.pruneRecent();

    this.popular.set(normalized, (this.popular.get(normalized) || 0) + 1);
    this.prunePopular();
  }

  private pruneRecent(): void {
    const now = Date.now();
    this.recent = this.recent
      .filter((r) => now - r.timestamp < this.config.recentTTL)
      .slice(0, this.config.maxRecent);
  }

  private prunePopular(): void {
    if (this.popular.size <= this.config.maxPopular) return;

    const sorted = Array.from(this.popular.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, this.config.maxPopular);

    this.popular = new Map(sorted);
  }

  getRecent(limit: number = 10): string[] {
    return this.recent.slice(0, limit).map((r) => r.query);
  }

  getRecentDetailed(limit: number = 10): SearchRecord[] {
    return this.recent.slice(0, limit);
  }

  getPopular(limit: number = 10): Array<{ query: string; count: number }> {
    return Array.from(this.popular.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query, count]) => ({ query, count }));
  }

  getPopularQueries(limit: number = 10): string[] {
    return this.getPopular(limit).map((p) => p.query);
  }

  clear(): void {
    this.recent = [];
    this.popular.clear();
  }

  count(): number {
    return this.recent.length;
  }

  hasQuery(query: string): boolean {
    return this.recent.some((r) => r.query === query.toLowerCase());
  }
}

export const searchHistory = new SearchHistory();
