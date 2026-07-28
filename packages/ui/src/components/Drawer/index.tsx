import { useEffect } from "react";
import { DrawerProps } from "../../types";
import { cn } from "../../utils";
import { useEscapeKey } from "../../hooks";

export function Drawer({
  isOpen,
  onClose,
  title,
  side = "right",
  size = "md",
  closeOnOverlay = true,
  closeOnEsc = true,
  children,
  className,
  testId,
}: DrawerProps) {
  if (closeOnEsc) {
    useEscapeKey(onClose);
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes: Record<string, string> = {
    sm: side === "left" || side === "right" ? "w-80" : "h-80",
    md: side === "left" || side === "right" ? "w-96" : "h-96",
    lg: side === "left" || side === "right" ? "w-[32rem]" : "h-[32rem]",
    xl: side === "left" || side === "right" ? "w-[40rem]" : "h-[40rem]",
    full: side === "left" || side === "right" ? "w-full" : "h-full",
  };

  const positions: Record<string, string> = {
    left: "inset-y-0 left-0",
    right: "inset-y-0 right-0",
    top: "inset-x-0 top-0",
    bottom: "inset-x-0 bottom-0",
  };

  const transforms: Record<string, string> = {
    left: "-translate-x-full",
    right: "translate-x-full",
    top: "-translate-y-full",
    bottom: "translate-y-full",
  };

  return (
    <div data-testid={testId} className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeOnOverlay ? onClose : undefined}
      />
      <div
        className={cn(
          "fixed flex flex-col bg-white shadow-xl dark:bg-neutral-900 transition-transform",
          positions[side],
          sizes[size],
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-700">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-500 dark:hover:bg-neutral-800"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
