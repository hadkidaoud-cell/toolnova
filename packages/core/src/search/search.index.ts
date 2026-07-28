import { Tool } from "../types/tool";

export interface IndexEntry {
  toolId: string;
  tokens: Map<string, number>;
}

export interface SearchIndexConfig {
  minTokenLength: number;
  maxTokenLength: number;
  enableStemming: boolean;
  enableStopWords: boolean;
}

const DEFAULT_STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "it", "this", "that", "are", "was",
  "were", "be", "been", "being", "have", "has", "had", "do", "does",
  "did", "will", "would", "could", "should", "may", "might", "shall",
  "can", "not", "no", "so", "if", "then", "than", "too", "very",
]);

export class SearchIndex {
  private index: Map<string, IndexEntry> = new Map();
  private config: SearchIndexConfig;

  constructor(config: Partial<SearchIndexConfig> = {}) {
    this.config = {
      minTokenLength: 2,
      maxTokenLength: 50,
      enableStemming: true,
      enableStopWords: true,
      ...config,
    };
  }

  tokenize(text: string): string[] {
    const lower = text.toLowerCase();
    const raw = lower.split(/[^a-z0-9]+/).filter(Boolean);

    let tokens = raw.filter((t) => {
      if (t.length < this.config.minTokenLength) return false;
      if (t.length > this.config.maxTokenLength) return false;
      if (this.config.enableStopWords && DEFAULT_STOP_WORDS.has(t)) return false;
      return true;
    });

    if (this.config.enableStemming) {
      tokens = tokens.map((t) => this.stem(t));
    }

    return [...new Set(tokens)];
  }

  private stem(word: string): string {
    if (word.length <= 3) return word;

    let stemmed = word;

    if (stemmed.endsWith("ing")) {
      stemmed = stemmed.slice(0, -3);
    } else if (stemmed.endsWith("tion")) {
      stemmed = stemmed.slice(0, -4) + "te";
    } else if (stemmed.endsWith("ment")) {
      stemmed = stemmed.slice(0, -4);
    } else if (stemmed.endsWith("ness")) {
      stemmed = stemmed.slice(0, -4);
    } else if (stemmed.endsWith("able")) {
      stemmed = stemmed.slice(0, -4);
    } else if (stemmed.endsWith("ible")) {
      stemmed = stemmed.slice(0, -4);
    } else if (stemmed.endsWith("er")) {
      stemmed = stemmed.slice(0, -2);
    } else if (stemmed.endsWith("ed")) {
      stemmed = stemmed.slice(0, -2);
    } else if (stemmed.endsWith("ly")) {
      stemmed = stemmed.slice(0, -2);
    } else if (stemmed.endsWith("s") && !stemmed.endsWith("ss")) {
      stemmed = stemmed.slice(0, -1);
    }

    return stemmed;
  }

  addTool(tool: Tool): void {
    const tokens = new Map<string, number>();

    const nameTokens = this.tokenize(tool.name);
    for (const t of nameTokens) {
      tokens.set(t, (tokens.get(t) || 0) + 3);
    }

    const descTokens = this.tokenize(tool.description);
    for (const t of descTokens) {
      tokens.set(t, (tokens.get(t) || 0) + 2);
    }

    if (tool.longDescription) {
      const longTokens = this.tokenize(tool.longDescription);
      for (const t of longTokens) {
        tokens.set(t, (tokens.get(t) || 0) + 1);
      }
    }

    const keywordTokens = this.tokenize(tool.keywords.join(" "));
    for (const t of keywordTokens) {
      tokens.set(t, (tokens.get(t) || 0) + 2.5);
    }

    const tagTokens = this.tokenize(tool.tags.join(" "));
    for (const t of tagTokens) {
      tokens.set(t, (tokens.get(t) || 0) + 2);
    }

    const categoryTokens = this.tokenize(tool.category);
    for (const t of categoryTokens) {
      tokens.set(t, (tokens.get(t) || 0) + 1.5);
    }

    this.index.set(tool.id, { toolId: tool.id, tokens });
  }

  removeTool(toolId: string): void {
    this.index.delete(toolId);
  }

  getEntry(toolId: string): IndexEntry | undefined {
    return this.index.get(toolId);
  }

  getTokens(toolId: string): Map<string, number> {
    return this.index.get(toolId)?.tokens || new Map();
  }

  search(queryTokens: string[]): Array<{ toolId: string; score: number }> {
    const scores = new Map<string, number>();

    for (const [toolId, entry] of this.index) {
      let score = 0;
      for (const queryToken of queryTokens) {
        const weight = entry.tokens.get(queryToken) || 0;
        score += weight;
      }
      if (score > 0) {
        scores.set(toolId, score);
      }
    }

    return Array.from(scores.entries())
      .map(([toolId, score]) => ({ toolId, score }))
      .sort((a, b) => b.score - a.score);
  }

  count(): number {
    return this.index.size;
  }

  clear(): void {
    this.index.clear();
  }
}

export const searchIndex = new SearchIndex();
