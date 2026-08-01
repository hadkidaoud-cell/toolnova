"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";

export default function ToolFallbackPage() {
  const params = useParams();
  const { dict } = useI18n();
  void params;

  const t = dict.notFoundPage;
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="text-center">
        <p className="text-8xl font-bold text-brand-600">404</p>
        <h1 className="mt-4 text-3xl font-bold text-neutral-900 dark:text-white">{t.title}</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">{t.description}</p>
        <Link href="/">
          <Button className="mt-8">{t.backToHome}</Button>
        </Link>
      </div>
    </main>
  );
}
