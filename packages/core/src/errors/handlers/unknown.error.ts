import { ToolNovaError } from "../tool-nova.error";
import { ErrorContext } from "../error.types";

export class UnknownError extends ToolNovaError {
  public readonly originalError?: Error;

  constructor(
    message: string = "An unexpected error occurred",
    originalError?: Error,
    context?: Partial<ErrorContext>
  ) {
    super({
      code: context?.code || "INTERNAL_001",
      message,
      severity: "critical",
      category: "internal",
      cause: originalError,
      stack: originalError?.stack,
      ...context,
    });
    this.name = "UnknownError";
    this.originalError = originalError;
  }

  static fromError(error: Error, context?: Partial<ErrorContext>): UnknownError {
    return new UnknownError(error.message, error, context);
  }

  static fromUnknown(error: unknown, context?: Partial<ErrorContext>): UnknownError {
    if (error instanceof ToolNovaError) {
      return new UnknownError(error.message, error, {
        code: error.code,
        ...context,
      });
    }

    if (error instanceof Error) {
      return UnknownError.fromError(error, context);
    }

    return new UnknownError(
      typeof error === "string" ? error : "An unexpected error occurred",
      undefined,
      context
    );
  }
}
