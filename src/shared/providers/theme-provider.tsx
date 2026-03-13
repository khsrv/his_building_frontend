"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { prefsKeys } from "@/shared/constants/prefs-keys";
import { themeModes, type ThemeMode } from "@/shared/constants/theme";

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedMode: Exclude<ThemeMode, "system">;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const THEME_MODE_EVENT = "app-theme-mode-changed";

function getSystemMode(): Exclude<ThemeMode, "system"> {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function normalizeThemeMode(value: string | null): ThemeMode {
  if (value && themeModes.includes(value as ThemeMode)) {
    return value as ThemeMode;
  }

  return "system";
}

function getInitialMode(): ThemeMode {
  return "system";
}

function subscribeThemeMode(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key && event.key !== prefsKeys.themeMode) {
      return;
    }
    onStoreChange();
  };
  const handleCustom = () => onStoreChange();

  window.addEventListener("storage", handleStorage);
  window.addEventListener(THEME_MODE_EVENT, handleCustom);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(THEME_MODE_EVENT, handleCustom);
  };
}

function getThemeModeSnapshot(): ThemeMode {
  if (typeof window === "undefined") {
    return getInitialMode();
  }

  return normalizeThemeMode(window.localStorage.getItem(prefsKeys.themeMode));
}

function getThemeModeServerSnapshot(): ThemeMode {
  return getInitialMode();
}

function subscribeSystemMode(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const handleMediaChange = () => onStoreChange();
  media.addEventListener("change", handleMediaChange);

  return () => {
    media.removeEventListener("change", handleMediaChange);
  };
}

function getSystemModeSnapshot(): Exclude<ThemeMode, "system"> {
  return getSystemMode();
}

function getSystemModeServerSnapshot(): Exclude<ThemeMode, "system"> {
  return "light";
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const mode = useSyncExternalStore(subscribeThemeMode, getThemeModeSnapshot, getThemeModeServerSnapshot);
  const systemMode = useSyncExternalStore(subscribeSystemMode, getSystemModeSnapshot, getSystemModeServerSnapshot);

  const resolvedMode = mode === "system" ? systemMode : mode;

  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle("dark", resolvedMode === "dark");
    root.dataset.theme = resolvedMode;
  }, [resolvedMode]);

  const setMode = (nextMode: ThemeMode) => {
    if (typeof window === "undefined") {
      return;
    }

    const normalizedMode = normalizeThemeMode(nextMode);
    window.localStorage.setItem(prefsKeys.themeMode, normalizedMode);
    window.dispatchEvent(new Event(THEME_MODE_EVENT));
  };

  const value = useMemo<ThemeContextValue>(() => {
    return {
      mode,
      resolvedMode,
      setMode,
      toggle: () => {
        setMode(resolvedMode === "dark" ? "light" : "dark");
      },
    };
  }, [mode, resolvedMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useThemeMode must be used inside ThemeProvider");
  }

  return context;
}
