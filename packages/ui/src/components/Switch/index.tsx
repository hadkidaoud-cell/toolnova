import { forwardRef } from "react";
import { SwitchProps } from "../../types";
import { cn } from "../../utils";
import { useId } from "../../hooks";

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
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
    const id = useId("switch");

    const sizes: Record<string, { track: string; thumb: string; translate: string }> = {
      xs: { track: "h-4 w-7", thumb: "h-3 w-3", translate: "translate-x-3.5" },
      sm: { track: "h-5 w-9", thumb: "h-3.5 w-3.5", translate: "translate-x-4" },
      md: { track: "h-6 w-11", thumb: "h-4 w-4", translate: "translate-x-5" },
      lg: { track: "h-7 w-12", thumb: "h-5 w-5", translate: "translate-x-5.5" },
      xl: { track: "h-8 w-14", thumb: "h-6 w-6", translate: "translate-x-6" },
    };

    const s = sizes[size]!;

    return (
      <div className={cn("flex items-center gap-2", className)}>
        <label
          htmlFor={id}
          className="relative inline-flex cursor-pointer items-center"
        >
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
              "rounded-full transition-colors",
              s.track,
              checked
                ? "bg-brand-600"
                : "bg-neutral-300 dark:bg-neutral-600",
              "peer-focus:ring-2 peer-focus:ring-brand-500 peer-focus:ring-offset-2",
              "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"
            )}
          />
          <div
            className={cn(
              "absolute left-0.5 top-0.5 rounded-full bg-white shadow-sm transition-transform",
              s.thumb,
              checked && s.translate
            )}
          />
        </label>
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

Switch.displayName = "Switch";
