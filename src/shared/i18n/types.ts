import type { enDictionary } from "@/shared/i18n/dictionaries/en";

export type TranslationKey = keyof typeof enDictionary;
export type TranslationDictionary = Record<TranslationKey, string>;
