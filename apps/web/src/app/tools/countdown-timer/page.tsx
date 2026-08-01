"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { Timer } from "lucide-react";

const RELATED_SLUGS = ["age-calculator", "date-difference", "tip-calculator"] as const;

const RELATED_ICONS: Record<string, string> = {
  "age-calculator": "🎂",
  "date-difference": "📅",
  "tip-calculator": "💵",
};

const LONG_DESCRIPTION =
  "Set a target date and time and watch a live countdown tick down in days, hours, minutes, and seconds. Great for product launches, trips, exams, or any milestone you're looking forward to. The timer updates every second entirely in your browser.";

const FAQ = [
  {
    question: "Does the countdown stay accurate?",
    answer: "Yes. It recalculates from your device clock every second, so it's as accurate as the system it runs on.",
  },
  {
    question: "What happens when the time is reached?",
    answer: "The timer stops at zero and you can start again or reset the target with one click.",
  },
  {
    question: "Is this saved anywhere?",
    answer: "No. The countdown exists only on the current page in your browser.",
  },
];

const ARTICLE = {
  title: "Why Live Countdowns Work",
  content:
    "A ticking timer converts an abstract deadline into something you can feel. It builds anticipation for launches and events and keeps teams focused on what's coming. With our live counter, your next milestone is always seconds away from being front of mind.",
};

interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  done: boolean;
}

function computeRemaining(target: Date): Remaining {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, done: true };
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, totalSeconds, done: false };
}

export default function CountdownTimerPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.calculation;
  const meta = t.meta["countdown-timer"];
  const u = t.countdown;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "calculation",
    icon: <Timer className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/calculation" },
      { label: meta.name, href: "/tools/countdown-timer" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const now = useMemo(() => {
    const d = new Date();
    d.setSeconds(0, 0);
    const offset = d.getTimezoneOffset();
    return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 16);
  }, []);
  const [eventName, setEventName] = useState("");
  const [target, setTarget] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState<Remaining>({ days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, done: false });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    setError("");
    const targetDate = new Date(target);
    if (!target || isNaN(targetDate.getTime()) || targetDate.getTime() <= Date.now()) {
      setError(u.invalidDate);
      return;
    }
    setRemaining(computeRemaining(targetDate));
    setRunning(true);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const r = computeRemaining(targetDate);
      setRemaining(r);
      if (r.done) {
        setRunning(false);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, 1000);
  }, [target, u.invalidDate]);

  const reset = useCallback(() => {
    setRunning(false);
    setError("");
    setRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, done: false });
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const inputCls =
    "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white";

  const cellCls =
    "flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900";

  const pad = (n: number) => String(n).padStart(2, "0");

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
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{u.eventName}</label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{u.eventDate}</label>
            <input type="datetime-local" value={target} onChange={(e) => setTarget(e.target.value)} className={inputCls} />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={start}
            disabled={running}
            className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-60 dark:focus:ring-offset-neutral-900"
          >
            {running ? u.live : u.start}
          </button>
          {running && (
            <button
              onClick={reset}
              className="rounded-lg border border-neutral-300 bg-white px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              {u.reset}
            </button>
          )}
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </p>
        )}

        {running && (
          <>
            {eventName && (
              <h3 className="text-center text-lg font-semibold text-neutral-900 dark:text-white">{eventName}</h3>
            )}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className={cellCls}>
                <div className="text-4xl font-bold text-brand-600 dark:text-brand-400">{pad(remaining.days)}</div>
                <div className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{u.days}</div>
              </div>
              <div className={cellCls}>
                <div className="text-4xl font-bold text-brand-600 dark:text-brand-400">{pad(remaining.hours)}</div>
                <div className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{u.hours}</div>
              </div>
              <div className={cellCls}>
                <div className="text-4xl font-bold text-brand-600 dark:text-brand-400">{pad(remaining.minutes)}</div>
                <div className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{u.minutes}</div>
              </div>
              <div className={cellCls}>
                <div className="text-4xl font-bold text-green-600 dark:text-green-400">{pad(remaining.seconds)}</div>
                <div className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{u.seconds}</div>
              </div>
            </div>
            <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
              {u.totalRemaining}: {remaining.totalSeconds.toLocaleString()}s
            </p>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
