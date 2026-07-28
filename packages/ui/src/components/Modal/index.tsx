import { useEffect, useRef } from "react";
import { ModalProps } from "../../types";
import { cn } from "../../utils";
import { useEscapeKey } from "../../hooks";

export function Modal({
  isOpen,
  onClose,
  title,
  size = "md",
  closeOnOverlay = true,
  closeOnEsc = true,
  showClose = true,
  children,
  className,
  testId,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

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
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-4xl",
  };

  return (
    <div
      ref={overlayRef}
      data-testid={testId}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={closeOnOverlay ? onClose : undefined}
    >
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className={cn(
          "relative w-full rounded-xl bg-white shadow-xl dark:bg-neutral-900",
          sizes[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showClose) && (
          <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-700">
            {title && (
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {title}
              </h2>
            )}
            {showClose && (
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-500 dark:hover:bg-neutral-800"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
