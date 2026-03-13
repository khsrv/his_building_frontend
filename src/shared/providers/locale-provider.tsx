"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { defaultLocale, supportedLocales, type SupportedLocale } from "@/shared/constants/locales";
import { prefsKeys } from "@/shared/constants/prefs-keys";
import { getDictionary, interpolate } from "@/shared/i18n";
import type { TranslationDictionary, TranslationKey } from "@/shared/i18n/types";
import { resolveIntlLocale } from "@/shared/lib/format/intl-locale";

interface LocaleContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  dictionary: TranslationDictionary;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);
const LOCALE_EVENT = "app-locale-changed";

function normalizeLocale(value: string | null): SupportedLocale {
  if (!value) {
    return defaultLocale;
  }

  const normalized = resolveIntlLocale(value);
  if (supportedLocales.includes(normalized)) {
    return normalized;
  }

  return defaultLocale;
}

interface LocaleProviderProps {
  children: ReactNode;
}

function subscribeLocale(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key && event.key !== prefsKeys.localeCode) {
      return;
    }
    onStoreChange();
  };
  const handleCustom = () => onStoreChange();

  window.addEventListener("storage", handleStorage);
  window.addEventListener(LOCALE_EVENT, handleCustom);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(LOCALE_EVENT, handleCustom);
  };
}

function getLocaleSnapshot(): SupportedLocale {
  if (typeof window === "undefined") {
    return defaultLocale;
  }

  return normalizeLocale(window.localStorage.getItem(prefsKeys.localeCode));
}

function getLocaleServerSnapshot(): SupportedLocale {
  return defaultLocale;
}

export function LocaleProvider({ children }: LocaleProviderProps) {
  const locale = useSyncExternalStore(subscribeLocale, getLocaleSnapshot, getLocaleServerSnapshot);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const dictionary = useMemo(() => getDictionary(locale), [locale]);
  const fallbackDictionary = useMemo(() => getDictionary(defaultLocale), []);

  const value = useMemo<LocaleContextValue>(() => {
    const setLocale = (nextLocale: SupportedLocale) => {
      if (typeof window === "undefined") {
        return;
      }

      const normalizedLocale = normalizeLocale(nextLocale);
      window.localStorage.setItem(prefsKeys.localeCode, normalizedLocale);
      window.dispatchEvent(new Event(LOCALE_EVENT));
    };

    const t = (key: TranslationKey, params?: Record<string, string | number>) => {
      const template = dictionary[key] ?? fallbackDictionary[key] ?? key;
      return interpolate(template, params);
    };

    return {
      locale,
      setLocale,
      dictionary,
      t,
    };
  }, [dictionary, fallbackDictionary, locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useI18n must be used inside LocaleProvider");
  }

  return context;
}
