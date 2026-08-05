"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { setToastHandler, type ToastItem } from "@/lib/toast";
import { cn } from "@toolnova/utils";

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const STYLES = {
  success: "border-green-200 bg-white text-neutral-900 dark:border-green-800 dark:bg-neutral-900 dark:text-white",
  error: "border-red-200 bg-white text-neutral-900 dark:border-red-800 dark:bg-neutral-900 dark:text-white",
  info: "border-blue-200 bg-white text-neutral-900 dark:border-blue-800 dark:bg-neutral-900 dark:text-white",
};

const ICON_COLORS = {
  success: "text-green-500",
  error: "text-red-500",
  info: "text-blue-500",
};

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    setToastHandler((toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 4000);
    });
    return () => setToastHandler(null);
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type];
        return (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl border p-3.5 shadow-lg",
              STYLES[toast.type]
            )}
          >
            <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", ICON_COLORS[toast.type])} />
            <p className="flex-1 text-sm">{toast.message}</p>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
