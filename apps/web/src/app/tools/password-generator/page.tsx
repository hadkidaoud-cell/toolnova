"use client";

import React, { useState, useCallback, useMemo } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";

const TOOL = {
  slug: "password-generator",
  name: "Password Generator",
  description: "Generate strong, secure passwords with customizable options.",
  longDescription:
    "Our Password Generator creates strong, random passwords based on your preferences. You can choose to include uppercase letters, lowercase letters, numbers, and symbols. Adjust the length from 4 to 64 characters and see the password strength update in real time. A strong password is essential for keeping your accounts secure.",
  category: "Security Tools",
  categorySlug: "security",
  icon: "K",
  breadcrumbs: [
    { label: "Security Tools", href: "/category/security" },
    { label: "Password Generator", href: "/tools/password-generator" },
  ],
};

const RELATED_TOOLS = [
  { slug: "uuid-generator", name: "UUID Generator", description: "Generate unique UUIDs", icon: "U" },
  { slug: "token-generator", name: "Token Generator", description: "Generate secure API tokens", icon: "T" },
  { slug: "hash-generator", name: "Hash Generator", description: "Generate hash values", icon: "#" },
];

const FAQ = [
  {
    question: "What makes a password strong?",
    answer: "A strong password includes a mix of uppercase and lowercase letters, numbers, and symbols. It should be at least 12 characters long and avoid common words or patterns. Longer passwords with more character variety are exponentially harder to crack.",
  },
  {
    question: "How does password strength work?",
    answer: "Password strength is estimated based on entropy — the number of possible combinations. Weak passwords (under 28 bits of entropy) can be cracked instantly, while very strong passwords (over 80 bits) would take centuries to brute force.",
  },
  {
    question: "Should I use a password manager?",
    answer: "Yes! Password managers securely store your generated passwords so you don't need to remember them. They also help you use unique passwords for every account, which is the most important security practice.",
  },
  {
    question: "What is the ideal password length?",
    answer: "We recommend at least 16 characters for most uses. Each additional character exponentially increases the number of possible combinations, making brute-force attacks impractical.",
  },
];

const ARTICLE = {
  title: "The Importance of Strong Passwords",
  content:
    "In today's digital landscape, password security is more critical than ever. Weak passwords are the leading cause of account breaches. A strong password — long, random, and unique to each account — is your first line of defense against unauthorized access. Using a password generator ensures you never rely on predictable patterns, birthdays, or common words that attackers can easily guess.",
};

function getStrength(password: string): { label: string; color: string; percent: number } {
  if (!password) return { label: "", color: "", percent: 0 };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  if (password.length >= 20) score += 1;

  if (score <= 2) return { label: "Weak", color: "bg-red-500", percent: 25 };
  if (score <= 3) return { label: "Medium", color: "bg-orange-500", percent: 50 };
  if (score <= 5) return { label: "Strong", color: "bg-yellow-500", percent: 75 };
  return { label: "Very Strong", color: "bg-green-500", percent: 100 };
}

function generatePassword(length: number, useUpper: boolean, useLower: boolean, useNumbers: boolean, useSymbols: boolean): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  let chars = "";
  if (useUpper) chars += upper;
  if (useLower) chars += lower;
  if (useNumbers) chars += numbers;
  if (useSymbols) chars += symbols;
  if (!chars) return "";
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array).map((n) => chars[n % chars.length]).join("");
}

export default function PasswordGeneratorPage() {
  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [counter, setCounter] = useState(0);
  const [copied, setCopied] = useState(false);

  const passwordWithCounter = useMemo(
    () => generatePassword(length, useUpper, useLower, useNumbers, useSymbols),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [length, useUpper, useLower, useNumbers, useSymbols, counter]
  );

  const strength = useMemo(() => getStrength(passwordWithCounter), [passwordWithCounter]);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(passwordWithCounter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { }
  }, [passwordWithCounter]);

  return (
    <ToolLayout
      name={TOOL.name}
      description={TOOL.description}
      longDescription={TOOL.longDescription}
      category={TOOL.category}
      categorySlug={TOOL.categorySlug}
      breadcrumbs={TOOL.breadcrumbs}
      icon={TOOL.icon}
      faq={FAQ}
      article={ARTICLE}
      relatedTools={RELATED_TOOLS}
    >
      <div className="space-y-6">
        <div className="rounded-lg border border-neutral-300 bg-neutral-50 p-4 dark:border-neutral-600 dark:bg-neutral-800">
          <div className="break-all text-center font-mono text-2xl tracking-wider text-neutral-900 dark:text-white">
            {passwordWithCounter}
          </div>
        </div>

        {passwordWithCounter && (
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-neutral-700 dark:text-neutral-300">Strength: {strength.label}</span>
              <span className="text-neutral-500">{passwordWithCounter.length} characters</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
              <div
                className={`h-full rounded-full transition-all ${strength.color}`}
                style={{ width: `${strength.percent}%` }}
              />
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Length: {length}
            </label>
            <input
              type="range"
              min={4}
              max={64}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-neutral-400">
              <span>4</span>
              <span>64</span>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { label: "Uppercase (A-Z)", checked: useUpper, onChange: setUseUpper },
              { label: "Lowercase (a-z)", checked: useLower, onChange: setUseLower },
              { label: "Numbers (0-9)", checked: useNumbers, onChange: setUseNumbers },
              { label: "Symbols (!@#$%^&*)", checked: useSymbols, onChange: setUseSymbols },
            ].map((opt) => (
              <label
                key={opt.label}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-200 p-3 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
              >
                <input
                  type="checkbox"
                  checked={opt.checked}
                  onChange={(e) => opt.onChange(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm text-neutral-700 dark:text-neutral-300">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setCounter((c) => c + 1)}
            className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            Regenerate
          </button>
          <button
            onClick={copyToClipboard}
            className="rounded-lg border border-neutral-300 bg-white px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            {copied ? "Copied!" : "Copy to Clipboard"}
          </button>
        </div>
      </div>
    </ToolLayout>
  );
}
