"use client";

import { useEffect, useState } from "react";
import { differenceInSeconds, parseISO, isValid } from "date-fns";
import { cn } from "@/shared/lib/ui/cn";
import { useI18n } from "@/shared/providers/locale-provider";

export type AppCountdownVariant = "chip" | "inline" | "block";

interface AppCountdownBadgeProps {
  expiresAt: string;
  variant?: AppCountdownVariant;
  onExpire?: () => void;
  label?: string;
  className?: string;
  expiredLabel?: string;
}

function formatCountdown(totalSeconds: number): string {
  if (totalSeconds <= 0) return "0с";
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}д ${hours}ч`;
  if (hours > 0) return `${hours}ч ${minutes}м`;
  return `${minutes}м ${seconds}с`;
}

type Urgency = "expired" | "critical" | "warning" | "ok";

function getUrgency(seconds: number): Urgency {
  if (seconds <= 0) return "expired";
  if (seconds < 3600) return "critical";
  if (seconds < 86400) return "warning";
  return "ok";
}

const urgencyTextClass: Record<Urgency, string> = {
  expired: "text-muted-foreground",
  critical: "text-danger",
  warning: "text-warning",
  ok: "text-success",
};

const chipClass: Record<Urgency, string> = {
  expired: "border-border bg-muted text-muted-foreground",
  critical: "border-danger/30 bg-danger/15 text-danger",
  warning: "border-warning/30 bg-warning/15 text-warning",
  ok: "border-success/30 bg-success/15 text-success",
};

const blockClass: Record<Urgency, string> = {
  expired: "border-border bg-muted",
  critical: "border-danger/30 bg-danger/10",
  warning: "border-warning/30 bg-warning/10",
  ok: "border-success/30 bg-success/10",
};

export function AppCountdownBadge({
  expiresAt,
  variant = "chip",
  onExpire,
  label,
  className,
  expiredLabel,
}: AppCountdownBadgeProps) {
  const { t } = useI18n();

  const [remaining, setRemaining] = useState<number>(() => {
    const date = parseISO(expiresAt);
    if (!isValid(date)) return 0;
    return Math.max(0, differenceInSeconds(date, new Date()));
  });

  useEffect(() => {
    const date = parseISO(expiresAt);
    if (!isValid(date)) return;

    const tick = () => {
      const secs = Math.max(0, differenceInSeconds(date, new Date()));
      setRemaining(secs);
      if (secs === 0) onExpire?.();
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt, onExpire]);

  const isExpired = remaining <= 0;
  const displayText = isExpired
    ? (expiredLabel ?? t("countdown.expired"))
    : formatCountdown(remaining);
  const urgency = getUrgency(remaining);

  if (variant === "chip") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
          chipClass[urgency],
          className,
        )}
        title={label ?? t("countdown.tooltip")}
      >
        {label ? `${label}: ` : ""}
        {displayText}
      </span>
    );
  }

  if (variant === "block") {
    return (
      <div
        className={cn(
          "rounded-xl border p-3 text-center",
          blockClass[urgency],
          className,
        )}
      >
        {label ? (
          <p className="text-xs text-muted-foreground">{label}</p>
        ) : null}
        <p className={cn("text-xl font-bold tracking-tight", urgencyTextClass[urgency])}>
          {displayText}
        </p>
      </div>
    );
  }

  // inline
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {label ? (
        <span className="text-xs text-muted-foreground">{label}:</span>
      ) : null}
      <span className={cn("text-xs font-semibold", urgencyTextClass[urgency])}>
        {displayText}
      </span>
    </span>
  );
}
