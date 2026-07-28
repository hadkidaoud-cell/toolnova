import { AnalyticsEvent, AnalyticsConfig } from "../analytics.types";

const DEFAULT_CONFIG: AnalyticsConfig = {
  maxEvents: 100000,
  retentionDays: 90,
  enableCompression: false,
  batchSize: 100,
  flushInterval: 5000,
};

export class EventStore {
  private events: AnalyticsEvent[] = [];
  private config: AnalyticsConfig;

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  add(event: AnalyticsEvent): void {
    this.events.push(event);
    this.prune();
  }

  addBatch(events: AnalyticsEvent[]): void {
    this.events.push(...events);
    this.prune();
  }

  query(filter: {
    type?: string;
    toolId?: string;
    sessionId?: string;
    userId?: string;
    since?: number;
    until?: number;
    limit?: number;
  }): AnalyticsEvent[] {
    let results = this.events;

    if (filter.type) {
      results = results.filter((e) => e.type === filter.type);
    }
    if (filter.toolId) {
      results = results.filter((e) => e.data.toolId === filter.toolId);
    }
    if (filter.sessionId) {
      results = results.filter((e) => e.sessionId === filter.sessionId);
    }
    if (filter.userId) {
      results = results.filter((e) => e.userId === filter.userId);
    }
    if (filter.since !== undefined) {
      const since = filter.since;
      results = results.filter((e) => e.timestamp >= since);
    }
    if (filter.until !== undefined) {
      const until = filter.until;
      results = results.filter((e) => e.timestamp <= until);
    }
    if (filter.limit) {
      results = results.slice(0, filter.limit);
    }

    return results;
  }

  count(type?: string): number {
    if (!type) return this.events.length;
    return this.events.filter((e) => e.type === type).length;
  }

  countByTool(toolId: string): number {
    return this.events.filter((e) => e.data.toolId === toolId).length;
  }

  getRecent(limit: number = 50): AnalyticsEvent[] {
    return this.events.slice(-limit);
  }

  clear(): void {
    this.events = [];
  }

  size(): number {
    return this.events.length;
  }

  private prune(): void {
    const cutoff = Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000;
    this.events = this.events.filter((e) => e.timestamp >= cutoff);

    if (this.events.length > this.config.maxEvents) {
      this.events = this.events.slice(-this.config.maxEvents);
    }
  }
}

export const eventStore = new EventStore();
