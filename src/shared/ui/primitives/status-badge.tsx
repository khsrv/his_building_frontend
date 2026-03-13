import { cn } from "@/shared/lib/ui/cn";

export type AppStatusTone =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "muted";

interface AppStatusBadgeProps {
  label: string;
  tone?: AppStatusTone;
  outlined?: boolean;
  className?: string;
}

const toneClassMap: Record<AppStatusTone, string> = {
  default: "bg-primary/15 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/20 text-warning",
  danger: "bg-danger/15 text-danger",
  info: "bg-info/15 text-info",
  muted: "bg-muted text-muted-foreground",
};

export function AppStatusBadge({
  label,
  tone = "default",
  outlined = false,
  className,
}: AppStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        toneClassMap[tone],
        outlined && "border border-current/30 bg-transparent",
        className,
      )}
    >
      {label}
    </span>
  );
}
