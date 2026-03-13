"use client";

import { useEffect } from "react";

interface UseUnsavedChangesGuardOptions {
  enabled: boolean;
  message?: string;
}

export function useUnsavedChangesGuard({
  enabled,
  message = "You have unsaved changes. Do you really want to leave?",
}: UseUnsavedChangesGuardOptions) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [enabled, message]);
}
