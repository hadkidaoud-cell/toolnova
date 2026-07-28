export type EventType =
  | "tool_view"
  | "tool_usage"
  | "tool_error"
  | "conversion"
  | "download"
  | "search_query"
  | "page_view"
  | "session_start"
  | "session_end";

export interface AnalyticsEvent {
  id: string;
  type: EventType;
  timestamp: number;
  sessionId: string;
  userId?: string;
  data: Record<string, unknown>;
  metadata: EventMetadata;
}

export interface EventMetadata {
  userAgent?: string;
  referrer?: string;
  language?: string;
  country?: string;
  device?: "desktop" | "mobile" | "tablet";
  browser?: string;
  os?: string;
}

export interface ToolViewEvent {
  toolId: string;
  toolSlug: string;
  toolName: string;
  category: string;
}

export interface ToolUsageEvent {
  toolId: string;
  toolSlug: string;
  duration: number;
  inputs: string[];
  success: boolean;
}

export interface ToolErrorEvent {
  toolId: string;
  toolSlug: string;
  error: string;
  stack?: string;
}

export interface ConversionEvent {
  toolId: string;
  toolSlug: string;
  type: "signup" | "upgrade" | "share" | "bookmark" | "rate";
  value?: number;
}

export interface DownloadEvent {
  toolId: string;
  toolSlug: string;
  fileType: string;
  fileSize: number;
}

export interface SearchQueryEvent {
  query: string;
  resultCount: number;
  selectedToolId?: string;
}

export interface AnalyticsSummary {
  totalViews: number;
  totalUsage: number;
  totalErrors: number;
  totalConversions: number;
  totalDownloads: number;
  totalSearches: number;
  uniqueTools: number;
  averageUsageDuration: number;
  errorRate: number;
  conversionRate: number;
}

export interface ToolAnalytics {
  toolId: string;
  views: number;
  usageCount: number;
  errorCount: number;
  conversionCount: number;
  downloadCount: number;
  averageDuration: number;
  lastViewed?: number;
  lastUsed?: number;
}

export interface PopularTool {
  toolId: string;
  toolName: string;
  toolSlug: string;
  score: number;
  views: number;
  usage: number;
}

export interface ActivityEntry {
  type: EventType;
  toolId?: string;
  toolName?: string;
  timestamp: number;
  details: string;
}

export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
}

export interface AnalyticsConfig {
  maxEvents: number;
  retentionDays: number;
  enableCompression: boolean;
  batchSize: number;
  flushInterval: number;
}
