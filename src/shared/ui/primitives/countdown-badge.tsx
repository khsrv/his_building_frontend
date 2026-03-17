"use client";

import { useEffect, useState } from "react";
import { Box, Chip, Tooltip, Typography } from "@mui/material";
import { differenceInSeconds, parseISO, isValid } from "date-fns";
import { cn } from "@/shared/lib/ui/cn";

export type AppCountdownVariant = "chip" | "inline" | "block";

interface AppCountdownBadgeProps {
  expiresAt: string; // ISO date string
  variant?: AppCountdownVariant;
  onExpire?: () => void;
  label?: string; // prefix label e.g. "Бронь до"
  className?: string;
  expiredLabel?: string;
}

function formatCountdown(totalSeconds: number): string {
  if (totalSeconds <= 0) return "0с";
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}д ${hours}ч`;
  }
  if (hours > 0) {
    return `${hours}ч ${minutes}м`;
  }
  return `${minutes}м ${seconds}с`;
}

function getUrgencyClass(seconds: number): string {
  if (seconds <= 0) return "text-zinc-400";
  if (seconds < 3600) return "text-red-600 dark:text-red-400"; // < 1 hour: urgent
  if (seconds < 86400) return "text-amber-600 dark:text-amber-400"; // < 1 day: warning
  return "text-emerald-600 dark:text-emerald-400"; // ok
}

function getChipColor(
  seconds: number,
): "default" | "error" | "warning" | "success" {
  if (seconds <= 0) return "default";
  if (seconds < 3600) return "error";
  if (seconds < 86400) return "warning";
  return "success";
}

export function AppCountdownBadge({
  expiresAt,
  variant = "chip",
  onExpire,
  label,
  className,
  expiredLabel = "Истекло",
}: AppCountdownBadgeProps) {
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
      if (secs === 0) {
        onExpire?.();
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt, onExpire]);

  const isExpired = remaining <= 0;
  const displayText = isExpired ? expiredLabel : formatCountdown(remaining);

  if (variant === "chip") {
    return (
      <Tooltip title={label ?? "Время брони"}>
        <Chip
          className={className}
          color={getChipColor(remaining)}
          label={
            <span>
              {label ? `${label}: ` : ""}
              {displayText}
            </span>
          }
          size="small"
          sx={{ fontSize: 11, fontWeight: 600 }}
        />
      </Tooltip>
    );
  }

  if (variant === "block") {
    return (
      <Box
        className={cn(
          "rounded-lg border px-3 py-2 text-center",
          isExpired
            ? "border-zinc-200 dark:border-zinc-700"
            : remaining < 3600
              ? "border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30"
              : remaining < 86400
                ? "border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30"
                : "border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30",
          className,
        )}
      >
        {label ? (
          <Typography color="text.secondary" sx={{ fontSize: 11, mb: 0.25 }}>
            {label}
          </Typography>
        ) : null}
        <Typography
          className={getUrgencyClass(remaining)}
          sx={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}
        >
          {displayText}
        </Typography>
      </Box>
    );
  }

  // inline
  return (
    <Box
      className={cn("inline-flex items-center gap-1", className)}
      component="span"
    >
      {label ? (
        <Typography color="text.secondary" component="span" sx={{ fontSize: 12 }}>
          {label}:
        </Typography>
      ) : null}
      <Typography
        className={getUrgencyClass(remaining)}
        component="span"
        sx={{ fontSize: 12, fontWeight: 600 }}
      >
        {displayText}
      </Typography>
    </Box>
  );
}
