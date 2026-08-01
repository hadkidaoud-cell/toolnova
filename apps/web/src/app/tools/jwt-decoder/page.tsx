"use client";

import React, { useState } from "react";
import { ToolLayout } from "@/components/tool/tool-layout";
import { useI18n } from "@/i18n";
import { KeyRound } from "lucide-react";

const RELATED_SLUGS = ["hash-generator", "base64-encoder", "url-encoder-decoder"] as const;

const RELATED_ICONS: Record<string, string> = {
  "hash-generator": "#",
  "base64-encoder": "64",
  "url-encoder-decoder": "URL",
};

const LONG_DESCRIPTION =
  "The JWT Decoder inspects any JSON Web Token without sending it anywhere. Paste a token and instantly see the decoded header, payload, and signature — plus human-readable issued-at and expiry times. Great for debugging authentication issues and understanding what's inside your access tokens.";

const FAQ = [
  {
    question: "What is a JWT?",
    answer: "A JSON Web Token is a compact, URL-safe string with three dot-separated parts: header, payload, and signature. It is widely used for authentication and authorization.",
  },
  {
    question: "Is decoding safe?",
    answer: "Yes. Decoding only reveals the base64 content; we never send your token anywhere. Remember that the payload is not encrypted, so don't put secrets in it.",
  },
  {
    question: "Do you verify the signature?",
    answer: "No. Signature verification requires the secret key. This tool decodes and formats the token so you can read its claims.",
  },
];

const ARTICLE = {
  title: "Reading JWT Tokens",
  content:
    "JWTs are self-contained: the server that issues them signs the payload, and clients present them on every request. Inspecting a token helps you understand claims like subject, issuer, and expiration. Our decoder formats each part as readable JSON and converts epoch timestamps into human-friendly dates.",
};

function b64urlDecode(input: string): string {
  let s = input.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function prettyJson(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
}

function formatEpoch(epoch: number, locale: string): string {
  try {
    return new Date(epoch * 1000).toLocaleString(locale);
  } catch {
    return new Date(epoch * 1000).toLocaleString();
  }
}

export default function JwtDecoderPage() {
  const { dict, locale } = useI18n();
  const t = dict.tools;
  const category = t.categories.developer;
  const meta = t.meta["jwt-decoder"];
  const u = t.jwtDecoder;

  const tool = {
    name: meta.name,
    description: meta.description,
    longDescription: LONG_DESCRIPTION,
    category,
    categorySlug: "developer",
    icon: <KeyRound className="h-6 w-6" />,
    breadcrumbs: [
      { label: category, href: "/category/developer" },
      { label: meta.name, href: "/tools/jwt-decoder" },
    ],
  };

  const relatedTools = RELATED_SLUGS.map((slug) => ({
    slug,
    name: t.meta[slug].name,
    description: t.meta[slug].short,
    icon: RELATED_ICONS[slug] ?? "+",
  }));

  const [token, setToken] = useState("");
  const [decoded, setDecoded] = useState<{ header: string; payload: string; signature: string; iat?: string; exp?: string } | null>(null);
  const [error, setError] = useState("");

  const decode = () => {
    setError("");
    if (!token) {
      setDecoded(null);
      return;
    }
    const parts = token.trim().split(".");
    if (parts.length !== 3) {
      setDecoded(null);
      setError(u.invalidToken);
      return;
    }
    try {
      const header = JSON.parse(b64urlDecode(parts[0]!));
      const payload = JSON.parse(b64urlDecode(parts[1]!));
      setDecoded({
        header: prettyJson(header),
        payload: prettyJson(payload),
        signature: parts[2] ?? "",
        iat: payload.iat ? formatEpoch(payload.iat, locale) : undefined,
        exp: payload.exp ? formatEpoch(payload.exp, locale) : undefined,
      });
    } catch {
      setDecoded(null);
      setError(u.invalidToken);
    }
  };

  const sectionCls = "rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3 dark:border-neutral-600 dark:bg-neutral-900";

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
          <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {u.token}
          </label>
          <textarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={u.tokenPlaceholder}
            rows={4}
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 font-mono text-xs text-neutral-900 placeholder-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
          />
        </div>

        <button
          onClick={decode}
          disabled={!token}
          className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-neutral-900"
        >
          {u.decode}
        </button>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </p>
        )}

        {decoded && (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{u.header}</label>
              <pre className={sectionCls + " max-h-48 overflow-auto font-mono text-xs"}>{decoded.header}</pre>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{u.payload}</label>
              <pre className={sectionCls + " max-h-64 overflow-auto font-mono text-xs"}>{decoded.payload}</pre>
              {decoded.iat && (
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                  {u.issuedAt}: <span className="font-medium text-neutral-700 dark:text-neutral-200">{decoded.iat}</span>
                </p>
              )}
              {decoded.exp && (
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  {u.expiresAt}: <span className="font-medium text-neutral-700 dark:text-neutral-200">{decoded.exp}</span>
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{u.signature}</label>
              <code className={sectionCls + " block break-all font-mono text-xs"}>{decoded.signature}</code>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
