"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/shared/lib/ui/cn";

type ToastType = "info" | "success" | "error";

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface NotifierContextValue {
  info: (message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

const NotifierContext = createContext<NotifierContextValue | undefined>(undefined);

function buildToastId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

interface NotifierProviderProps {
  children: ReactNode;
}

export function NotifierProvider({ children }: NotifierProviderProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const push = useCallback((type: ToastType, message: string) => {
    const id = buildToastId();
    const nextToast: ToastMessage = { id, type, message };

    setToasts((current) => [...current, nextToast]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 2600);
  }, []);

  const value = useMemo<NotifierContextValue>(() => {
    return {
      info: (message: string) => push("info", message),
      success: (message: string) => push("success", message),
      error: (message: string) => push("error", message),
    };
  }, [push]);

  return (
    <NotifierContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[320px] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            className={cn(
              "rounded-lg border px-4 py-3 text-sm shadow-lg",
              toast.type === "info" && "border-info/30 bg-info/10 text-foreground",
              toast.type === "success" && "border-success/30 bg-success/10 text-foreground",
              toast.type === "error" && "border-danger/35 bg-danger/10 text-foreground",
            )}
            key={toast.id}
            role="status"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </NotifierContext.Provider>
  );
}

export function useNotifier() {
  const context = useContext(NotifierContext);

  if (!context) {
    throw new Error("useNotifier must be used inside NotifierProvider");
  }

  return context;
}
