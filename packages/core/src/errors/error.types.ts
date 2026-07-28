import type { ToolNovaError } from "./tool-nova.error";

export type ErrorSeverity = "low" | "medium" | "high" | "critical";

export type ErrorCategory =
  | "validation"
  | "plugin"
  | "api"
  | "database"
  | "auth"
  | "not_found"
  | "permission"
  | "rate_limit"
  | "timeout"
  | "internal"
  | "unknown";

export interface ErrorContext {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: number;
  traceId: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  source?: string;
  stack?: string;
  cause?: Error;
  retryable?: boolean;
  retryAfter?: number;
}

export interface SerializedError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: number;
  traceId: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  source?: string;
  retryable?: boolean;
  retryAfter?: number;
}

export interface ErrorHandler {
  canHandle(error: ToolNovaError): boolean;
  handle(error: ToolNovaError): SerializedError | null;
}

export interface RecoveryStrategy {
  attempt: number;
  maxAttempts: number;
  delay: number;
  backoff: "linear" | "exponential";
  canRecover(error: ToolNovaError): boolean;
  recover(error: ToolNovaError): Promise<boolean>;
}
