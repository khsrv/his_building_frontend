"use client";

import { useCallback } from "react";
import { AppStatePanel } from "@/shared/ui";

interface FinanceErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function FinanceError({ error, reset }: FinanceErrorProps) {
  const handleRetry = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4 md:p-6">
      <AppStatePanel
        actionLabel="Попробовать снова"
        description={error.digest ? `Код ошибки: ${error.digest}` : "Ошибка в финансовом модуле. Обновите страницу или обратитесь к администратору."}
        onAction={handleRetry}
        title="Ошибка финансового модуля"
        tone="error"
      />
    </div>
  );
}
