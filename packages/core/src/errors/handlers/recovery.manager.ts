import { ToolNovaError } from "../tool-nova.error";

export interface RetryConfig {
  maxAttempts: number;
  delay: number;
  backoff: "linear" | "exponential";
  maxDelay: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  delay: 1000,
  backoff: "exponential",
  maxDelay: 30000,
};

export class RecoveryManager {
  private config: RetryConfig;
  private attempts: Map<string, number> = new Map();

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config };
  }

  canRecover(error: ToolNovaError): boolean {
    if (!error.retryable) return false;

    const currentAttempts = this.attempts.get(error.traceId) || 0;
    return currentAttempts < this.config.maxAttempts;
  }

  getDelay(error: ToolNovaError): number {
    const currentAttempts = this.attempts.get(error.traceId) || 0;

    let delay: number;
    if (this.config.backoff === "exponential") {
      delay = this.config.delay * Math.pow(2, currentAttempts);
    } else {
      delay = this.config.delay * (currentAttempts + 1);
    }

    return Math.min(delay, this.config.maxDelay);
  }

  recordAttempt(error: ToolNovaError): number {
    const currentAttempts = this.attempts.get(error.traceId) || 0;
    const newAttempts = currentAttempts + 1;
    this.attempts.set(error.traceId, newAttempts);
    return newAttempts;
  }

  resetAttempts(traceId: string): void {
    this.attempts.delete(traceId);
  }

  getAttempts(traceId: string): number {
    return this.attempts.get(traceId) || 0;
  }

  async executeWithRecovery<T>(
    fn: () => Promise<T>,
    errorHandler?: (error: ToolNovaError) => void
  ): Promise<T> {
    let lastError: ToolNovaError | undefined;

    for (let attempt = 0; attempt < this.config.maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (e) {
        const error = e instanceof ToolNovaError
          ? e
          : new ToolNovaError({
              message: e instanceof Error ? e.message : "Unknown error",
              code: "INTERNAL_001",
              severity: "critical",
              category: "internal",
              retryable: true,
            });

        lastError = error;
        this.recordAttempt(error);

        if (errorHandler) {
          errorHandler(error);
        }

        if (!this.canRecover(error)) {
          throw error;
        }

        const delay = this.getDelay(error);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  clear(): void {
    this.attempts.clear();
  }
}

export const recoveryManager = new RecoveryManager();
