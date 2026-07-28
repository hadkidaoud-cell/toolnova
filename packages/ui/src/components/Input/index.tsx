import { forwardRef } from "react";
import { InputProps } from "../../types";
import { cn, inputSizeClasses } from "../../utils";
import { useId } from "../../hooks";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = "md",
      label,
      error,
      hint,
      leftAddon,
      rightAddon,
      isRequired,
      className,
      disabled,
      testId,
      ...props
    },
    ref
  ) => {
    const id = useId("input");

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
          {leftAddon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
              {leftAddon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            disabled={disabled}
            data-testid={testId}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
            className={cn(
              "block w-full rounded-lg border bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-neutral-900 dark:text-neutral-100 dark:border-neutral-700 dark:placeholder-neutral-500",
              error
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-neutral-300 dark:border-neutral-600",
              inputSizeClasses(size),
              leftAddon && "pl-10",
              rightAddon && "pr-10",
              className
            )}
            {...props}
          />
          {rightAddon && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-500">
              {rightAddon}
            </div>
          )}
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

Input.displayName = "Input";
