import { ToolNovaError } from "../tool-nova.error";
import { SerializedError } from "../error.types";

export type LogLevel = "silent" | "error" | "warn" | "info" | "debug";

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  error?: SerializedError;
  context?: Record<string, unknown>;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  maxEntries: number;
  prefix: string;
}

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
};

const DEFAULT_LOGGER_CONFIG: LoggerConfig = {
  level: "warn",
  enableConsole: true,
  enableStorage: true,
  maxEntries: 1000,
  prefix: "[ToolNova]",
};

export class Logger {
  private config: LoggerConfig;
  private entries: LogEntry[] = [];

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_LOGGER_CONFIG, ...config };
  }

  private shouldLog(level: LogLevel): boolean {
    return LEVEL_PRIORITY[level] <= LEVEL_PRIORITY[this.config.level];
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `${this.config.prefix} [${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  private addEntry(level: LogLevel, message: string, error?: ToolNovaError, context?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      error: error?.serialize(),
      context,
    };

    this.entries.push(entry);

    if (this.entries.length > this.config.maxEntries) {
      this.entries = this.entries.slice(-this.config.maxEntries);
    }
  }

  error(message: string, error?: ToolNovaError, context?: Record<string, unknown>): void {
    if (!this.shouldLog("error")) return;

    this.addEntry("error", message, error, context);

    if (this.config.enableConsole) {
      console.error(this.formatMessage("error", message), error?.toString() || "");
    }
  }

  warn(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog("warn")) return;

    this.addEntry("warn", message, undefined, context);

    if (this.config.enableConsole) {
      console.warn(this.formatMessage("warn", message));
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog("info")) return;

    this.addEntry("info", message, undefined, context);

    if (this.config.enableConsole) {
      console.info(this.formatMessage("info", message));
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog("debug")) return;

    this.addEntry("debug", message, undefined, context);

    if (this.config.enableConsole) {
      console.debug(this.formatMessage("debug", message));
    }
  }

  logError(error: ToolNovaError, context?: Record<string, unknown>): void {
    this.error(error.message, error, {
      code: error.code,
      traceId: error.traceId,
      severity: error.severity,
      category: error.category,
      ...context,
    });
  }

  getEntries(level?: LogLevel): LogEntry[] {
    if (!level) return [...this.entries];
    return this.entries.filter((e) => e.level === level);
  }

  getRecentEntries(limit: number = 50): LogEntry[] {
    return this.entries.slice(-limit);
  }

  clear(): void {
    this.entries = [];
  }

  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  getLevel(): LogLevel {
    return this.config.level;
  }
}

export const logger = new Logger();
