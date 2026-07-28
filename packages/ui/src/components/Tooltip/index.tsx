import { useState, useRef } from "react";
import { TooltipProps } from "../../types";
import { cn } from "../../utils";

export function Tooltip({
  content,
  side = "top",
  delay = 200,
  children,
  className,
  testId,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = () => {
    timeoutRef.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  const positions: Record<string, string> = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      data-testid={testId}
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={cn(
            "absolute z-50 whitespace-nowrap rounded-lg bg-neutral-900 px-3 py-1.5 text-sm text-white shadow-lg dark:bg-neutral-700",
            positions[side],
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
