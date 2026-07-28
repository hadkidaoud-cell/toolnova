import { forwardRef } from "react";
import { SelectProps } from "../../types";
import { cn, inputSizeClasses } from "../../utils";
import { useId } from "../../hooks";

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      size = "md",
      label,
      error,
      hint,
      options,
      placeholder,
      isRequired,
      className,
      disabled,
      testId,
      ...props
    },
    ref
  ) => {
    const id = useId("select");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            {label}
            {isRequired && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            disabled={disabled}
            data-testid={testId}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
            className={cn(
              "block w-full appearance-none rounded-lg border bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-neutral-900 dark:text-neutral-100 dark:border-neutral-700",
              error
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-neutral-300 dark:border-neutral-600",
              inputSizeClasses(size),
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              className="h-4 w-4 text-neutral-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && (
          <p id={`${id}-error`} className="mt-1.5 text-sm text-red-500">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${id}-hint`} className="mt-1.5 text-sm text-neutral-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
