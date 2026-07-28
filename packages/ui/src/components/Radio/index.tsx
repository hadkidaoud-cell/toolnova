import { forwardRef } from "react";
import { RadioProps } from "../../types";
import { cn } from "../../utils";
import { useId } from "../../hooks";

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      name,
      value,
      checked,
      onChange,
      label,
      disabled,
      size = "md",
      className,
      testId,
      ...props
    },
    ref
  ) => {
    const id = useId("radio");

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
            type="radio"
            id={id}
            name={name}
            value={value}
            checked={checked}
            onChange={() => onChange?.(value)}
            disabled={disabled}
            data-testid={testId}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              "flex items-center justify-center rounded-full border-2 transition-colors",
              sizes[size],
              checked
                ? "border-brand-600 bg-brand-600"
                : "border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-900",
              "peer-focus:ring-2 peer-focus:ring-brand-500 peer-focus:ring-offset-2",
              "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"
            )}
          >
            {checked && (
              <div className="h-2 w-2 rounded-full bg-white" />
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
      </div>
    );
  }
);

Radio.displayName = "Radio";
