import type { ReactNode } from "react";
import { AppButton } from "@/shared/ui/primitives/button";

export type AppStatePanelTone = "empty" | "error" | "no-access";

interface AppStatePanelProps {
  tone: AppStatePanelTone;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

function DefaultIcon({ tone }: { tone: AppStatePanelTone }) {
  if (tone === "error") {
    return <span className="text-2xl">⚠️</span>;
  }

  if (tone === "no-access") {
    return <span className="text-2xl">🔒</span>;
  }

  return <span className="text-2xl">📭</span>;
}

export function AppStatePanel({
  tone,
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: AppStatePanelProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
      <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        {icon ?? <DefaultIcon tone={tone} />}
      </div>
      <h3 className="pt-3 text-base font-semibold text-foreground">{title}</h3>
      {description ? <p className="mx-auto max-w-xl pt-1 text-sm text-muted-foreground">{description}</p> : null}
      {actionLabel && onAction ? (
        <div className="pt-4">
          <AppButton label={actionLabel} onClick={onAction} variant="outline" />
        </div>
      ) : null}
    </div>
  );
}
