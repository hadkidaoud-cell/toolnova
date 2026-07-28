import { forwardRef } from "react";
import { CheckboxProps } from "../../types";
import { cn } from "../../utils";
import { useId } from "../../hooks";

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked,
      onChange,
      label,
      disabled,
      error,
      size = "md",
      className,
      testId,
      ...props
    },
    ref
  ) => {
    const id = useId("checkbox");

    const sizes: Record<string, string> = {
      xs: "h-3.5 w-3.5",
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
      xl: "h-7 w-7",
    };

    return (
      <div className={cn("flex items-start gap-2", className)}>
        <div className="relative flex items-center">
          <input
            ref={ref}
            type="checkbox"
            id={id}
            checked={checked}
            onChange={(e) => onChange?.(e.target.checked)}
            disabled={disabled}
            data-testid={testId}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              "flex items-center justify-center rounded border-2 transition-colors",
              sizes[size],
              checked
                ? "border-brand-600 bg-brand-600"
                : "border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-900",
              "peer-focus:ring-2 peer-focus:ring-brand-500 peer-focus:ring-offset-2",
              "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
              error && "border-red-500"
            )}
          >
            {checked && (
              <svg
                className="h-full w-full text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
        {label && (
          <label
            htmlFor={id}
            className={cn(
              "text-sm text-neutral-700 dark:text-neutral-300",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {label}
          </label>
        )}
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
