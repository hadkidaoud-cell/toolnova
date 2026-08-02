"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n";

export function MetaManager() {
  const { dict } = useI18n();
  const pathname = usePathname();

  useEffect(() => {
    let title = dict.site.defaultTitle;
    let description = dict.site.tagline;

    const toolMatch = pathname.match(/^\/tools\/([^/]+)$/);
    if (toolMatch) {
      const slug = toolMatch[1]!;
      const meta = dict.tools.meta[slug as keyof typeof dict.tools.meta];
      if (meta) {
        title = `${meta.name} | ToolNova`;
        description = meta.description;
      }
    } else if (pathname.startsWith("/category/")) {
      const slug = pathname.replace("/category/", "");
      const category =
        dict.category.categories[slug as keyof typeof dict.category.categories];
      if (category) {
        title = `${category.name} | ToolNova`;
        description = category.description;
      }
    } else if (pathname === "/pricing") {
      title = `${dict.pricing.title} | ToolNova`;
    } else if (pathname === "/login") {
      title = `${dict.login.title} | ToolNova`;
    }

    const apply = () => {
      document.title = title;
      document
        .querySelectorAll<HTMLMetaElement>('meta[name="description"]')
        .forEach((el) => {
          el.content = description;
        });
    };

    apply();
    const timer = window.setTimeout(apply, 50);
    return () => window.clearTimeout(timer);
  }, [pathname, dict]);

  return null;
}
