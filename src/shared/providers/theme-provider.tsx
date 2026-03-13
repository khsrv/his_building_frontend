"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { prefsKeys } from "@/shared/constants/prefs-keys";
import { themeModes, type ThemeMode } from "@/shared/constants/theme";

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedMode: Exclude<ThemeMode, "system">;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

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
  if (typeof window === "undefined") {
    return "system";
  }

  return normalizeThemeMode(window.localStorage.getItem(prefsKeys.themeMode));
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(() => getInitialMode());
  const [systemMode, setSystemMode] = useState<Exclude<ThemeMode, "system">>(() => getSystemMode());

  const resolvedMode = mode === "system" ? systemMode : mode;

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handleMediaChange = (event: MediaQueryListEvent) => {
      setSystemMode(event.matches ? "dark" : "light");
    };

    media.addEventListener("change", handleMediaChange);

    return () => {
      media.removeEventListener("change", handleMediaChange);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle("dark", resolvedMode === "dark");
    root.dataset.theme = resolvedMode;
  }, [resolvedMode]);

  const setMode = (nextMode: ThemeMode) => {
    setModeState(nextMode);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(prefsKeys.themeMode, nextMode);
    }
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
