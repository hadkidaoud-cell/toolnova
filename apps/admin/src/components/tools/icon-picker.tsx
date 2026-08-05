"use client";

import { createElement, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { ICON_ENTRIES, getIcon, iconNameToLabel } from "@/lib/icon-registry";

interface IconPickerProps {
  value?: string;
  onChange: (name: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = value ? getIcon(value) : undefined;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ICON_ENTRIES;
    return ICON_ENTRIES.filter((entry) => entry.name.includes(q) || iconNameToLabel(entry.name).toLowerCase().includes(q));
  }, [query]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm hover:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
      >
        {selected ? (
          <>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
              <IconFromRegistry name={value} className="h-4 w-4" />
            </span>
            <span className="font-medium">{iconNameToLabel(value ?? "")}</span>
          </>
        ) : (
          <span className="text-neutral-400">Select an icon</span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
              <h3 className="font-semibold text-neutral-900 dark:text-white">Choose an icon</h3>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b border-neutral-200 px-5 py-3 dark:border-neutral-800">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search icons..."
                  className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid flex-1 grid-cols-4 gap-2 overflow-y-auto p-5 sm:grid-cols-6 lg:grid-cols-8">
              {filtered.length === 0 && (
                <p className="col-span-full py-8 text-center text-sm text-neutral-400">
                  No icons match “{query}”
                </p>
              )}
              {filtered.map((entry) => {
                const isSelected = value === entry.name;
                const Icon = entry.component;
                return (
                  <button
                    key={entry.name}
                    type="button"
                    title={iconNameToLabel(entry.name)}
                    onClick={() => {
                      onChange(entry.name);
                      setOpen(false);
                    }}
                    className={`flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border p-2 text-xs transition-colors ${
                      isSelected
                        ? "border-brand-500 bg-brand-50 text-brand-600 dark:border-brand-500 dark:bg-brand-950/40 dark:text-brand-400"
                        : "border-neutral-200 text-neutral-600 hover:border-brand-300 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-brand-700 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="w-full truncate text-center text-[10px]">{entry.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function IconFromRegistry({ name, className }: { name?: string; className?: string }) {
  const Icon = name ? getIcon(name) : undefined;
  if (!Icon) return null;
  return createElement(Icon, { className });
}
