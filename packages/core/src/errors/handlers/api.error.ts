import { ToolNovaError } from "../tool-nova.error";
import { ErrorContext } from "../error.types";

export class ApiError extends ToolNovaError {
  public readonly statusCode: number;

  constructor(
    statusCode: number,
    message: string,
    context?: Partial<ErrorContext>
  ) {
    const codeMap: Record<number, string> = {
      400: "API_001",
      401: "API_002",
      403: "API_003",
      404: "API_004",
      405: "API_005",
      409: "API_006",
      422: "API_007",
      429: "API_008",
      500: "API_009",
      503: "API_010",
      504: "API_011",
    };

    super({
      code: context?.code || codeMap[statusCode] || "API_009",
      message,
      severity: statusCode >= 500 ? "critical" : "medium",
      category: "api",
      retryable: statusCode === 429 || statusCode >= 500,
      ...context,
    });
    this.name = "ApiError";
    this.statusCode = statusCode;
  }

  static badRequest(message: string, details?: Record<string, unknown>): ApiError {
    return new ApiError(400, message, { details });
  }

  static unauthorized(message: string = "Unauthorized"): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message: string = "Forbidden"): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message: string = "Resource not found"): ApiError {
    return new ApiError(404, message);
  }

  static methodNotAllowed(method: string): ApiError {
    return new ApiError(405, `Method ${method} not allowed`);
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, message);
  }

  static unprocessable(message: string, details?: Record<string, unknown>): ApiError {
    return new ApiError(422, message, { details });
  }

  static tooManyRequests(retryAfter?: number): ApiError {
    return new ApiError(429, "Too many requests", { retryAfter });
  }

  static internal(message: string = "Internal server error", cause?: Error): ApiError {
    return new ApiError(500, message, { cause });
  }

  static serviceUnavailable(message: string = "Service unavailable"): ApiError {
    return new ApiError(503, message, { retryable: true });
  }

  static gatewayTimeout(message: string = "Gateway timeout"): ApiError {
    return new ApiError(504, message, { retryable: true });
  }

  isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  isServerError(): boolean {
    return this.statusCode >= 500;
  }
}
