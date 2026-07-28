import { ErrorStateProps } from "../../types";
import { cn } from "../../utils";
import { Button } from "../Button";

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  children,
  className,
  testId,
}: ErrorStateProps) {
  return (
    <div
      data-testid={testId}
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className
      )}
    >
      <div className="mb-4 text-red-500">
        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">{message}</p>
      {onRetry && (
        <div className="mt-4">
          <Button variant="outline" onClick={onRetry}>
            Try Again
          </Button>
        </div>
      )}
      {children}
    </div>
  );
}
