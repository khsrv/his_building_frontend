export const supportedLocales = ["ru", "en", "tg", "uz"] as const;
export type SupportedLocale = (typeof supportedLocales)[number];
export const defaultLocale: SupportedLocale = "ru";
