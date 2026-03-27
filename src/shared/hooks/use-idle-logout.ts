"use client";

import { useEffect, useRef, useCallback } from "react";

const IDLE_EVENTS = ["mousemove", "keydown", "mousedown", "touchstart", "scroll"] as const;

/**
 * #20 fix: Auto-logout hook for financial system security.
 * Redirects to login page after `timeoutMs` of user inactivity.
 *
 * Default: 30 minutes (1_800_000 ms).
 *
 * Usage: call `useIdleLogout()` once inside the authenticated layout/provider.
 */
export function useIdleLogout(timeoutMs = 30 * 60 * 1000) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogout = useCallback(() => {
    // Clear tokens and redirect
    import("@/shared/lib/http/token-storage").then(({ tokenStorage }) => {
      tokenStorage.clearAll();
    });
    window.location.href = "/login?reason=idle";
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(handleLogout, timeoutMs);
  }, [handleLogout, timeoutMs]);

  useEffect(() => {
    // Skip on server
    if (typeof window === "undefined") return;

    resetTimer();

    for (const event of IDLE_EVENTS) {
      window.addEventListener(event, resetTimer, { passive: true });
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      for (const event of IDLE_EVENTS) {
        window.removeEventListener(event, resetTimer);
      }
    };
  }, [resetTimer]);
}
