export const LOCALES = [
  { code: "en", label: "English", native: "English", dir: "ltr" as const },
  { code: "ar", label: "Arabic", native: "العربية", dir: "rtl" as const },
  { code: "fr", label: "French", native: "Français", dir: "ltr" as const },
  { code: "es", label: "Spanish", native: "Español", dir: "ltr" as const },
  { code: "pt", label: "Portuguese", native: "Português", dir: "ltr" as const },
];

export type Locale = (typeof LOCALES)[number]["code"];
export type LocaleMeta = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_STORAGE_KEY = "toolnova-locale";

export function getLocaleMeta(locale: Locale): LocaleMeta {
  return LOCALES.find((l) => l.code === locale) ?? (LOCALES[0] as LocaleMeta);
}
