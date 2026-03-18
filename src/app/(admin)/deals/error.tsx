"use client";

import { useCallback } from "react";
import { AppStatePanel } from "@/shared/ui";

interface DealsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DealsError({ error, reset }: DealsErrorProps) {
  const handleRetry = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <AppStatePanel
        actionLabel="Попробовать снова"
        description={error.digest ? `Код ошибки: ${error.digest}` : "Ошибка загрузки сделок. Обновите страницу."}
        onAction={handleRetry}
        title="Ошибка модуля сделок"
        tone="error"
      />
    </div>
  );
}
