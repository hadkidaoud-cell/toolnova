import { SkeletonProps } from "../../types";
import { cn } from "../../utils";

export function Skeleton({
  width,
  height,
  variant = "text",
  className,
  testId,
}: SkeletonProps) {
  const baseStyles = "animate-pulse rounded bg-neutral-200 dark:bg-neutral-700";

  const variants: Record<string, string> = {
    text: "h-4 w-full",
    circular: "h-10 w-10 rounded-full",
    rectangular: "h-20 w-full rounded-lg",
  };

  return (
    <div
      data-testid={testId}
      className={cn(baseStyles, variants[variant], className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
