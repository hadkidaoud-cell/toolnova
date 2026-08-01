"use client";

import * as React from "react";
import { Check, Languages, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n, LOCALES } from "@/i18n";

const FLAGS: Record<string, string> = {
  en: "🇬🇧",
  ar: "🇸🇦",
  fr: "🇫🇷",
  es: "🇪🇸",
  pt: "🇵🇹",
};

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, dict } = useI18n();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        data-testid="language-switcher"
        onClick={() => setOpen(!open)}
        aria-label={dict.language.label}
        title={dict.language.label}
        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
      >
        <Languages className="h-4 w-4" />
        <span className="hidden sm:inline">{FLAGS[locale]}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900 rtl:right-auto rtl:left-0">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              data-locale={l.code}
              onClick={() => {
                setLocale(l.code);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white",
                locale === l.code && "bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-white"
              )}
            >
              <span className="text-base leading-none">{FLAGS[l.code]}</span>
              <span className="flex-1 text-left">{l.native}</span>
              {locale === l.code && <Check className="h-4 w-4 text-brand-600 dark:text-brand-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
