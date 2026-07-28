import { BreadcrumbProps } from "../../types";
import { cn } from "../../utils";

export function Breadcrumb({
  items,
  separator = "/",
  className,
  testId,
}: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      data-testid={testId}
      className={cn("flex items-center gap-1.5 text-sm", className)}
    >
      <ol className="flex items-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-1.5">
              {index > 0 && (
                <span className="text-neutral-400 dark:text-neutral-500">{separator}</span>
              )}
              {isLast || !item.href ? (
                <span className="text-neutral-500 dark:text-neutral-400">{item.label}</span>
              ) : (
                <button
                  onClick={item.onClick}
                  className="text-neutral-700 hover:text-brand-600 dark:text-neutral-300 dark:hover:text-brand-400"
                >
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
