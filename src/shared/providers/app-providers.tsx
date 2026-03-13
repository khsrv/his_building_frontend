"use client";

import type { ReactNode } from "react";
import { LocaleProvider } from "@/shared/providers/locale-provider";
import { NotifierProvider } from "@/shared/providers/notifier-provider";
import { QueryProvider } from "@/shared/providers/query-provider";
import { ThemeProvider } from "@/shared/providers/theme-provider";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <QueryProvider>
          <NotifierProvider>{children}</NotifierProvider>
        </QueryProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
