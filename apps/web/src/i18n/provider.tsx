"use client";

import * as React from "react";
import en from "./dictionaries/en";
import ar from "./dictionaries/ar";
import fr from "./dictionaries/fr";
import es from "./dictionaries/es";
import pt from "./dictionaries/pt";
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  getLocaleMeta,
  type Locale,
} from "./config";
import type { Dictionary } from "./dictionary";

const DICTIONARIES: Record<Locale, Dictionary> = { en, ar, fr, es, pt };

export interface I18nValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dict: Dictionary;
  dir: "ltr" | "rtl";
  isRTL: boolean;
}

const I18nContext = React.createContext<I18nValue | null>(null);

function detectLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && stored in DICTIONARIES) return stored as Locale;
    const nav = window.navigator.language?.toLowerCase() ?? "";
    if (nav.startsWith("ar")) return "ar";
    if (nav.startsWith("fr")) return "fr";
    if (nav.startsWith("es")) return "es";
    if (nav.startsWith("pt")) return "pt";
    if (nav.startsWith("en")) return "en";
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCALE;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>(DEFAULT_LOCALE);

  React.useEffect(() => {
    setLocaleState(detectLocale());
  }, []);

  React.useEffect(() => {
    const meta = getLocaleMeta(locale);
    const html = document.documentElement;
    html.setAttribute("lang", locale);
    html.setAttribute("dir", meta.dir);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      /* ignore */
    }
  }, [locale]);

  const setLocale = React.useCallback((next: Locale) => {
    setLocaleState(next);
  }, []);

  const meta = getLocaleMeta(locale);

  const value = React.useMemo<I18nValue>(
    () => ({
      locale,
      setLocale,
      dict: DICTIONARIES[locale] ?? en,
      dir: meta.dir,
      isRTL: meta.dir === "rtl",
    }),
    [locale, setLocale, meta.dir]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = React.useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within a LanguageProvider");
  }
  return ctx;
}
