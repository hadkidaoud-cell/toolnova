import { useState, createContext, useContext } from "react";
import { AccordionProps, AccordionItemProps } from "../../types";
import { cn } from "../../utils";

const AccordionContext = createContext<{
  openItems: Set<string>;
  toggle: (value: string) => void;
  allowMultiple: boolean;
}>({
  openItems: new Set(),
  toggle: () => {},
  allowMultiple: false,
});

export function Accordion({
  allowMultiple = false,
  defaultValue = [],
  children,
  className,
  testId,
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultValue));

  const toggle = (value: string) => {
    setOpenItems((prev) => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggle, allowMultiple }}>
      <div data-testid={testId} className={cn("divide-y divide-neutral-200 dark:divide-neutral-700", className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({
  value,
  title,
  disabled,
  children,
  className,
  testId,
}: AccordionItemProps) {
  const { openItems, toggle } = useContext(AccordionContext);
  const isOpen = openItems.has(value);

  return (
    <div data-testid={testId} className={cn("py-0", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => toggle(value)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-neutral-900 hover:text-brand-600 disabled:opacity-50 disabled:cursor-not-allowed dark:text-white dark:hover:text-brand-400"
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <svg
          className={cn(
            "h-5 w-5 shrink-0 text-neutral-500 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="pb-4 text-sm text-neutral-600 dark:text-neutral-400">
          {children}
        </div>
      )}
    </div>
  );
}
