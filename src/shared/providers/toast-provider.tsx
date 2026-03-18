"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

type ToastSeverity = "success" | "error" | "info";

interface ToastItem {
  id: number;
  severity: ToastSeverity;
  message: string;
}

interface ToastContextValue {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let nextId = 0;

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [queue, setQueue] = useState<ToastItem[]>([]);
  const current = queue[0] as ToastItem | undefined;

  const push = useCallback((severity: ToastSeverity, message: string) => {
    nextId += 1;
    setQueue((prev) => [...prev, { id: nextId, severity, message }]);
  }, []);

  const handleClose = useCallback((_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") return;
    setQueue((prev) => prev.slice(1));
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      showSuccess: (message: string) => push("success", message),
      showError: (message: string) => push("error", message),
      showInfo: (message: string) => push("info", message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        autoHideDuration={4000}
        key={current?.id}
        onClose={handleClose}
        open={Boolean(current)}
      >
        {current ? (
          <Alert
            onClose={handleClose}
            severity={current.severity}
            sx={{ width: "100%" }}
            variant="filled"
          >
            {current.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}
