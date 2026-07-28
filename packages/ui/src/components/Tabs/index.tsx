import { useState, createContext, useContext } from "react";
import { TabsProps, TabProps } from "../../types";
import { cn } from "../../utils";

const TabsContext = createContext<{ value: string; onChange: (v: string) => void }>({
  value: "",
  onChange: () => {},
});

export function Tabs({
  defaultValue = "",
  value,
  onChange,
  orientation = "horizontal",
  children,
  className,
  testId,
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = value ?? internalValue;
  const handleChange = onChange ?? setInternalValue;

  return (
    <TabsContext.Provider value={{ value: currentValue, onChange: handleChange }}>
      <div
        data-testid={testId}
        className={cn(
          orientation === "vertical" && "flex gap-4",
          className
        )}
        role="tablist"
        aria-orientation={orientation}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function Tab({
  value,
  label,
  disabled,
  icon,
  className,
  testId,
}: TabProps) {
  const context = useContext(TabsContext);
  const isActive = context.value === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      data-testid={testId}
      onClick={() => context.onChange(value)}
      className={cn(
        "inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "border-brand-600 text-brand-600 dark:text-brand-400"
          : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:text-neutral-300",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {label}
    </button>
  );
}

export function TabPanel({
  value,
  children,
  className,
  testId,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
  testId?: string;
}) {
  const context = useContext(TabsContext);
  if (context.value !== value) return null;

  return (
    <div
      role="tabpanel"
      data-testid={testId}
      className={cn("py-4", className)}
    >
      {children}
    </div>
  );
}
