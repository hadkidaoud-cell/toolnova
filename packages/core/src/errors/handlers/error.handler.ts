import { ToolNovaError } from "../tool-nova.error";
import { SerializedError, ErrorHandler } from "../error.types";
import { ValidationError } from "./validation.error";
import { PluginError } from "./plugin.error";
import { ApiError } from "./api.error";
import { UnknownError } from "./unknown.error";

export class ToolNovaErrorHandler implements ErrorHandler {
  canHandle(error: ToolNovaError): boolean {
    return error instanceof ToolNovaError;
  }

  handle(error: ToolNovaError): SerializedError {
    return error.serialize();
  }

  handleValidation(error: ValidationError): SerializedError {
    return error.serialize();
  }

  handlePlugin(error: PluginError): SerializedError {
    return error.serialize();
  }

  handleApi(error: ApiError): SerializedError {
    return error.serialize();
  }

  handleUnknown(error: UnknownError): SerializedError {
    return error.serialize();
  }

  fromError(error: Error): ToolNovaError {
    if (error instanceof ToolNovaError) {
      return error;
    }
    return UnknownError.fromError(error);
  }

  fromUnknown(error: unknown): ToolNovaError {
    return UnknownError.fromUnknown(error);
  }

  toJSON(error: ToolNovaError): string {
    return JSON.stringify(error.serialize(), null, 2);
  }

  fromJSON(json: string): ToolNovaError {
    try {
      const parsed = JSON.parse(json) as SerializedError;
      return new ToolNovaError({
        code: parsed.code,
        message: parsed.message,
        details: parsed.details,
        timestamp: parsed.timestamp,
        traceId: parsed.traceId,
        severity: parsed.severity,
        category: parsed.category,
        source: parsed.source,
        retryable: parsed.retryable,
        retryAfter: parsed.retryAfter,
      });
    } catch {
      return new UnknownError("Failed to parse error JSON");
    }
  }
}

export const errorHandler = new ToolNovaErrorHandler();
