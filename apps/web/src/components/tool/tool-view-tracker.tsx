"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function ToolViewTracker() {
  const pathname = usePathname();
  const sent = useRef<string | null>(null);

  useEffect(() => {
    const slug = pathname.split("/").filter(Boolean)[1];
    if (!slug || sent.current === pathname) return;
    sent.current = pathname;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    fetch(`/api/tools/${encodeURIComponent(slug)}/view`, {
      method: "POST",
      signal: controller.signal,
    }).catch(() => {});
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [pathname]);

  return null;
}
