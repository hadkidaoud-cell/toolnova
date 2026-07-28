import { BadgeProps } from "../../types";
import { cn, sizeClasses } from "../../utils";

export function Badge({
  variant = "subtle",
  color = "brand",
  size = "sm",
  children,
  className,
  testId,
}: BadgeProps) {
  const colors: Record<string, { solid: string; subtle: string; outline: string }> = {
    brand: {
      solid: "bg-brand-600 text-white",
      subtle: "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400",
      outline: "border-brand-600 text-brand-600",
    },
    gray: {
      solid: "bg-neutral-600 text-white",
      subtle: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
      outline: "border-neutral-600 text-neutral-600",
    },
    red: {
      solid: "bg-red-600 text-white",
      subtle: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      outline: "border-red-600 text-red-600",
    },
    green: {
      solid: "bg-green-600 text-white",
      subtle: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      outline: "border-green-600 text-green-600",
    },
    blue: {
      solid: "bg-blue-600 text-white",
      subtle: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      outline: "border-blue-600 text-blue-600",
    },
    yellow: {
      solid: "bg-yellow-500 text-white",
      subtle: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      outline: "border-yellow-500 text-yellow-600",
    },
    purple: {
      solid: "bg-purple-600 text-white",
      subtle: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      outline: "border-purple-600 text-purple-600",
    },
  };

  return (
    <span
      data-testid={testId}
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        sizeClasses(size),
        colors[color]![variant]!,
        variant === "outline" && "border",
        className
      )}
    >
      {children}
    </span>
  );
}
