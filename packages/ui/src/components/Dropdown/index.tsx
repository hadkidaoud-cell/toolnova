import { useState } from "react";
import { DropdownProps } from "../../types";
import { cn } from "../../utils";
import { useClickOutside } from "../../hooks";

export function Dropdown({
  trigger,
  items,
  align = "start",
  children,
  className,
  testId,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useClickOutside(() => setIsOpen(false));

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
            "absolute top-full z-50 mt-1 min-w-[10rem] rounded-lg border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900",
            alignments[align],
            className
          )}
        >
          {items.map((item, index) =>
            item.divider ? (
              <div key={index} className="my-1 border-t border-neutral-200 dark:border-neutral-700" />
            ) : (
              <button
                key={index}
                onClick={() => {
                  item.onClick?.();
                  setIsOpen(false);
                }}
                disabled={item.disabled}
                className="flex w-full items-center px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
