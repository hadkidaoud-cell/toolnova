"use client";

import React, { useState, useCallback, useEffect } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { ShieldCheck } from "lucide-react";

const RELATED_SLUGS = ["uuid-generator", "qr-code-generator", "json-formatter"] as const;

const RELATED_ICONS: Record<string, string> = {
  "uuid-generator": "U",
  "qr-code-generator": "▦",
  "json-formatter": "{}",
};

const LONG_DESCRIPTION =
  "Our Password Generator creates strong, secure passwords tailored to your requirements. Choose the length, which character sets to include (uppercase, lowercase, numbers, symbols), and optionally exclude ambiguous characters and look-alike symbols. Generation happens entirely in your browser.";

const FAQ = [
  {
    question: "How strong is a generated password?",
    answer: "The generator estimates strength based on password length and the number of character sets used. At 16+ characters with all character sets, passwords reach 'Excellent' strength and are infeasible to brute force.",
  },
  {
    question: "Why exclude ambiguous characters?",
    answer: "Excluding ambiguous characters removes symbols that are easy to confuse, such as {}[]()/\\'\\\"`~,;:.<>, improving readability when typing a password from memory or paper.",
  },
  {
    question: "Should I use a password manager?",
    answer: "Yes. Even with strong generated passwords, using a password manager to store and autofill credentials is the best practice. This generator can create unique passwords you store securely.",
  },
];

const ARTICLE = {
  title: "Password Security Fundamentals",
  content:
    "Strong passwords combine length, randomness, and a large character set. Each added character multiplies the number of possible combinations exponentially. Excluding look-alike characters like 0/O and 1/l trades a small amount of entropy for much better readability, which reduces the temptation to write passwords down.",
};

interface StrengthInfo {
  key: "weak" | "fair" | "strong" | "veryStrong" | "excellent";
  color: string;
  percent: number;
}

function getStrength(password: string): StrengthInfo {
  const length = password.length;
  const upper = /[A-Z]/.test(password);
  const lower = /[a-z]/.test(password);
  const num = /[0-9]/.test(password);
  const sym = /[^A-Za-z0-9]/.test(password);
  const pools = [upper, lower, num, sym].filter(Boolean).length;

  if (length < 8) return { key: "weak", color: "bg-red-500", percent: 20 };
  if (length < 12) return { key: "fair", color: "bg-orange-500", percent: 40 };
  if (pools < 3) return { key: "fair", color: "bg-orange-500", percent: 40 };
  if (length < 16) return { key: "strong", color: "bg-yellow-500", percent: 60 };
  if (pools === 4) return { key: "excellent", color: "bg-emerald-500", percent: 100 };
  return { key: "veryStrong", color: "bg-green-500", percent: 80 };
}

