import { forwardRef } from "react";
import { ButtonProps } from "../../types";
import { cn, sizeClasses } from "../../utils";
import { Spinner } from "../Spinner";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      type = "button",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className,
      children,
      testId,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants: Record<string, string> = {
      primary:
        "bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500",
      secondary:
        "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus:ring-neutral-400 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700",
      outline:
        "border border-neutral-300 text-neutral-700 hover:bg-neutral-50 focus:ring-brand-500 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800",
      ghost:
        "text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-400 dark:text-neutral-300 dark:hover:bg-neutral-800",
      danger:
        "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
      success:
        "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
      warning:
        "bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        data-testid={testId}
        className={cn(
          baseStyles,
          variants[variant],
          sizeClasses(size),
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Spinner size="sm" className="mr-2" />
        ) : leftIcon ? (
          <span className="mr-2">{leftIcon}</span>
        ) : null}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
