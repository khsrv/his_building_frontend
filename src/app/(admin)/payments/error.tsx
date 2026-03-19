"use client";

import { useCallback } from "react";
import { AppStatePanel } from "@/shared/ui";

interface PaymentsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PaymentsError({ error, reset }: PaymentsErrorProps) {
  const handleRetry = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4 md:p-6">
      <AppStatePanel
        actionLabel="Попробовать снова"
        description={error.digest ? `Код ошибки: ${error.digest}` : "Ошибка загрузки платежей. Обновите страницу."}
        onAction={handleRetry}
        title="Ошибка модуля платежей"
        tone="error"
      />
    </div>
  );
}
