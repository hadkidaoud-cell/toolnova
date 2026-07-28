import { ProgressProps } from "../../types";
import { cn } from "../../utils";

export function Progress({
  value,
  max = 100,
  size = "md",
  color = "brand",
  showLabel = false,
  className,
  testId,
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizes: Record<string, string> = {
    xs: "h-1",
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
    xl: "h-4",
  };

  const colors: Record<string, string> = {
    brand: "bg-brand-600",
    gray: "bg-neutral-600",
    red: "bg-red-600",
    green: "bg-green-600",
    blue: "bg-blue-600",
    yellow: "bg-yellow-500",
    purple: "bg-purple-600",
  };

  return (
    <div data-testid={testId} className={cn("w-full", className)}>
      {showLabel && (
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-neutral-700 dark:text-neutral-300">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn("overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700", sizes[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-300", colors[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
