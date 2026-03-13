import { defaultLocale, supportedLocales, type SupportedLocale } from "@/shared/constants/locales";

export function resolveIntlLocale(locale?: string | null): SupportedLocale {
  const raw = (locale ?? defaultLocale).trim().toLowerCase();

  if (raw.startsWith("tg")) {
    return "tg";
  }

  if (raw.startsWith("en")) {
    return "en";
  }

  if (raw.startsWith("uz")) {
    return "uz";
  }

  if (supportedLocales.includes(raw as SupportedLocale)) {
    return raw as SupportedLocale;
  }

  return defaultLocale;
}
