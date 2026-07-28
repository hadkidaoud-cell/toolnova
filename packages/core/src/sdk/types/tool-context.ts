import type { ToolConfig } from "./tool-config";
import type { ToolInputResult } from "./tool-input";
import type { ToolExecution, ToolExecutionMetadata } from "./tool-execution";
import type { ToolPermissions } from "./tool-permissions";

export interface ToolContextLogger {
  setExecutionId(id: string): void;
  error(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  info(message: string, data?: Record<string, unknown>): void;
  debug(message: string, data?: Record<string, unknown>): void;
  trace(message: string, data?: Record<string, unknown>): void;
  log(level: "error" | "warn" | "info" | "debug" | "trace", message: string, data?: Record<string, unknown>): void;
}

export interface ToolContext<
  TConfig extends ToolConfig = ToolConfig,
  TInputs extends ToolInputResult = ToolInputResult
> {
  readonly id: string;
  readonly config: TConfig;
  readonly inputs: TInputs;
  readonly execution: ToolExecution;
  readonly logger: ToolContextLogger;
  readonly permissions: ToolPermissions;
  readonly metadata: ToolExecutionMetadata;
  readonly startTime: number;

  getInput<K extends string & keyof TInputs>(key: K): TInputs[K] | undefined;
  getInput<K extends string & keyof TInputs>(key: K, fallback: TInputs[K]): TInputs[K];
  getRequiredInput<K extends string & keyof TInputs>(key: K): TInputs[K];
  setOutput(key: string, value: unknown): void;
  getOutputs(): Record<string, unknown>;
  reportProgress(current: number, total: number, message?: string): void;
  log(level: "error" | "warn" | "info" | "debug" | "trace", message: string, data?: Record<string, unknown>): void;
  abort(reason?: string): void;
  isAborted(): boolean;
}
