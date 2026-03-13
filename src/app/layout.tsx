import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppProviders } from "@/shared/providers/app-providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "Frontend Starter",
  description: "Universal Next.js starter with strict architecture boundaries",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
