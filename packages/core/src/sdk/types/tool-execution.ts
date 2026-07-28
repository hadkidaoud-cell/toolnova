export type ToolExecutionPhase =
  | "pending"
  | "initializing"
  | "validating"
  | "executing"
  | "finalizing"
  | "cleanup"
  | "completed"
  | "failed"
  | "cancelled"
  | "timeout";

export interface ToolExecution {
  id: string;
  toolId: string;
  phase: ToolExecutionPhase;
  status: ToolExecutionStatus;
  startTime: number;
  endTime?: number;
  duration?: number;
  attempts: number;
  maxAttempts: number;
  progress: ToolProgress;
  error?: ToolExecutionError;
  metadata: ToolExecutionMetadata;
}

export interface ToolExecutionStatus {
  code: "pending" | "running" | "success" | "error" | "cancelled" | "timeout";
  message?: string;
}

export interface ToolProgress {
  current: number;
  total: number;
  percentage: number;
  message?: string;
  startedAt: number;
}

export interface ToolExecutionError {
  code: string;
  message: string;
  phase: ToolExecutionPhase;
  retryable: boolean;
  attempt: number;
  stack?: string;
  details?: Record<string, unknown>;
}

export interface ToolExecutionMetadata {
  ip?: string;
  userAgent?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
}

export interface ToolExecutionTimer {
  start: number;
  init?: number;
  validate?: number;
  execute?: number;
  finalize?: number;
  cleanup?: number;
  end?: number;
}

export function createExecution(
  id: string,
  toolId: string,
  maxAttempts: number,
  metadata: ToolExecutionMetadata = {}
): ToolExecution {
  return {
    id,
    toolId,
    phase: "pending",
    status: { code: "pending" },
    startTime: Date.now(),
    attempts: 0,
    maxAttempts,
    progress: {
      current: 0,
      total: 100,
      percentage: 0,
      startedAt: Date.now(),
    },
    metadata,
  };
}

export function transitionPhase(
  execution: ToolExecution,
  phase: ToolExecutionPhase
): ToolExecution {
  const now = Date.now();
  const updated = {
    ...execution,
    phase,
    duration: now - execution.startTime,
  };

  if (phase === "executing") {
    updated.attempts += 1;
  }

  if (phase === "completed" || phase === "failed" || phase === "cancelled" || phase === "timeout") {
    updated.endTime = now;
    updated.duration = now - execution.startTime;
    updated.status = {
      code: phase === "completed" ? "success" : phase === "timeout" ? "timeout" : "error",
      message: phase === "completed" ? "Execution completed successfully" : `Execution ${phase}`,
    };
  } else if (phase === "executing") {
    updated.status = { code: "running", message: "Executing tool" };
  }

  return updated;
}

export function updateProgress(
  execution: ToolExecution,
  current: number,
  total: number,
  message?: string
): ToolExecution {
  const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  return {
    ...execution,
    progress: {
      current,
      total,
      percentage,
      message: message ?? execution.progress.message,
      startedAt: execution.progress.startedAt,
    },
  };
}

export function setExecutionError(
  execution: ToolExecution,
  error: ToolExecutionError
): ToolExecution {
  return {
    ...execution,
    phase: "failed",
    status: { code: "error", message: error.message },
    error,
    endTime: Date.now(),
    duration: Date.now() - execution.startTime,
  };
}

export function generateExecutionId(toolId: string): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8);
  return `exec-${toolId}-${ts}-${rand}`;
}
