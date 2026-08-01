"use client";

import React, { useState, useMemo } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { Clock } from "lucide-react";

const RELATED_SLUGS = ["date-difference", "unit-converter", "currency-converter"] as const;

const RELATED_ICONS: Record<string, string> = {
  "date-difference": "📅",
  "unit-converter": "📏",
  "currency-converter": "💱",
};

const LONG_DESCRIPTION =
  "Convert any date and time between time zones around the world. Pick your source and target zones from the full IANA list, enter a date and time, and see the exact equivalent — plus a confirmation that both values represent the same instant.";

const FAQ = [
  {
    question: "Which time zones are supported?",
    answer: "Every IANA time zone your browser knows, including abbreviations, cities, and UTC offsets. No manual offset math needed.",
  },
  {
    question: "Does it handle daylight saving time?",
    answer: "Yes. The browser resolves each instant against the zone's actual rules, so DST transitions are applied automatically.",
  },
  {
    question: "Is my input sent anywhere?",
    answer: "No. Conversion happens locally with the browser's Intl API.",
  },
];

const ARTICLE = {
  title: "Meeting Across Time Zones",
  content:
    "Coordinating with people around the world means translating one local time into many others. Modern browsers know the full time zone database, so our converter can answer 'what time is that where I am?' without any offset tables — automatically handling daylight saving changes.",
};

const FALLBACK_ZONES = [
  "UTC", "America/New_York", "America/Los_Angeles", "America/Chicago", "America/Toronto",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Madrid", "Europe/Rome",
  "Europe/Lisbon", "Africa/Cairo", "Africa/Lagos", "Asia/Dubai", "Asia/Riyadh",
  "Asia/Shanghai", "Asia/Tokyo", "Asia/Kolkata", "Asia/Singapore", "Asia/Tehran",
  "Australia/Sydney", "Pacific/Auckland", "America/Sao_Paulo", "America/Mexico_City",
];

function getZones(): string[] {
  try {
    const zones = Intl.supportedValuesOf("timeZone");
    if (zones && zones.length > 0) return zones as string[];
  } catch {}
  return FALLBACK_ZONES;
}

export default function TimezoneConverterPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.converter;
  const meta = t.meta["timezone-converter"];
  const u = t.timezoneConverter;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "converter",
    icon: <Clock className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/converter" },
      { label: meta.name, href: "/tools/timezone-converter" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const zones = useMemo(() => getZones(), []);
  const now = useMemo(() => {
    const d = new Date();
    d.setSeconds(0, 0);
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60000).toISOString().slice(0, 16);
    return local;
  }, []);

  const [datetime, setDatetime] = useState(now);
  const [from, setFrom] = useState(() => {
    const guess = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return guess && zones.includes(guess) ? guess : "UTC";
  });
  const [to, setTo] = useState("Asia/Dubai");
  const [result, setResult] = useState<{ from: string; to: string; offset: number } | null>(null);
  const [error, setError] = useState("");

  const convert = () => {
    setError("");
    const date = new Date(datetime);
    if (isNaN(date.getTime())) {
      setError(u.invalidDateTime);
      return;
    }
    const formatter = (zone: string) =>
      new Intl.DateTimeFormat("en-GB", {
        timeZone: zone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(date);
    const offset =
      (new Date(date.toLocaleString("en-US", { timeZone: to })).getTime() -
        new Date(date.toLocaleString("en-US", { timeZone: from })).getTime()) /
      3600000;
    setResult({ from: formatter(from), to: formatter(to), offset: Math.round(offset * 100) / 100 });
  };

  const inputCls =
    "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white";

  return (
    <ToolLayout
      name={tool.name}
      description={tool.description}
      longDescription={tool.longDescription}
      category={tool.category}
      categorySlug={tool.categorySlug}
      breadcrumbs={tool.breadcrumbs}
      icon={tool.icon}
      faq={FAQ}
      article={ARTICLE}
      relatedTools={relatedTools}
    >
      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{u.dateTime}</label>
          <input type="datetime-local" value={datetime} onChange={(e) => setDatetime(e.target.value)} className={inputCls} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{u.from}</label>
            <select value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls}>
              {zones.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{u.to}</label>
            <select value={to} onChange={(e) => setTo(e.target.value)} className={inputCls}>
              {zones.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={convert}
          className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
        >
          {u.convert}
        </button>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </p>
        )}

        {result && (
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{u.result}</label>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg bg-neutral-100 px-4 py-3 dark:bg-neutral-800">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">{from}</span>
                <span className="font-mono text-base font-semibold text-neutral-900 dark:text-white">{result.from}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-neutral-100 px-4 py-3 dark:bg-neutral-800">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">{to}</span>
                <span className="font-mono text-base font-semibold text-brand-600 dark:text-brand-400">{result.to}</span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {u.sameInstant}
                {result.offset !== 0 && ` · ${result.offset > 0 ? "+" : ""}${result.offset}h`}
              </p>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
