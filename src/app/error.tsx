"use client";

import { useCallback } from "react";

interface RootErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: RootErrorProps) {
  const handleRetry = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Что-то пошло не так</h2>
        <p style={{ color: "#666", marginBottom: 16, fontSize: 14 }}>
          {error.digest ? `Код ошибки: ${error.digest}` : "Произошла непредвиденная ошибка."}
        </p>
        <button
          onClick={handleRetry}
          style={{
            padding: "8px 20px",
            borderRadius: 8,
            border: "1px solid #ccc",
            background: "#fff",
            cursor: "pointer",
            fontSize: 14,
          }}
          type="button"
        >
          Попробовать снова
        </button>
      </div>
    </div>
  );
}
