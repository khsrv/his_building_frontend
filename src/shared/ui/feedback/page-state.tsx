"use client";

import type { ReactNode } from "react";
import { normalizeErrorMessage } from "@/shared/lib/errors/normalize-error-message";
import { useI18n } from "@/shared/providers/locale-provider";

interface PageStateProps {
  isLoading: boolean;
  error: unknown;
  isEmpty: boolean;
  children: ReactNode;
  loadingFallback?: ReactNode;
  emptyFallback?: ReactNode;
  errorFallback?: ReactNode;
}

export function PageState({
  isLoading,
  error,
  isEmpty,
  children,
  loadingFallback,
  emptyFallback,
  errorFallback,
}: PageStateProps) {
  const { t } = useI18n();

  if (isLoading) {
    return <>{loadingFallback ?? <p className="text-sm text-muted-foreground">{t("common.loading")}</p>}</>;
  }

  if (error) {
    return (
      <>
        {errorFallback ?? (
          <p className="text-sm text-danger">
            {t("common.error")}: {normalizeErrorMessage(error)}
          </p>
        )}
      </>
    );
  }

  if (isEmpty) {
    return <>{emptyFallback ?? <p className="text-sm text-muted-foreground">{t("common.empty")}</p>}</>;
  }

  return <>{children}</>;
}
