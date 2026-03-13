"use client";

import type { ReactNode } from "react";
import { AppButton } from "@/shared/ui/primitives/button";
import { AppCard } from "@/shared/ui/primitives/card";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  icon?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  icon,
  confirmText = "Confirm",
  cancelText = "Cancel",
  destructive = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <AppCard className="w-full max-w-md" density="regular" variant="outlined">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            {icon ? <div className="mt-0.5">{icon}</div> : null}
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <AppButton label={cancelText} onClick={onClose} variant="outline" />
            <AppButton
              label={confirmText}
              onClick={onConfirm}
              variant={destructive ? "destructive" : "primary"}
            />
          </div>
        </div>
      </AppCard>
    </div>
  );
}
