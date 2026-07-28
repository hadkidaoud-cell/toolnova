// ============================================================
// ToolNova Hero
// ============================================================

"use client";

import { SearchComponent } from "@/components/shared/search";
import { Zap } from "lucide-react";

const POPULAR_SEARCHES = ["Image Resize", "JSON Format", "Password Gen", "Text Diff"];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white dark:from-brand-950/30 dark:to-neutral-950">
      <div className="container-toolnova relative z-10 py-16 sm:py-20 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 dark:border-brand-800 dark:bg-brand-900/30 dark:text-brand-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500"></span>
            </span>
            100+ Tools Available
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-5xl lg:text-6xl">
            Every Tool You Need
            <span className="gradient-text"> One Place</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
            Discover hundreds of free online tools. Image editors, text processors, calculators,
            converters, and more. Fast, free, and easy to use.
          </p>

          <div className="mx-auto mt-8 max-w-xl">
            <SearchComponent isLarge />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <span>Popular:</span>
            {POPULAR_SEARCHES.map((term) => (
              <a
                key={term}
                href={`/tools?q=${encodeURIComponent(term)}`}
                className="rounded-lg border border-neutral-200 bg-white px-3 py-1 text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                {term}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-100/20 via-transparent to-transparent dark:from-brand-900/10" />
    </section>
  );
}
