import { ErrorContext, ErrorSeverity, ErrorCategory, SerializedError } from "./error.types";

function generateTraceId(): string {
  return `trace-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export class ToolNovaError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;
  public readonly timestamp: number;
  public readonly traceId: string;
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly source?: string;
  public readonly retryable: boolean;
  public readonly retryAfter?: number;
  public readonly cause?: Error;

  constructor(context: Partial<ErrorContext> & { message: string }) {
    super(context.message);
    this.name = "ToolNovaError";
    this.code = context.code || "UNKNOWN_ERROR";
    this.details = context.details;
    this.timestamp = context.timestamp || Date.now();
    this.traceId = context.traceId || generateTraceId();
    this.severity = context.severity || "medium";
    this.category = context.category || "unknown";
    this.source = context.source;
    this.retryable = context.retryable ?? false;
    this.retryAfter = context.retryAfter;
    this.cause = context.cause;

    if (context.stack) {
      this.stack = context.stack;
    } else if ("captureStackTrace" in Error) {
      (Error as { captureStackTrace: (target: object, constructor: Function) => void }).captureStackTrace(this, ToolNovaError);
    }
  }

  serialize(): SerializedError {
    const serialized: SerializedError = {
      code: this.code,
      message: this.message,
      timestamp: this.timestamp,
      traceId: this.traceId,
      severity: this.severity,
      category: this.category,
      retryable: this.retryable,
    };

    if (this.details) serialized.details = this.details;
    if (this.source) serialized.source = this.source;
    if (this.retryAfter) serialized.retryAfter = this.retryAfter;

    return serialized;
  }

  toJSON(): SerializedError {
    return this.serialize();
  }

  toString(): string {
    return `[${this.severity.toUpperCase()}] ${this.code}: ${this.message} (trace: ${this.traceId})`;
  }

  isRetryable(): boolean {
    return this.retryable;
  }

  withDetails(details: Record<string, unknown>): this {
    (this as { details: Record<string, unknown> }).details = {
      ...this.details,
      ...details,
    };
    return this;
  }

  withSource(source: string): this {
    (this as { source: string }).source = source;
    return this;
  }
}
