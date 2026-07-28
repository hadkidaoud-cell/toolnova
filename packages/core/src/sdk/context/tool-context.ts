import type { ToolConfig } from "../types/tool-config";
import type { ToolInputResult } from "../types/tool-input";
import type {
  ToolExecution,
  ToolExecutionMetadata,
  ToolExecutionPhase,
} from "../types/tool-execution";
import type { ToolPermissions } from "../types/tool-permissions";
import type { ToolContext } from "../types/tool-context";
import { createExecution, transitionPhase, updateProgress, generateExecutionId } from "../types/tool-execution";
import { ToolLogger } from "../logger/tool-logger";

export interface ToolContextOptions<TConfig extends ToolConfig = ToolConfig> {
  config: TConfig;
  inputs: ToolInputResult;
  permissions?: ToolPermissions;
  metadata?: ToolExecutionMetadata;
  logger?: ToolLogger;
}

export class ToolContextImpl<
  TConfig extends ToolConfig = ToolConfig,
  TInputs extends ToolInputResult = ToolInputResult
> implements ToolContext<TConfig, TInputs>
{
  readonly id: string;
  readonly config: TConfig;
  readonly inputs: TInputs;
  readonly execution: ToolExecution;
  readonly logger: ToolLogger;
  readonly permissions: ToolPermissions;
  readonly metadata: ToolExecutionMetadata;
  readonly startTime: number;

  private _outputs: Record<string, unknown> = {};
  private _aborted = false;
  private _abortReason?: string;
  private _execution: ToolExecution;

  constructor(options: ToolContextOptions<TConfig>) {
    this.id = generateExecutionId(options.config.id);
    this.config = options.config;
    this.inputs = options.inputs as TInputs;
    this.permissions = options.permissions ?? {
      access: options.config.permissions.access as "public" | "authenticated" | "admin",
      roles: [],
      capabilities: ["read", "execute"],
      maxConcurrent: 10,
      requireAuth: false,
    };
    this.metadata = options.metadata ?? {};
    this.startTime = Date.now();
    this.logger = options.logger ?? new ToolLogger({ prefix: `[${options.config.id}]` });
    this.logger.setExecutionId(this.id);

    this._execution = createExecution(
      this.id,
      options.config.id,
      options.config.retries + 1,
      this.metadata
    );
    this.execution = this._execution;
  }

  getInput<K extends string & keyof TInputs>(key: K): TInputs[K] | undefined;
  getInput<K extends string & keyof TInputs>(key: K, fallback: TInputs[K]): TInputs[K];
  getInput<K extends string & keyof TInputs>(key: K, fallback?: TInputs[K]): TInputs[K] | undefined {
    const value = this.inputs[key];
    if (value === undefined || value === null) {
      return fallback as TInputs[K] | undefined;
    }
    return value;
  }

  getRequiredInput<K extends string & keyof TInputs>(key: K): TInputs[K] {
    const value = this.inputs[key];
    if (value === undefined || value === null) {
      throw new Error(`Required input "${String(key)}" is missing or empty`);
    }
    return value;
  }

  setOutput(key: string, value: unknown): void {
    this._outputs[key] = value;
    this.logger.debug(`Output set: ${key}`);
  }

  getOutputs(): Record<string, unknown> {
    return { ...this._outputs };
  }

  reportProgress(current: number, total: number, message?: string): void {
    this._execution = updateProgress(this._execution, current, total, message);
    (this as { execution: ToolExecution }).execution = this._execution;
    this.logger.debug(`Progress: ${current}/${total} (${message ?? ""})`);
  }

  log(level: "error" | "warn" | "info" | "debug" | "trace", message: string, data?: Record<string, unknown>): void {
    this.logger.log(level, message, data);
  }

  abort(reason?: string): void {
    this._aborted = true;
    this._abortReason = reason ?? "Aborted by user";
    this.logger.warn(`Execution aborted: ${this._abortReason}`);
  }

  isAborted(): boolean {
    return this._aborted;
  }

  getAbortReason(): string | undefined {
    return this._abortReason;
  }

  transitionTo(phase: ToolExecutionPhase): void {
    this._execution = transitionPhase(this._execution, phase);
    (this as { execution: ToolExecution }).execution = this._execution;
    this.logger.debug(`Phase transition: ${phase}`);
  }

  getExecution(): ToolExecution {
    return { ...this._execution };
  }
}

export function createToolContext<TConfig extends ToolConfig = ToolConfig>(
  options: ToolContextOptions<TConfig>
): ToolContextImpl<TConfig> {
  return new ToolContextImpl<TConfig>(options);
}
