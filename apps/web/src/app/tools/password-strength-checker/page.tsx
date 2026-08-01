"use client";

import React, { useMemo, useState } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";

const RELATED_SLUGS = ["hash-generator", "jwt-decoder", "password-generator"] as const;

const RELATED_ICONS: Record<string, string> = {
  "hash-generator": "#",
  "jwt-decoder": "JWT",
  "password-generator": "🔑",
};

const LONG_DESCRIPTION =
  "Check how strong your password really is. We analyze length, character variety, and blacklisted common passwords, then give a score from very weak to very strong with a live checklist. No password ever leaves your browser.";

const FAQ = [
  {
    question: "Why is length so important?",
    answer: "Longer passwords have exponentially more combinations. An 8-character password can be cracked in hours, while a 16-character one can take centuries.",
  },
  {
    question: "Does this check passwords against leaks?",
    answer: "We compare against a small built-in list of the most common passwords. For a full breach check, use a dedicated service that supports the Have I Been Pwned API.",
  },
  {
    question: "Is my password sent anywhere?",
    answer: "No. Everything runs locally in your browser, so your password is never transmitted or stored.",
  },
];

const ARTICLE = {
  title: "Strength Isn't Just Length",
  content:
    "Strong passwords combine length, unpredictability, and variety — but the best defense is uniqueness. Use a different password for every account and rely on a password manager. A strength meter is a useful guardrail, but it can't protect you from reused credentials.",
};

const COMMON_PASSWORDS = new Set([
  "password",
  "123456",
  "12345678",
  "123456789",
  "1234567890",
  "qwerty",
  "abc123",
  "password1",
  "password123",
  "letmein",
  "welcome",
  "admin",
  "iloveyou",
  "monkey",
  "dragon",
  "football",
  "baseball",
  "trustno1",
]);

export default function PasswordStrengthCheckerPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.text;
  const meta = t.meta["password-strength-checker"];
  const u = t.passwordStrength;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "text",
    icon: <ShieldCheck className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/text" },
      { label: meta.name, href: "/tools/password-strength-checker" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const result = useMemo(() => {
    let score = 0;
    const len = password.length;
    if (len >= 8) score++;
    if (len >= 12) score++;
    if (len >= 16) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (COMMON_PASSWORDS.has(password.toLowerCase())) score = Math.min(score, 1);

    let level: "veryWeak" | "weak" | "fair" | "strong" | "veryStrong" = "veryWeak";
    if (score >= 6) level = "veryStrong";
    else if (score >= 5) level = "strong";
    else if (score >= 3) level = "fair";
    else if (score >= 2) level = "weak";

    return { score, max: 7, level, len };
  }, [password]);

  const checklist = [
    { key: "length", done: result.len >= 8 },
    { key: "uppercase", done: /[A-Z]/.test(password) },
    { key: "lowercase", done: /[a-z]/.test(password) },
    { key: "number", done: /[0-9]/.test(password) },
    { key: "symbol", done: /[^A-Za-z0-9]/.test(password) },
    { key: "commonPassword", done: password.length > 0 && !COMMON_PASSWORDS.has(password.toLowerCase()) },
  ];

  const colors: Record<typeof result.level, string> = {
    veryWeak: "bg-red-500",
    weak: "bg-orange-500",
    fair: "bg-yellow-500",
    strong: "bg-green-500",
    veryStrong: "bg-emerald-500",
  };

  const pct = result.max > 0 ? Math.round((result.score / result.max) * 100) : 0;

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
          <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{u.password}</label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={u.password}
              className="w-full rounded-lg border border-neutral-300 bg-white py-3 pl-4 pr-24 text-neutral-900 placeholder-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "hide" : "show"}
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {password.length > 0 && (
          <>
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-neutral-700 dark:text-neutral-300">{u[result.level]}</span>
                <span className="text-neutral-500 dark:text-neutral-400">
                  {u.score}: {result.score}/{result.max}
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                <div
                  className={`h-full rounded-full transition-all ${colors[result.level]}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {checklist.map((c) => (
                <div
                  key={c.key}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                    c.done
                      ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-300"
                      : "border-neutral-200 bg-neutral-50 text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
                  }`}
                >
                  <span className="text-base leading-none">{c.done ? "✓" : "○"}</span>
                  {u[c.key as "length"]}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
