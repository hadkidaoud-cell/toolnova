import { Tool } from "../../types";

export interface RankConfig {
  weights: {
    name: number;
    description: number;
    keywords: number;
    tags: number;
    category: number;
    popularity: number;
    featured: number;
    recent: number;
  };
  popularityScale: number;
  recentDaysThreshold: number;
}

export interface RankedResult {
  tool: Tool;
  score: number;
  breakdown: {
    nameScore: number;
    descriptionScore: number;
    keywordsScore: number;
    tagsScore: number;
    categoryScore: number;
    popularityScore: number;
    featuredBonus: number;
    total: number;
  };
}

const DEFAULT_CONFIG: RankConfig = {
  weights: {
    name: 3,
    description: 2,
    keywords: 2.5,
    tags: 2,
    category: 1.5,
    popularity: 1,
    featured: 2,
    recent: 0.5,
  },
  popularityScale: 1000,
  recentDaysThreshold: 30,
};

export class RankingSystem {
  private config: RankConfig;

  constructor(config: Partial<RankConfig> = {}) {
    this.config = {
      weights: { ...DEFAULT_CONFIG.weights, ...config.weights },
      popularityScale: config.popularityScale || DEFAULT_CONFIG.popularityScale,
      recentDaysThreshold: config.recentDaysThreshold || DEFAULT_CONFIG.recentDaysThreshold,
    };
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length >= 2);
  }

  private scoreText(text: string, queryTokens: string[], weight: number): number {
    const textTokens = this.tokenize(text);
    let score = 0;

    for (const queryToken of queryTokens) {
      for (const textToken of textTokens) {
        if (textToken === queryToken) {
          score += weight * 2;
        } else if (textToken.startsWith(queryToken)) {
          score += weight * 1.5;
        } else if (textToken.includes(queryToken)) {
          score += weight;
        }
      }
    }

    return score;
  }

  private scoreArray(arr: string[], queryTokens: string[], weight: number): number {
    let score = 0;
    for (const item of arr) {
      score += this.scoreText(item, queryTokens, weight);
    }
    return score;
  }

  private calculatePopularityScore(popularity: number): number {
    return Math.min(popularity / this.config.popularityScale, 1) * this.config.weights.popularity;
  }

  private calculateRecencyScore(updatedAt: string): number {
    const now = Date.now();
    const updated = new Date(updatedAt).getTime();
    const daysDiff = (now - updated) / (1000 * 60 * 60 * 24);

    if (daysDiff > this.config.recentDaysThreshold) return 0;

    const recency = 1 - daysDiff / this.config.recentDaysThreshold;
    return recency * this.config.weights.recent;
  }

  rank(tools: Tool[], query: string): RankedResult[] {
    const queryTokens = this.tokenize(query);

    return tools
      .map((tool) => {
        const nameScore = this.scoreText(tool.name, queryTokens, this.config.weights.name);
        const descriptionScore = this.scoreText(tool.description, queryTokens, this.config.weights.description);
        const keywordsScore = this.scoreArray(tool.keywords, queryTokens, this.config.weights.keywords);
        const tagsScore = this.scoreArray(tool.tags, queryTokens, this.config.weights.tags);
        const categoryScore = this.scoreText(tool.category, queryTokens, this.config.weights.category);
        const popularityScore = this.calculatePopularityScore(tool.popularity);
        const featuredBonus = tool.featured ? this.config.weights.featured : 0;
        const recentScore = this.calculateRecencyScore(tool.updatedAt);

        const total =
          nameScore +
          descriptionScore +
          keywordsScore +
          tagsScore +
          categoryScore +
          popularityScore +
          featuredBonus +
          recentScore;

        return {
          tool,
          score: total,
          breakdown: {
            nameScore,
            descriptionScore,
            keywordsScore,
            tagsScore,
            categoryScore,
            popularityScore,
            featuredBonus,
            total,
          },
        };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);
  }
}

export const rankingSystem = new RankingSystem();
