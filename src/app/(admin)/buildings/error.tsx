"use client";

import { useCallback } from "react";
import { AppStatePanel } from "@/shared/ui";

interface BuildingsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function BuildingsError({ error, reset }: BuildingsErrorProps) {
  const handleRetry = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <AppStatePanel
        actionLabel="Попробовать снова"
        description={error.digest ? `Код ошибки: ${error.digest}` : "Ошибка загрузки объектов. Обновите страницу."}
        onAction={handleRetry}
        title="Ошибка модуля объектов"
        tone="error"
      />
    </div>
  );
}
