// ============================================================
// ToolNova Search Component
// ============================================================

"use client";

import { useState, useRef, useEffect } from "react";
import { Search as SearchIcon, X, ArrowRight, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks";

const MOCK_TOOLS = [
  { id: "1", name: "Image Resize", category: "image", icon: "🖼️", slug: "image-resize" },
  { id: "2", name: "JSON Formatter", category: "developer", icon: "📋", slug: "json-formatter" },
  { id: "3", name: "Password Generator", category: "generator", icon: "🔐", slug: "password-generator" },
  { id: "4", name: "Image Compress", category: "image", icon: "📦", slug: "image-compress" },
  { id: "5", name: "Text Diff", category: "text", icon: "📝", slug: "text-diff" },
  { id: "6", name: "URL Encoder", category: "developer", icon: "🔗", slug: "url-encoder" },
];

interface SearchComponentProps {
  className?: string;
  isLarge?: boolean;
}

export function SearchComponent({ className, isLarge = false }: SearchComponentProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches] = useState<string[]>(["image resize", "json format"]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 200);

  const filteredTools = debouncedQuery
    ? MOCK_TOOLS.filter(
        (tool) =>
          tool.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          tool.category.toLowerCase().includes(debouncedQuery.toLowerCase())
      )
    : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search for a tool..."
          className={cn(
            "w-full border bg-white pl-12 pr-4 text-neutral-900 placeholder-neutral-500 transition-all",
            "focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500",
            "dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-400 dark:focus:border-brand-400",
            isLarge
              ? "rounded-xl border-neutral-300 py-4 text-lg shadow-lg dark:border-neutral-700"
              : "rounded-lg border-neutral-300 py-2.5 text-sm dark:border-neutral-700"
          )}
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
          {debouncedQuery && filteredTools.length > 0 && (
            <div className="p-2">
              <p className="px-3 py-1.5 text-xs font-medium text-neutral-500">Tools</p>
              {filteredTools.map((tool) => (
                <a
                  key={tool.id}
                  href={`/tools/${tool.category}/${tool.slug}`}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <span className="text-lg">{tool.icon}</span>
                  <span className="flex-1 font-medium text-neutral-900 dark:text-white">
                    {tool.name}
                  </span>
                  <span className="text-xs capitalize text-neutral-500">{tool.category}</span>
                  <ArrowRight className="h-4 w-4 text-neutral-400" />
                </a>
              ))}
            </div>
          )}

          {debouncedQuery && filteredTools.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-sm text-neutral-500">No tools found for &quot;{query}&quot;</p>
            </div>
          )}

          {!debouncedQuery && (
            <div className="p-2">
              {recentSearches.length > 0 && (
                <>
                  <p className="px-3 py-1.5 text-xs font-medium text-neutral-500">Recent</p>
                  {recentSearches.map((search) => (
                    <button
                      key={search}
                      onClick={() => {
                        setQuery(search);
                        inputRef.current?.focus();
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <Clock className="h-4 w-4 text-neutral-400" />
                      <span className="flex-1 text-left text-neutral-700 dark:text-neutral-300">
                        {search}
                      </span>
                    </button>
                  ))}
                </>
              )}
              <p className="px-3 py-1.5 text-xs font-medium text-neutral-500">Popular</p>
              {MOCK_TOOLS.slice(0, 3).map((tool) => (
                <a
                  key={tool.id}
                  href={`/tools/${tool.category}/${tool.slug}`}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span className="flex-1 text-left font-medium text-neutral-900 dark:text-white">
                    {tool.name}
                  </span>
                  <ArrowRight className="h-4 w-4 text-neutral-400" />
                </a>
              ))}
            </div>
          )}

          <div className="border-t border-neutral-100 px-4 py-2 dark:border-neutral-800">
            <p className="text-xs text-neutral-500">
              Press <kbd className="rounded border border-neutral-300 px-1 py-0.5 font-mono text-[10px] dark:border-neutral-700">ESC</kbd> to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
