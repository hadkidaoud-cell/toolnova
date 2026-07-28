import type {
  ToolLogLevel,
  ToolLogEntry,
  ToolLoggerConfig,
} from "../types/tool-logger";
import { TOOL_LOG_LEVELS } from "../types/tool-logger";

const DEFAULT_LOGGER_CONFIG: ToolLoggerConfig = {
  level: "info",
  prefix: "[Tool]",
  includeTimestamp: true,
  includeLevel: true,
  maxEntries: 1000,
};

export class ToolLogger {
  private config: ToolLoggerConfig;
  private entries: ToolLogEntry[] = [];
  private executionId?: string;

  constructor(config: Partial<ToolLoggerConfig> = {}) {
    this.config = { ...DEFAULT_LOGGER_CONFIG, ...config };
  }

  setExecutionId(executionId: string): void {
    this.executionId = executionId;
  }

  setLevel(level: ToolLogLevel): void {
    this.config.level = level;
  }

  setPrefix(prefix: string): void {
    this.config.prefix = prefix;
  }

  error(message: string, data?: Record<string, unknown>): void {
    this.log("error", message, data);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.log("warn", message, data);
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.log("info", message, data);
  }

  debug(message: string, data?: Record<string, unknown>): void {
    this.log("debug", message, data);
  }

  trace(message: string, data?: Record<string, unknown>): void {
    this.log("trace", message, data);
  }

  log(level: ToolLogLevel, message: string, data?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) return;

    const entry: ToolLogEntry = {
      level,
      message,
      timestamp: Date.now(),
      executionId: this.executionId,
      data,
    };

    this.entries.push(entry);

    if (this.entries.length > this.config.maxEntries) {
      this.entries = this.entries.slice(-this.config.maxEntries);
    }

    if (this.config.onLog) {
      this.config.onLog(entry);
    }
  }

  child(prefix: string): ToolLogger {
    return new ToolLogger({
      ...this.config,
      prefix: `${this.config.prefix}:${prefix}`,
      onLog: this.config.onLog,
    });
  }

  getEntries(level?: ToolLogLevel): ToolLogEntry[] {
    if (!level) return [...this.entries];
    return this.entries.filter((e) => e.level === level);
  }

  getEntriesSince(since: number): ToolLogEntry[] {
    return this.entries.filter((e) => e.timestamp >= since);
  }

  getEntryCount(): number {
    return this.entries.length;
  }

  clear(): void {
    this.entries = [];
  }

  flush(): ToolLogEntry[] {
    const entries = [...this.entries];
    this.entries = [];
    return entries;
  }

  getConfig(): ToolLoggerConfig {
    return { ...this.config };
  }

  private shouldLog(level: ToolLogLevel): boolean {
    const configLevel = TOOL_LOG_LEVELS[this.config.level];
    const messageLevel = TOOL_LOG_LEVELS[level];
    return messageLevel <= configLevel;
  }
}

export function createToolLogger(
  prefix: string,
  config: Partial<ToolLoggerConfig> = {}
): ToolLogger {
  return new ToolLogger({ ...config, prefix });
}
