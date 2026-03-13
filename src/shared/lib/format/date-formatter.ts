import { resolveIntlLocale } from "@/shared/lib/format/intl-locale";

export function formatDateFull(value: Date, locale?: string) {
  const resolvedLocale = resolveIntlLocale(locale);

  return new Intl.DateTimeFormat(resolvedLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(value);
}

export function formatDateTime(value: Date, locale?: string) {
  const resolvedLocale = resolveIntlLocale(locale);

  return new Intl.DateTimeFormat(resolvedLocale, {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export function formatTransactionDate(value: Date, locale?: string) {
  const resolvedLocale = resolveIntlLocale(locale);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const target = new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const oneDay = 24 * 60 * 60 * 1000;

  const timeText = new Intl.DateTimeFormat(resolvedLocale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);

  if (target === today) {
    return resolvedLocale === "ru" || resolvedLocale === "tg" ? `Сегодня, ${timeText}` : `Today, ${timeText}`;
  }

  if (target === today - oneDay) {
    return resolvedLocale === "ru" || resolvedLocale === "tg" ? `Вчера, ${timeText}` : `Yesterday, ${timeText}`;
  }

  const shortDate = new Intl.DateTimeFormat(resolvedLocale, {
    day: "numeric",
    month: "short",
  }).format(value);

  return `${shortDate}, ${timeText}`;
}