function generatePassword(length: number, opts: { upper: boolean; lower: boolean; num: boolean; sym: boolean; excludeAmbiguous: boolean; excludeSimilar: boolean }): string {
  let upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let lower = "abcdefghijklmnopqrstuvwxyz";
  let num = "0123456789";
  let sym = "!@#$%^&*()_+-=[]{};':\",./<>?";
  if (opts.excludeSimilar) {
    upper = upper.replace(/[IO]/g, "");
    lower = lower.replace(/[l]/g, "");
    num = num.replace(/[01]/g, "");
  }
  if (opts.excludeAmbiguous) {
    sym = sym.replace(/[{}[\]()\\\/'\"`~,;:.<>]/g, "");
  }
  const pools: string[] = [];
  if (opts.upper) pools.push(upper);
  if (opts.lower) pools.push(lower);
  if (opts.num) pools.push(num);
  if (opts.sym) pools.push(sym);
  if (pools.length === 0) return "";

  const chars = pools.join("");
  const rand = crypto.getRandomValues(new Uint8Array(length));
  let pwd = "";
  for (let i = 0; i < length; i++) {
    pwd += chars[rand[i]! % chars.length];
  }
  return pwd;
}

export default function PasswordGeneratorPage() {
  const { dict } = useI18n();
  const t = dict.tools;
  const category = t.categories.generator;
  const meta = t.meta["password-generator"];

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "generator",
    icon: <ShieldCheck className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/generator" },
      { label: meta.name, href: "/tools/password-generator" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [length, setLength] = useState(16);
  const [count, setCount] = useState(3);
  const [opts, setOpts] = useState({ upper: true, lower: true, num: true, sym: true, excludeAmbiguous: false, excludeSimilar: false });
  const [passwords, setPasswords] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [historyCopiedIdx, setHistoryCopiedIdx] = useState<number | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    setPasswords(generateMany(length, count, opts));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function generateMany(len: number, cnt: number, o: typeof opts): string[] {
    return Array.from({ length: cnt }, () => generatePassword(len, o));
  }

  const regenerate = useCallback(() => {
    const newPasswords = generateMany(length, count, opts);
    setPasswords(newPasswords);
    setHistory((prev) => [...newPasswords, ...prev].slice(0, 10));
    setCopiedIdx(null);
  }, [length, count, opts]);

  const toggleOpt = useCallback((key: keyof typeof opts) => {
    setOpts((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const copyPassword = useCallback(async (index: number) => {
    try {
      await navigator.clipboard.writeText(passwords[index]!);
      setCopiedIdx(index);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch { }
  }, [passwords]);

  const copyHistory = useCallback(async (index: number) => {
    try {
      await navigator.clipboard.writeText(history[index]!);
      setHistoryCopiedIdx(index);
      setTimeout(() => setHistoryCopiedIdx(null), 2000);
    } catch { }
  }, [history]);

  const strength = getStrength(passwords[0] ?? "");
  const strengthLabel = t.password[strength.key];

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
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex-1 min-w-48">
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t.password.length.replace("{count}", String(length))}
            </label>
            <input
              type="range"
              min={8}
              max={64}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-brand-600"
            />
          </div>
          <div className="flex-1 min-w-48">
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t.password.numberOfPasswords.replace("{count}", String(count))}
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full accent-brand-600"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <input type="checkbox" checked={opts.upper} onChange={() => toggleOpt("upper")} className="h-4 w-4 accent-brand-600" />
            {t.password.uppercaseAZ}
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <input type="checkbox" checked={opts.lower} onChange={() => toggleOpt("lower")} className="h-4 w-4 accent-brand-600" />
            {t.password.lowercaseAz}
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <input type="checkbox" checked={opts.num} onChange={() => toggleOpt("num")} className="h-4 w-4 accent-brand-600" />
            {t.password.numbers09}
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <input type="checkbox" checked={opts.sym} onChange={() => toggleOpt("sym")} className="h-4 w-4 accent-brand-600" />
            {t.password.symbols}
          </label>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <input type="checkbox" checked={opts.excludeSimilar} onChange={() => toggleOpt("excludeSimilar")} className="h-4 w-4 accent-brand-600" />
            {t.password.excludeSimilar}
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <input type="checkbox" checked={opts.excludeAmbiguous} onChange={() => toggleOpt("excludeAmbiguous")} className="h-4 w-4 accent-brand-600" />
            {t.password.excludeAmbiguous}
          </label>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium text-neutral-700 dark:text-neutral-300">{t.password.strength.replace("{label}", strengthLabel)}</span>
            <span className="text-xs text-neutral-500">{t.password.characters.replace("{count}", String(passwords[0]?.length ?? 0))}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
            <div className={`h-full rounded-full ${strength.color} transition-all`} style={{ width: `${strength.percent}%` }} />
          </div>
        </div>

        <button
          onClick={regenerate}
          className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-500 dark:hover:bg-brand-400"
        >
          {t.password.regenerate}
        </button>

        <div className="space-y-2">
          {passwords.map((pwd, index) => (
            <div key={index} className="flex items-center justify-between gap-4 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800">
              <code className="break-all text-sm font-mono text-neutral-800 dark:text-neutral-200">{pwd}</code>
              <button
                onClick={() => copyPassword(index)}
                className="shrink-0 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-brand-500 dark:hover:bg-brand-400"
              >
                {copiedIdx === index ? t.common.copied : t.common.copy}
              </button>
            </div>
          ))}
        </div>

        {history.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">{t.password.history.replace("{count}", String(history.length))}</h3>
            <div className="space-y-2">
              {history.map((pwd, index) => (
                <div key={`${pwd}-${index}`} className="flex items-center justify-between gap-4 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 dark:border-neutral-700 dark:bg-neutral-800">
                  <code className="break-all font-mono text-xs text-neutral-500 dark:text-neutral-400">{pwd}</code>
                  <button
                    onClick={() => copyHistory(index)}
                    className="shrink-0 rounded-md border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  >
                    {historyCopiedIdx === index ? t.common.copied : t.common.copy}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
