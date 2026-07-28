// ============================================================
// ToolNova Logo
// ============================================================

import Link from "next/link";
import { siteConfig } from "@/config";

interface LogoProps {
  className?: string;
  showSlogan?: boolean;
}

export function Logo({ className = "", showSlogan = false }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className}`}>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
          {siteConfig.name}
        </span>
        {showSlogan && (
          <span className="text-[10px] leading-tight text-neutral-500 dark:text-neutral-400">
            {siteConfig.slogan}
          </span>
        )}
      </div>
    </Link>
  );
}
