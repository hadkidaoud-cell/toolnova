// ============================================================
// ToolNova Footer
// ============================================================

import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { footerConfig, siteConfig } from "@/config";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="container-toolnova py-12 lg:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-6">
          <div className="col-span-2">
            <Logo showSlogan />
            <p className="mt-4 max-w-xs text-sm text-neutral-600 dark:text-neutral-400">
              Every tool you need, all in one place. Fast, free, and easy to use.
            </p>
          </div>

          {footerConfig.sections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 text-sm font-semibold text-neutral-900 dark:text-white">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-neutral-200 pt-8 dark:border-neutral-800 sm:flex-row">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            &copy; {currentYear} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
