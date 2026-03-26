"use client";

import type { ReactNode } from "react";
import { LocaleProvider } from "@/shared/providers/locale-provider";
import { MuiProvider } from "@/shared/providers/mui-provider";
import { NotifierProvider } from "@/shared/providers/notifier-provider";
import { QueryProvider } from "@/shared/providers/query-provider";
import { ThemeProvider } from "@/shared/providers/theme-provider";
import { ToastProvider } from "@/shared/providers/toast-provider";
import { PropertyProvider } from "@/shared/providers/property-provider";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <MuiProvider>
          <NotifierProvider>
            <QueryProvider>
              <PropertyProvider>
                <ToastProvider>{children}</ToastProvider>
              </PropertyProvider>
            </QueryProvider>
          </NotifierProvider>
        </MuiProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
