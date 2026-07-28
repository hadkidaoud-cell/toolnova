export interface ToolResult<TOutputs extends ToolOutputResult = ToolOutputResult> {
  success: boolean;
  outputs: TOutputs;
  errors: ToolResultError[];
  warnings: ToolResultWarning[];
  executionTime: number;
  executionId: string;
  timestamp: number;
  metadata: ToolResultMetadata;
  retryable: boolean;
}

export interface ToolResultError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
  stack?: string;
}

export interface ToolResultWarning {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ToolResultMetadata {
  attempts: number;
  totalDuration: number;
  validationDuration: number;
  executionDuration: number;
  finalizeDuration: number;
  cacheHit: boolean;
  rateLimited: boolean;
}

export interface ToolOutputResult {
  [outputId: string]: unknown;
}

export function createSuccessResult<TOutputs extends ToolOutputResult>(
  outputs: TOutputs,
  executionId: string,
  metadata: ToolResultMetadata
): ToolResult<TOutputs> {
  return {
    success: true,
    outputs,
    errors: [],
    warnings: [],
    executionTime: metadata.totalDuration,
    executionId,
    timestamp: Date.now(),
    metadata,
    retryable: false,
  };
}

export function createErrorResult(
  errors: ToolResultError[],
  executionId: string,
  metadata: Partial<ToolResultMetadata> = {}
): ToolResult {
  return {
    success: false,
    outputs: {},
    errors,
    warnings: [],
    executionTime: metadata.totalDuration ?? 0,
    executionId,
    timestamp: Date.now(),
    metadata: {
      attempts: metadata.attempts ?? 1,
      totalDuration: metadata.totalDuration ?? 0,
      validationDuration: metadata.validationDuration ?? 0,
      executionDuration: metadata.executionDuration ?? 0,
      finalizeDuration: metadata.finalizeDuration ?? 0,
      cacheHit: metadata.cacheHit ?? false,
      rateLimited: metadata.rateLimited ?? false,
    },
    retryable: errors.some((e) => e.code === "TIMEOUT" || e.code === "RATE_LIMITED"),
  };
}

export function addWarning(result: ToolResult, warning: ToolResultWarning): ToolResult {
  return {
    ...result,
    warnings: [...result.warnings, warning],
  };
}
