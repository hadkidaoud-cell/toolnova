import { useEffect, useState } from "react";
import { ToastProps } from "../../types";
import { cn } from "../../utils";

export function Toast({
  id,
  title,
  message,
  variant = "info",
  duration = 5000,
  onClose,
}: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose?.(id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, id, onClose]);

  const variants: Record<string, { container: string; icon: string }> = {
    info: {
      container: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
      icon: "text-blue-500",
    },
    success: {
      container: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
      icon: "text-green-500",
    },
    warning: {
      container: "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800",
      icon: "text-yellow-500",
    },
    error: {
      container: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
      icon: "text-red-500",
    },
  };

  const v = variants[variant]!;

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4 shadow-lg transition-all duration-300",
        v.container,
        visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
    >
      <div className={cn("mt-0.5 shrink-0", v.icon)}>
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="flex-1">
        {title && <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">{title}</h4>}
        <p className="text-sm text-neutral-600 dark:text-neutral-300">{message}</p>
      </div>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(() => onClose?.(id), 300);
        }}
        className="shrink-0 rounded p-0.5 text-neutral-400 hover:bg-black/5 hover:text-neutral-500 dark:hover:bg-white/5"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
