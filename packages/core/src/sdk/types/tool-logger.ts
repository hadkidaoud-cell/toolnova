export type ToolLogLevel = "silent" | "error" | "warn" | "info" | "debug" | "trace";

export interface ToolLogEntry {
  level: ToolLogLevel;
  message: string;
  timestamp: number;
  data?: Record<string, unknown>;
  executionId?: string;
}

export interface ToolLoggerConfig {
  level: ToolLogLevel;
  prefix: string;
  includeTimestamp: boolean;
  includeLevel: boolean;
  maxEntries: number;
  onLog?: (entry: ToolLogEntry) => void;
}

export const TOOL_LOG_LEVELS: Record<ToolLogLevel, number> = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};
