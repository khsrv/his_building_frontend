"use client";

import { useCallback } from "react";
import { AppStatePanel } from "@/shared/ui";

interface AdminErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: AdminErrorProps) {
  const handleRetry = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <AppStatePanel
        actionLabel="Попробовать снова"
        description={error.digest ? `Код ошибки: ${error.digest}` : "Произошла непредвиденная ошибка. Попробуйте обновить страницу."}
        onAction={handleRetry}
        title="Что-то пошло не так"
        tone="error"
      />
    </div>
  );
}
