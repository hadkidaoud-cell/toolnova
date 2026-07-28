import { CardProps } from "../../types";
import { cn } from "../../utils";

export function Card({
  variant = "elevated",
  padding = "md",
  children,
  className,
  testId,
}: CardProps) {
  const variants: Record<string, string> = {
    elevated: "bg-white shadow-md dark:bg-neutral-900",
    outlined: "bg-white border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-700",
    filled: "bg-neutral-50 dark:bg-neutral-800",
  };

  const paddings: Record<string, string> = {
    xs: "p-2",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
    xl: "p-8",
  };

  return (
    <div
      data-testid={testId}
      className={cn("rounded-xl", variants[variant], paddings[padding], className)}
    >
      {children}
    </div>
  );
}
