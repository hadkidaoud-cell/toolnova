import {
  AnalyticsEvent,
  AnalyticsSummary,
  ToolAnalytics,
  PopularTool,
  ActivityEntry,
  TimeSeriesPoint,
} from "../analytics.types";

export class AnalyticsProcessor {
  private events: AnalyticsEvent[];

  constructor(events: AnalyticsEvent[]) {
    this.events = events;
  }

  summarize(): AnalyticsSummary {
    const views = this.events.filter((e) => e.type === "tool_view");
    const usage = this.events.filter((e) => e.type === "tool_usage");
    const errors = this.events.filter((e) => e.type === "tool_error");
    const conversions = this.events.filter((e) => e.type === "conversion");
    const downloads = this.events.filter((e) => e.type === "download");
    const searches = this.events.filter((e) => e.type === "search_query");

    const toolIds = new Set(this.events.map((e) => e.data.toolId).filter(Boolean));

    const durations = usage.map((e) => e.data.duration as number).filter(Boolean);
    const avgDuration = durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;

    const errorRate = views.length > 0 ? (errors.length / views.length) * 100 : 0;
    const conversionRate = views.length > 0 ? (conversions.length / views.length) * 100 : 0;

    return {
      totalViews: views.length,
      totalUsage: usage.length,
      totalErrors: errors.length,
      totalConversions: conversions.length,
      totalDownloads: downloads.length,
      totalSearches: searches.length,
      uniqueTools: toolIds.size,
      averageUsageDuration: avgDuration,
      errorRate,
      conversionRate,
    };
  }

  toolAnalytics(toolId: string): ToolAnalytics {
    const toolEvents = this.events.filter((e) => e.data.toolId === toolId);
    const views = toolEvents.filter((e) => e.type === "tool_view");
    const usage = toolEvents.filter((e) => e.type === "tool_usage");
    const errors = toolEvents.filter((e) => e.type === "tool_error");
    const conversions = toolEvents.filter((e) => e.type === "conversion");
    const downloads = toolEvents.filter((e) => e.type === "download");

    const durations = usage.map((e) => e.data.duration as number).filter(Boolean);
    const avgDuration = durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;

    const lastViewEvent = views[views.length - 1];
    const lastView = lastViewEvent ? lastViewEvent.timestamp : undefined;
    const lastUseEvent = usage[usage.length - 1];
    const lastUse = lastUseEvent ? lastUseEvent.timestamp : undefined;

    return {
      toolId,
      views: views.length,
      usageCount: usage.length,
      errorCount: errors.length,
      conversionCount: conversions.length,
      downloadCount: downloads.length,
      averageDuration: avgDuration,
      lastViewed: lastView,
      lastUsed: lastUse,
    };
  }

  popularTools(limit: number = 10): PopularTool[] {
    const toolMap = new Map<string, { views: number; usage: number; name: string; slug: string }>();

    for (const event of this.events) {
      if (event.type === "tool_view" || event.type === "tool_usage") {
        const toolId = event.data.toolId as string;
        if (!toolId) continue;

        const existing = toolMap.get(toolId) || { views: 0, usage: 0, name: "", slug: "" };

        if (event.type === "tool_view") {
          existing.views++;
          existing.name = event.data.toolName as string || existing.name;
          existing.slug = event.data.toolSlug as string || existing.slug;
        } else {
          existing.usage++;
        }

        toolMap.set(toolId, existing);
      }
    }

    return Array.from(toolMap.entries())
      .map(([toolId, data]) => ({
        toolId,
        toolName: data.name,
        toolSlug: data.slug,
        score: data.views * 1 + data.usage * 2,
        views: data.views,
        usage: data.usage,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  recentActivity(limit: number = 20): ActivityEntry[] {
    return this.events
      .slice(-limit)
      .reverse()
      .map((event) => ({
        type: event.type,
        toolId: event.data.toolId as string | undefined,
        toolName: event.data.toolName as string | undefined,
        timestamp: event.timestamp,
        details: this.formatDetails(event),
      }));
  }

  private formatDetails(event: AnalyticsEvent): string {
    switch (event.type) {
      case "tool_view":
        return `Viewed ${(event.data as Record<string, unknown>).toolName as string || "tool"}`;
      case "tool_usage":
        return `Used tool (${(event.data as Record<string, unknown>).duration as number || 0}s)`;
      case "tool_error":
        return `Error: ${(event.data as Record<string, unknown>).error as string || "unknown"}`;
      case "conversion":
        return `Conversion: ${(event.data as Record<string, unknown>).type as string || "unknown"}`;
      case "download":
        return `Downloaded ${(event.data as Record<string, unknown>).fileType as string || "file"}`;
      case "search_query":
        return `Searched: "${(event.data as Record<string, unknown>).query as string || ""}"`;
      default:
        return event.type;
    }
  }

  timeSeries(
    type: string,
    interval: "hour" | "day" | "week" | "month",
    limit: number = 30
  ): TimeSeriesPoint[] {
    const filtered = this.events.filter((e) => e.type === type);
    const buckets = new Map<string, number>();

    for (const event of filtered) {
      const key = this.getTimeKey(event.timestamp, interval);
      buckets.set(key, (buckets.get(key) || 0) + 1);
    }

    return Array.from(buckets.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-limit)
      .map(([timestamp, value]) => ({ timestamp, value }));
  }

  private getTimeKey(timestamp: number, interval: string): string {
    const date = new Date(timestamp);

    switch (interval) {
      case "hour":
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}T${String(date.getHours()).padStart(2, "0")}:00`;
      case "day":
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      case "week": {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        return `${startOfWeek.getFullYear()}-W${String(Math.ceil((startOfWeek.getDate()) / 7)).padStart(2, "0")}`;
      }
      case "month":
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      default:
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    }
  }

  topErrors(limit: number = 10): Array<{ error: string; count: number; toolId?: string }> {
    const errorMap = new Map<string, number>();

    for (const event of this.events) {
      if (event.type === "tool_error") {
        const error = event.data.error as string || "unknown";
        errorMap.set(error, (errorMap.get(error) || 0) + 1);
      }
    }

    return Array.from(errorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([error, count]) => ({ error, count }));
  }

  searchQueries(limit: number = 20): Array<{ query: string; count: number }> {
    const queryMap = new Map<string, number>();

    for (const event of this.events) {
      if (event.type === "search_query") {
        const query = (event.data.query as string || "").toLowerCase().trim();
        if (query) {
          queryMap.set(query, (queryMap.get(query) || 0) + 1);
        }
      }
    }

    return Array.from(queryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query, count]) => ({ query, count }));
  }
}

export function createProcessor(events: AnalyticsEvent[]): AnalyticsProcessor {
  return new AnalyticsProcessor(events);
}
