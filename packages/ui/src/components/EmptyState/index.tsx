import { EmptyStateProps } from "../../types";
import { cn } from "../../utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  children,
  className,
  testId,
}: EmptyStateProps) {
  return (
    <div
      data-testid={testId}
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-neutral-400 dark:text-neutral-500">{icon}</div>
      )}
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
      {children}
    </div>
  );
}
