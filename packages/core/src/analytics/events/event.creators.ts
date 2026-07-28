import {
  AnalyticsEvent,
  ToolViewEvent,
  ToolUsageEvent,
  ToolErrorEvent,
  ConversionEvent,
  DownloadEvent,
  SearchQueryEvent,
  EventMetadata,
} from "../analytics.types";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function createBase(
  type: AnalyticsEvent["type"],
  data: Record<string, unknown>,
  metadata?: Partial<EventMetadata>
): AnalyticsEvent {
  return {
    id: generateId(),
    type,
    timestamp: Date.now(),
    sessionId: data.sessionId as string || "anonymous",
    userId: data.userId as string | undefined,
    data,
    metadata: {
      userAgent: metadata?.userAgent,
      referrer: metadata?.referrer,
      language: metadata?.language,
      country: metadata?.country,
      device: metadata?.device,
      browser: metadata?.browser,
      os: metadata?.os,
    },
  };
}

export function createToolViewEvent(
  tool: ToolViewEvent,
  metadata?: Partial<EventMetadata>
): AnalyticsEvent {
  return createBase("tool_view", { ...tool }, metadata);
}

export function createToolUsageEvent(
  usage: ToolUsageEvent,
  metadata?: Partial<EventMetadata>
): AnalyticsEvent {
  return createBase("tool_usage", { ...usage }, metadata);
}

export function createToolErrorEvent(
  error: ToolErrorEvent,
  metadata?: Partial<EventMetadata>
): AnalyticsEvent {
  return createBase("tool_error", { ...error }, metadata);
}

export function createConversionEvent(
  conversion: ConversionEvent,
  metadata?: Partial<EventMetadata>
): AnalyticsEvent {
  return createBase("conversion", { ...conversion }, metadata);
}

export function createDownloadEvent(
  download: DownloadEvent,
  metadata?: Partial<EventMetadata>
): AnalyticsEvent {
  return createBase("download", { ...download }, metadata);
}

export function createSearchQueryEvent(
  search: SearchQueryEvent,
  metadata?: Partial<EventMetadata>
): AnalyticsEvent {
  return createBase("search_query", { ...search }, metadata);
}

export function createPageViewEvent(
  path: string,
  metadata?: Partial<EventMetadata>
): AnalyticsEvent {
  return createBase("page_view", { path }, metadata);
}

export function createSessionStartEvent(
  metadata?: Partial<EventMetadata>
): AnalyticsEvent {
  return createBase("session_start", {}, metadata);
}

export function createSessionEndEvent(
  duration: number,
  metadata?: Partial<EventMetadata>
): AnalyticsEvent {
  return createBase("session_end", { duration }, metadata);
}
