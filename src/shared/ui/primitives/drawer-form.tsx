"use client";

import type { ReactNode } from "react";
import { AppButton } from "@/shared/ui/primitives/button";

interface AppDrawerFormProps {
  open: boolean;
  title: string;
  subtitle?: string;
  saveLabel?: string;
  cancelLabel?: string;
  isSaving?: boolean;
  saveDisabled?: boolean;
  widthClassName?: string;
  onClose: () => void;
  onSave: () => void;
  children: ReactNode;
}

export function AppDrawerForm({
  open,
  title,
  subtitle,
  saveLabel = "Save",
  cancelLabel = "Cancel",
  isSaving = false,
  saveDisabled = false,
  widthClassName = "w-[min(520px,100vw)]",
  onClose,
  onSave,
  children,
}: AppDrawerFormProps) {
  return (
    <div
      className={[
        "fixed inset-0 z-50 transition-opacity",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      ].join(" ")}
      role="presentation"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div
        className={[
          "absolute inset-y-0 right-0 flex flex-col border-l border-border bg-card shadow-xl transition-transform",
          widthClassName,
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <header className="border-b border-border px-4 py-4">
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          {subtitle ? <p className="pt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
        </header>

        <div className="min-h-0 flex-1 overflow-auto px-4 py-4">{children}</div>

        <footer className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
          <AppButton label={cancelLabel} onClick={onClose} variant="secondary" />
          <AppButton
            disabled={saveDisabled}
            isLoading={isSaving}
            label={saveLabel}
            onClick={onSave}
            variant="primary"
          />
        </footer>
      </div>
    </div>
  );
}
