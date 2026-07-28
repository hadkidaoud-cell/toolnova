import {
  AnalyticsEvent,
  AnalyticsConfig,
  AnalyticsSummary,
  ToolAnalytics,
  PopularTool,
  ActivityEntry,
  TimeSeriesPoint,
  ToolViewEvent,
  ToolUsageEvent,
  ToolErrorEvent,
  ConversionEvent,
  DownloadEvent,
  SearchQueryEvent,
} from "./analytics.types";
import { EventStore, eventStore } from "./stores";
import { createProcessor } from "./processors";
import {
  createToolViewEvent,
  createToolUsageEvent,
  createToolErrorEvent,
  createConversionEvent,
  createDownloadEvent,
  createSearchQueryEvent,
  createPageViewEvent,
  createSessionStartEvent,
  createSessionEndEvent,
} from "./events";

export class AnalyticsService {
  private store: EventStore;
  private buffer: AnalyticsEvent[] = [];
  private config: AnalyticsConfig;

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = {
      maxEvents: 100000,
      retentionDays: 90,
      enableCompression: false,
      batchSize: 100,
      flushInterval: 5000,
      ...config,
    };
    this.store = eventStore;
  }

  trackToolView(tool: ToolViewEvent, metadata?: Record<string, unknown>): void {
    const event = createToolViewEvent(tool, metadata);
    this.buffer.push(event);
    this.checkFlush();
  }

  trackToolUsage(usage: ToolUsageEvent, metadata?: Record<string, unknown>): void {
    const event = createToolUsageEvent(usage, metadata);
    this.buffer.push(event);
    this.checkFlush();
  }

  trackToolError(error: ToolErrorEvent, metadata?: Record<string, unknown>): void {
    const event = createToolErrorEvent(error, metadata);
    this.buffer.push(event);
    this.checkFlush();
  }

  trackConversion(conversion: ConversionEvent, metadata?: Record<string, unknown>): void {
    const event = createConversionEvent(conversion, metadata);
    this.buffer.push(event);
    this.checkFlush();
  }

  trackDownload(download: DownloadEvent, metadata?: Record<string, unknown>): void {
    const event = createDownloadEvent(download, metadata);
    this.buffer.push(event);
    this.checkFlush();
  }

  trackSearch(search: SearchQueryEvent, metadata?: Record<string, unknown>): void {
    const event = createSearchQueryEvent(search, metadata);
    this.buffer.push(event);
    this.checkFlush();
  }

  trackPageView(path: string, metadata?: Record<string, unknown>): void {
    const event = createPageViewEvent(path, metadata);
    this.buffer.push(event);
    this.checkFlush();
  }

  trackSessionStart(metadata?: Record<string, unknown>): void {
    const event = createSessionStartEvent(metadata);
    this.buffer.push(event);
    this.checkFlush();
  }

  trackSessionEnd(duration: number, metadata?: Record<string, unknown>): void {
    const event = createSessionEndEvent(duration, metadata);
    this.buffer.push(event);
    this.flush();
  }

  private checkFlush(): void {
    if (this.buffer.length >= this.config.batchSize) {
      this.flush();
    }
  }

  flush(): void {
    if (this.buffer.length === 0) return;

    this.store.addBatch(this.buffer);
    this.buffer = [];
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
    return this.store.query(filter);
  }

  summarize(): AnalyticsSummary {
    this.flush();
    return createProcessor(this.store.getRecent(this.store.size())).summarize();
  }

  toolAnalytics(toolId: string): ToolAnalytics {
    this.flush();
    const events = this.store.query({ toolId });
    return createProcessor(events).toolAnalytics(toolId);
  }

  popularTools(limit?: number): PopularTool[] {
    this.flush();
    return createProcessor(this.store.getRecent(this.store.size())).popularTools(limit);
  }

  recentActivity(limit?: number): ActivityEntry[] {
    this.flush();
    return createProcessor(this.store.getRecent(this.store.size())).recentActivity(limit);
  }

  timeSeries(type: string, interval: "hour" | "day" | "week" | "month", limit?: number): TimeSeriesPoint[] {
    this.flush();
    return createProcessor(this.store.getRecent(this.store.size())).timeSeries(type, interval, limit);
  }

  topErrors(limit?: number): Array<{ error: string; count: number }> {
    this.flush();
    return createProcessor(this.store.getRecent(this.store.size())).topErrors(limit);
  }

  searchQueries(limit?: number): Array<{ query: string; count: number }> {
    this.flush();
    return createProcessor(this.store.getRecent(this.store.size())).searchQueries(limit);
  }

  eventCount(type?: string): number {
    return this.store.count(type);
  }

  clear(): void {
    this.store.clear();
    this.buffer = [];
  }

  getBuffered(): number {
    return this.buffer.length;
  }
}

export const analyticsService = new AnalyticsService();
