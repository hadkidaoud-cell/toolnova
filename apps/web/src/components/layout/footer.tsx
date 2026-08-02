"use client";

import * as React from "react";
import Link from "next/link";
import { Code2, MessageCircle, Globe, Mail, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/i18n";

const SOCIAL_LINKS = [
  { icon: Code2, href: "#", label: "GitHub" },
  { icon: MessageCircle, href: "#", label: "X" },
  { icon: Globe, href: "#", label: "LinkedIn" },
  { icon: Mail, href: "#", label: "Email" },
];

export function Footer() {
  const { dict } = useI18n();
  const [email, setEmail] = React.useState("");

  const FOOTER_LINKS = React.useMemo(
    () => ({
      [dict.footer.product]: [
        { label: dict.footer.allTools, href: "/tools" },
        { label: dict.footer.categories, href: "/category/text" },
        { label: dict.footer.pricing, href: "/pricing" },
        { label: dict.footer.api, href: "#" },
      ],
      [dict.footer.tools]: [
        { label: dict.footer.toolLinks.qrCode, href: "/tools/qr-code-generator" },
        { label: dict.footer.toolLinks.imageCompressor, href: "/tools/image-compressor" },
        { label: dict.footer.toolLinks.pdfMerger, href: "/tools/pdf-merger" },
        { label: dict.footer.toolLinks.pdfSplitter, href: "/tools/pdf-splitter" },
        { label: dict.footer.toolLinks.imageToPdf, href: "/tools/image-to-pdf" },
        { label: dict.footer.toolLinks.jsonFormatter, href: "/tools/json-formatter" },
        { label: dict.footer.toolLinks.wordCounter, href: "/tools/word-counter" },
      ],
      [dict.footer.resources]: [
        { label: dict.footer.blog, href: "/blog" },
        { label: dict.footer.documentation, href: "#" },
        { label: dict.footer.helpCenter, href: "#" },
        { label: dict.footer.community, href: "#" },
        { label: dict.footer.status, href: "#" },
      ],
      [dict.footer.company]: [
        { label: dict.footer.about, href: "#" },
        { label: dict.footer.careers, href: "#" },
        { label: dict.footer.privacy, href: "#" },
        { label: dict.footer.terms, href: "#" },
        { label: dict.footer.contact, href: "#" },
      ],
    }),
    [dict.footer]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // placeholder
    setEmail("");
  };

  return (
    <footer className="border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 py-16 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white">
                T
              </div>
              <span className="text-xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent">Tool</span>
                <span className="text-neutral-900 dark:text-white">Nova</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
              {dict.footer.tagline}
            </p>
            <div className="mt-6 flex items-center gap-3">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
              <div className="ml-auto">
                <ThemeToggle />
              </div>
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">{category}</h4>
              <ul className="mt-4 space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-neutral-200 py-8 dark:border-neutral-800">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              &copy; {new Date().getFullYear()} ToolNova. {dict.footer.rights}
            </p>
            <div className="flex items-center gap-4">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 rtl:left-auto rtl:right-3" />
                  <Input
                    type="email"
                    placeholder={dict.footer.getUpdates}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9 w-48 pl-9 text-sm rtl:pl-3 rtl:pr-9"
                    required
                  />
                </div>
                <Button type="submit" size="sm" className="h-9">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
