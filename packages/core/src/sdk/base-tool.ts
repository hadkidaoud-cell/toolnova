import type { ToolConfig } from "./types/tool-config";
import type { ToolInputResult } from "./types/tool-input";
import type { ToolPermissions } from "./types/tool-permissions";
import type {
  ToolResult,
  ToolResultError,
  ToolResultWarning,
  ToolResultMetadata,
  ToolOutputResult,
} from "./types/tool-result";
import type { ToolContext } from "./types/tool-context";
import { ToolContextImpl } from "./context/tool-context";
import { ToolLogger } from "./logger/tool-logger";
import { ToolValidator, toolValidator, validateToolInputs } from "./validation/tool-validator";
import {
  createSuccessResult,
  createErrorResult,
  addWarning,
} from "./types/tool-result";
import { generateExecutionId } from "./types/tool-execution";

export interface BaseToolOptions {
  config: ToolConfig;
  permissions?: ToolPermissions;
  validator?: ToolValidator;
}

export abstract class BaseTool<TInputs extends ToolInputResult = ToolInputResult, TOutputs extends ToolOutputResult = ToolOutputResult> {
  protected readonly config: ToolConfig;
  protected readonly permissions: ToolPermissions;
  protected readonly validator: ToolValidator;
  protected logger: ToolLogger;

  private _initialized = false;

  constructor(options: BaseToolOptions) {
    this.config = options.config;
    this.permissions = options.permissions ?? {
      access: this.config.permissions.access as "public" | "authenticated" | "admin",
      roles: [],
      capabilities: ["read", "execute"],
      maxConcurrent: 10,
      requireAuth: false,
    };
    this.validator = options.validator ?? toolValidator;
    this.logger = new ToolLogger({ prefix: `[${this.config.id}]` });
  }

  async run(inputs: TInputs, metadata?: Record<string, unknown>): Promise<ToolResult<TOutputs>> {
    const executionId = generateExecutionId(this.config.id);
    const executionMetadata = metadata ?? {};
    const resultMetadata: ToolResultMetadata = {
      attempts: 0,
      totalDuration: 0,
      validationDuration: 0,
      executionDuration: 0,
      finalizeDuration: 0,
      cacheHit: false,
      rateLimited: false,
    };

    const startTime = Date.now();
    let lastError: ToolResultError | null = null;
    const warnings: ToolResultWarning[] = [];
    const maxAttempts = this.config.retries + 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      resultMetadata.attempts = attempt;
      const attemptStart = Date.now();

      try {
        const context = this.createContext(inputs, executionMetadata);
        context.logger.setExecutionId(executionId);

        context.transitionTo("initializing");
        if (!this._initialized) {
          await this.initialize(context);
          this._initialized = true;
        }

        context.transitionTo("validating");
        const validationStart = Date.now();
        const validationResult = validateToolInputs(
          (this.config.inputs ?? []) as unknown as import("./types/tool-input").ToolInputDefinition[],
          inputs
        );
        resultMetadata.validationDuration = Date.now() - validationStart;

        if (!validationResult.valid) {
          const errors: ToolResultError[] = validationResult.errors.map((e) => ({
            code: e.code,
            message: e.message,
            field: e.field,
            details: { value: e.value },
          }));
          return createErrorResult(errors, executionId, resultMetadata) as ToolResult<TOutputs>;
        }

        for (const w of validationResult.warnings) {
          warnings.push({
            code: w.code,
            message: w.message,
            details: { field: w.field, value: w.value },
          });
        }

        context.transitionTo("executing");
        const executionStart = Date.now();
        const outputs = await this.execute(context);
        resultMetadata.executionDuration = Date.now() - executionStart;

        if (context.isAborted()) {
          return createErrorResult(
            [{ code: "ABORTED", message: context.getAbortReason() ?? "Execution aborted" }],
            executionId,
            resultMetadata
          ) as ToolResult<TOutputs>;
        }

        context.transitionTo("finalizing");
        const finalizeStart = Date.now();
        await this.finalize(context, outputs);
        resultMetadata.finalizeDuration = Date.now() - finalizeStart;

        context.transitionTo("cleanup");
        await this.cleanup(context);

        context.transitionTo("completed");
        resultMetadata.totalDuration = Date.now() - startTime;

        let result = createSuccessResult<TOutputs>(outputs as TOutputs, executionId, resultMetadata);
        for (const w of warnings) {
          result = addWarning(result, w) as ToolResult<TOutputs>;
        }

        this.logger.info(`Execution completed in ${resultMetadata.totalDuration}ms (attempt ${attempt}/${maxAttempts})`);
        return result as ToolResult<TOutputs>;

      } catch (error) {
        resultMetadata.executionDuration = Date.now() - attemptStart;
        const toolError = this.normalizeError(error);

        this.logger.error(`Execution failed (attempt ${attempt}/${maxAttempts}): ${toolError.message}`, {
          code: toolError.code,
          attempt,
          stack: toolError.stack,
        });

        lastError = toolError;

        if (attempt < maxAttempts && this.isRetryableError(error)) {
          const delay = this.calculateRetryDelay(attempt);
          this.logger.debug(`Retrying in ${delay}ms...`);
          await this.sleep(delay);
          continue;
        }

        break;
      }
    }

