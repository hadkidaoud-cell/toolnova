import { AlertProps } from "../../types";
import { cn } from "../../utils";

export function Alert({
  variant = "info",
  title,
  onClose,
  children,
  className,
  testId,
}: AlertProps) {
  const variants: Record<string, { container: string; icon: string; title: string; message: string }> = {
    info: {
      container: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
      icon: "text-blue-500",
      title: "text-blue-800 dark:text-blue-300",
      message: "text-blue-700 dark:text-blue-200",
    },
    success: {
      container: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
      icon: "text-green-500",
      title: "text-green-800 dark:text-green-300",
      message: "text-green-700 dark:text-green-200",
    },
    warning: {
      container: "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800",
      icon: "text-yellow-500",
      title: "text-yellow-800 dark:text-yellow-300",
      message: "text-yellow-700 dark:text-yellow-200",
    },
    error: {
      container: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
      icon: "text-red-500",
      title: "text-red-800 dark:text-red-300",
      message: "text-red-700 dark:text-red-200",
    },
  };

  const icons: Record<string, JSX.Element> = {
    info: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    success: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    error: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const v = variants[variant];

  return (
    <div
      role="alert"
      data-testid={testId}
      className={cn("flex items-start gap-3 rounded-lg border p-4", v.container, className)}
    >
      <div className={cn("mt-0.5 shrink-0", v.icon)}>{icons[variant]}</div>
      <div className="flex-1">
        {title && (
          <h4 className={cn("text-sm font-semibold", v.title)}>{title}</h4>
        )}
        <div className={cn("text-sm", v.message, title && "mt-1")}>{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={cn("shrink-0 rounded p-0.5 hover:bg-black/5 dark:hover:bg-white/5", v.icon)}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
