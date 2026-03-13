import { defaultLocale, type SupportedLocale } from "@/shared/constants/locales";
import { enDictionary } from "@/shared/i18n/dictionaries/en";
import { ruDictionary } from "@/shared/i18n/dictionaries/ru";
import { tgDictionary } from "@/shared/i18n/dictionaries/tg";
import { uzDictionary } from "@/shared/i18n/dictionaries/uz";
import type { TranslationDictionary } from "@/shared/i18n/types";

const dictionaries: Record<SupportedLocale, TranslationDictionary> = {
  en: enDictionary,
  ru: ruDictionary,
  tg: tgDictionary,
  uz: uzDictionary,
};

export function getDictionary(locale: SupportedLocale): TranslationDictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

export function interpolate(template: string, params?: Record<string, string | number>) {
  if (!params) {
    return template;
  }

  return Object.entries(params).reduce((result, [key, value]) => {
    return result.replaceAll(`{${key}}`, String(value));
  }, template);
}
