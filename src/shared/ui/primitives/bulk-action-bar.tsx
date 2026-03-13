import type { ReactNode } from "react";
import { AppButton } from "@/shared/ui/primitives/button";

interface AppBulkActionBarProps {
  selectedCount: number;
  selectedLabel?: string;
  clearLabel?: string;
  onClear?: () => void;
  actions?: ReactNode;
}

export function AppBulkActionBar({
  selectedCount,
  selectedLabel = "selected",
  clearLabel = "Clear selection",
  onClear,
  actions,
}: AppBulkActionBarProps) {
  if (selectedCount <= 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
      <span className="text-sm font-medium text-foreground">
        {selectedCount} {selectedLabel}
      </span>

      {onClear ? (
        <AppButton label={clearLabel} onClick={onClear} size="sm" variant="outline" />
      ) : null}

      {actions ? <div className="ml-auto flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
