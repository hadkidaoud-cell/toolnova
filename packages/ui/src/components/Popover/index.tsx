import { useState } from "react";
import { PopoverProps } from "../../types";
import { cn } from "../../utils";
import { useClickOutside } from "../../hooks";

export function Popover({
  trigger,
  content,
  side = "bottom",
  align = "center",
  className,
  testId,
}: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useClickOutside(() => setIsOpen(false));

  const positions: Record<string, string> = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2",
    left: "right-full mr-2",
    right: "left-full ml-2",
  };

  const alignments: Record<string, string> = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  };

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} data-testid={testId} className="relative inline-flex">
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 min-w-[8rem] rounded-lg border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900",
            positions[side],
            alignments[align],
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
