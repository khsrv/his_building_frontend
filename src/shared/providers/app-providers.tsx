"use client";

import type { ReactNode } from "react";
import { LocaleProvider } from "@/shared/providers/locale-provider";
import { MuiProvider } from "@/shared/providers/mui-provider";
import { NotifierProvider } from "@/shared/providers/notifier-provider";
import { QueryProvider } from "@/shared/providers/query-provider";
import { ThemeProvider } from "@/shared/providers/theme-provider";
import { ToastProvider } from "@/shared/providers/toast-provider";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <MuiProvider>
          <QueryProvider>
            <NotifierProvider>
              <ToastProvider>{children}</ToastProvider>
            </NotifierProvider>
          </QueryProvider>
        </MuiProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