    resultMetadata.totalDuration = Date.now() - startTime;
    return createErrorResult(
      lastError ? [lastError] : [{ code: "UNKNOWN", message: "Unknown error occurred" }],
      executionId,
      resultMetadata
    ) as ToolResult<TOutputs>;
  }

  protected abstract execute(context: ToolContext): Promise<TOutputs>;

  protected async initialize(_context: ToolContext): Promise<void> {
    this.logger.debug("Tool initialized");
  }

  protected async validate(_context: ToolContext): Promise<boolean> {
    return true;
  }

  protected async finalize(_context: ToolContext, _outputs: TOutputs): Promise<void> {
    this.logger.debug("Tool finalized");
  }

  protected async cleanup(_context: ToolContext): Promise<void> {
    this.logger.debug("Tool cleanup completed");
  }

  protected createContext(inputs: TInputs, metadata: Record<string, unknown> = {}): ToolContextImpl {
    return new ToolContextImpl({
      config: this.config,
      inputs,
      permissions: this.permissions,
      metadata,
      logger: this.logger,
    });
  }

  getConfig(): ToolConfig {
    return { ...this.config };
  }

  getPermissions(): ToolPermissions {
    return { ...this.permissions };
  }

  getId(): string {
    return this.config.id;
  }

  getName(): string {
    return this.config.name;
  }

  getVersion(): string {
    return this.config.version;
  }

  private normalizeError(error: unknown): ToolResultError {
    if (error instanceof Error) {
      const name = error.name;
      let code = "EXECUTION_ERROR";

      if (name === "TimeoutError" || error.message.includes("timeout")) {
        code = "TIMEOUT";
      } else if (name === "AbortError" || error.message.includes("abort")) {
        code = "ABORTED";
      } else if (error.message.includes("permission") || error.message.includes("access")) {
        code = "PERMISSION_DENIED";
      }

      return {
        code,
        message: error.message,
        details: { name, stack: error.stack },
      };
    }

    return {
      code: "UNKNOWN",
      message: typeof error === "string" ? error : "Unknown error occurred",
      details: { raw: error },
    };
  }

  private isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      const name = error.name;
      if (name === "TimeoutError" || error.message.includes("timeout")) return true;
      if (error.message.includes("ECONNRESET")) return true;
      if (error.message.includes("ETIMEDOUT")) return true;
      if (error.message.includes("rate limit")) return true;
      if (error.message.includes("429")) return true;
      if (error.message.includes("503")) return true;
    }
    return false;
  }

  private calculateRetryDelay(attempt: number): number {
    const base = this.config.retryDelay;
    return base * Math.pow(2, attempt - 1);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
