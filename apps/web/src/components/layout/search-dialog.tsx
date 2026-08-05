"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Clock, CornerDownLeft, Search, TrendingUp } from "lucide-react";
import {
  ALL_TOOL_SLUGS,
  CATEGORY_META,
  CATEGORY_ORDER,
  DISCOVERY,
  getCategoryMeta,
  getToolMeta,
  TOOL_CATALOG,
  type ToolCategory,
} from "@/lib/tool-catalog";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

const RECENT_KEY = "toolnova-recent-searches";
const RECENT_LIMIT = 5;

interface SearchContextValue {
  openSearch: () => void;
}

const SearchContext = React.createContext<SearchContextValue>({
  openSearch: () => {},
});

export function useSearchDialog(): SearchContextValue {
  return React.useContext(SearchContext);
}

interface SearchEntry {
  slug: string;
  name: string;
  short: string;
  description: string;
  category: ToolCategory;
}

function useRecentSearches() {
  const [recent, setRecent] = React.useState<string[]>([]);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw) as string[]);
    } catch {
      /* ignore */
    }
  }, []);

  const add = React.useCallback((slug: string) => {
    setRecent((prev) => {
      const next = [slug, ...prev.filter((s) => s !== slug)].slice(0, RECENT_LIMIT);
      try {
        window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const clear = React.useCallback(() => {
    setRecent([]);
    try {
      window.localStorage.removeItem(RECENT_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return { recent, add, clear };
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    target.isContentEditable ||
    tag === "SELECT"
  );
}

export function SearchDialogProvider({ children }: { children: React.ReactNode }) {
  const { dict } = useI18n();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<ToolCategory | "all">("all");
  const [active, setActive] = React.useState(0);
  const { recent, add: addRecent, clear: clearRecent } = useRecentSearches();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const openSearch = React.useCallback(() => {
    setQuery("");
    setCategory("all");
    setActive(0);
    setOpen(true);
  }, []);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSearch();
        return;
      }
      if (e.key === "/" && !isEditableTarget(e.target) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openSearch]);

  React.useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 0);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  const index = React.useMemo(() => {
    const entries: SearchEntry[] = [];
    for (const slug of ALL_TOOL_SLUGS) {
      const meta = dict.tools.meta[slug as keyof typeof dict.tools.meta];
      const cat = getToolMeta(slug)?.category;
      if (!meta || !cat) continue;
      entries.push({
        slug,
        name: meta.name,
        short: meta.short,
        description: meta.description,
        category: cat,
      });
    }
    return entries;
  }, [dict]);

  const q = query.trim().toLowerCase();

  const filtered = React.useMemo(() => {
    if (!q) return [];
    return index
      .filter((e) => category === "all" || e.category === category)
      .filter((e) => {
        if (e.name.toLowerCase().startsWith(q)) return true;
        return (
          e.name.toLowerCase().includes(q) ||
          e.short.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.slug.includes(q)
        );
      })
      .sort((a, b) => {
        const aStarts = a.name.toLowerCase().startsWith(q) ? 0 : 1;
        const bStarts = b.name.toLowerCase().startsWith(q) ? 0 : 1;
        return aStarts - bStarts;
      })
      .map((e) => e.slug);
  }, [index, q, category]);

  const categoryTools = React.useMemo(() => {
    if (q || category === "all") return [];
    return CATEGORY_ORDER[category];
  }, [category, q]);

  const popular = React.useMemo(() => {
    return DISCOVERY.mostUsed.filter((s) => TOOL_CATALOG[s]).slice(0, 6);
  }, []);

  const recentList = React.useMemo(
    () => recent.filter((s) => TOOL_CATALOG[s]).slice(0, RECENT_LIMIT),
    [recent]
  );

  const list = React.useMemo(() => {
    if (q) return filtered;
    if (categoryTools.length > 0) return categoryTools;
    return [...recentList, ...popular.filter((s) => !recentList.includes(s))];
  }, [q, filtered, categoryTools, recentList, popular]);

  React.useEffect(() => {
    setActive(0);
  }, [query, category]);

  const select = React.useCallback(
    (slug: string) => {
      addRecent(slug);
      setOpen(false);
      setQuery("");
      setCategory("all");
      router.push(`/tools/${slug}`);
    },
    [router, addRecent]
  );

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, list.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const slug = list[active] ?? list[0];
      if (slug) select(slug);
    }
  };

  const showEmptyState = q.length > 0 && list.length === 0;

  return (
    <SearchContext.Provider value={{ openSearch }}>
      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content
            onOpenAutoFocus={(e) => e.preventDefault()}
            className="fixed left-1/2 top-[10vh] z-50 flex max-h-[70vh] w-[min(92vw,640px)] -translate-x-1/2 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 dark:border-neutral-800 dark:bg-neutral-950"
          >
            <DialogPrimitive.Title className="sr-only">{dict.search.title}</DialogPrimitive.Title>

            <div className="flex items-center gap-3 border-b border-neutral-200 px-4 dark:border-neutral-800">
              <Search className="h-4 w-4 shrink-0 text-neutral-400 rtl:order-2" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder={dict.search.placeholder}
                aria-label={dict.search.title}
                className="h-14 w-full bg-transparent text-base text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-500"
              />
              <kbd className="hidden shrink-0 rounded border border-neutral-200 px-1.5 py-0.5 text-[10px] font-medium text-neutral-400 sm:inline-block dark:border-neutral-700 dark:text-neutral-500 rtl:order-1">
                esc
              </kbd>
            </div>

            <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto border-b border-neutral-100 px-3 py-2 dark:border-neutral-800/60">
              <FilterChip
                active={category === "all"}
                onClick={() => setCategory("all")}
                label={dict.tools.allTools.allCategories}
                activeClass="bg-brand-600 text-white"
              />
              {(Object.keys(CATEGORY_META) as ToolCategory[]).map((cat) => {
                const meta = getCategoryMeta(cat);
                const Icon = meta.icon;
                return (
                  <FilterChip
                    key={cat}
                    active={category === cat}
                    onClick={() => setCategory(cat)}
                    label={dict.tools.categories[cat]}
                    icon={<Icon className="h-3.5 w-3.5" aria-hidden />}
                    activeClass={cn(
                      "text-white",
                      cat === "text"
                        ? "bg-sky-600"
                        : cat === "image"
                          ? "bg-emerald-600"
                          : cat === "developer"
                            ? "bg-indigo-600"
                            : cat === "calculation"
                              ? "bg-amber-600"
                              : cat === "converter"
                                ? "bg-fuchsia-600"
                                : cat === "generator"
                                  ? "bg-rose-600"
                                  : "bg-red-600"
                    )}
                  />
                );
              })}
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {showEmptyState ? (
                <div className="px-4 py-10 text-center">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{dict.search.noResults}</p>
                </div>
              ) : (
                <>
                  {!q && category === "all" && recentList.length > 0 && (
                    <SectionHeader
                      label={dict.search.recent}
                      icon={<Clock className="h-3.5 w-3.5" aria-hidden />}
                      action={
                        <button
                          onClick={clearRecent}
                          className="text-xs font-medium text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-200"
                        >
                          {dict.search.clearRecent}
                        </button>
                      }
                    />
                  )}
                  {!q && category === "all" && (
                    <SectionHeader
                      label={dict.search.popular}
                      icon={<TrendingUp className="h-3.5 w-3.5" aria-hidden />}
                    />
                  )}
                  {list.map((slug, i) => {
                    const isActive = i === active;
                    return (
                      <SearchRow
                        key={slug}
                        slug={slug}
                        active={isActive}
                        onSelect={() => select(slug)}
                        onHover={() => setActive(i)}
                      />
                    );
                  })}
                </>
              )}
            </div>

            <div className="flex items-center gap-4 border-t border-neutral-200 px-4 py-2.5 text-[11px] text-neutral-400 dark:border-neutral-800 dark:text-neutral-500">
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border border-neutral-200 px-1 dark:border-neutral-700">↑↓</kbd>
                {dict.search.navigate}
              </span>
              <span className="flex items-center gap-1.5">
                <CornerDownLeft className="h-3 w-3" aria-hidden />
                {dict.search.open}
              </span>
              <span className="ms-auto flex items-center gap-1.5">
                <kbd className="rounded border border-neutral-200 px-1 dark:border-neutral-700">esc</kbd>
                {dict.search.close}
              </span>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
      {children}
    </SearchContext.Provider>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  icon,
  activeClass,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
  activeClass: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? cn("border-transparent", activeClass)
          : "border-neutral-200 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function SectionHeader({
  label,
  icon,
  action,
}: {
  label: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-3 pb-1 pt-3">
      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
        {icon}
        {label}
      </span>
      {action}
    </div>
  );
}

function SearchRow({
  slug,
  active,
  onSelect,
  onHover,
}: {
  slug: string;
  active: boolean;
  onSelect: () => void;
  onHover: () => void;
}) {
  const { dict } = useI18n();
  const meta = getToolMeta(slug);
  const category = meta?.category ?? "text";
  const catMeta = getCategoryMeta(category);
  const toolName = dict.tools.meta[slug as keyof typeof dict.tools.meta]?.name ?? slug;
  const Icon = meta?.icon;
  return (
    <button
      onClick={onSelect}
      onMouseMove={onHover}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition-colors",
        active ? "bg-neutral-100 dark:bg-neutral-800/70" : "hover:bg-neutral-50 dark:hover:bg-neutral-900"
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm",
          catMeta.gradient
        )}
      >
        {Icon ? <Icon className="h-4 w-4" aria-hidden /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-neutral-900 dark:text-white">{toolName}</span>
      </span>
      <span
        className={cn(
          "hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide sm:inline-block",
          catMeta.soft
        )}
      >
        {dict.tools.categories[category]}
      </span>
      <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-neutral-300 dark:text-neutral-600 rtl:rotate-180" aria-hidden />
    </button>
  );
}
