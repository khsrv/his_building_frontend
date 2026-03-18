"use client";

import { useMemo } from "react";
import { cn } from "@/shared/lib/ui/cn";

export interface AppProgressSegment {
  id: string;
  label: string;
  value: number;
  color?: string;
  tooltip?: string;
}

type AppProgressBarSize = "sm" | "md" | "lg";

interface AppProgressBarProps {
  segments: readonly AppProgressSegment[];
  total?: number;
  showLegend?: boolean;
  showLabel?: boolean;
  size?: AppProgressBarSize;
  title?: string;
  className?: string;
  formatValue?: (value: number, total: number) => string;
}

const DEFAULT_COLORS = [
  "var(--color-primary)",
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-danger)",
  "var(--color-info)",
  "var(--color-secondary)",
];

const heightClass: Record<AppProgressBarSize, string> = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export function AppProgressBar({
  segments,
  total,
  showLegend = true,
  showLabel = false,
  size = "md",
  title,
  className,
  formatValue,
}: AppProgressBarProps) {
  const computedTotal = useMemo(
    () => total ?? segments.reduce((s, seg) => s + seg.value, 0),
    [total, segments],
  );

  const enriched = useMemo(
    () =>
      segments.map((seg, i) => ({
        ...seg,
        color: seg.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]!,
        pct: computedTotal > 0 ? (seg.value / computedTotal) * 100 : 0,
      })),
    [segments, computedTotal],
  );

  const filledPct = useMemo(
    () => enriched.reduce((s, seg) => s + seg.pct, 0),
    [enriched],
  );

  return (
    <div className={cn("space-y-1.5", className)}>
      {title ? (
        <p className="text-sm font-semibold text-foreground">{title}</p>
      ) : null}

      {/* Bar */}
      <div className={cn("w-full overflow-hidden rounded-full bg-muted", heightClass[size])}>
        <div className="flex h-full">
          {enriched.map((seg) => {
            const tooltipText =
              seg.tooltip ??
              (formatValue
                ? formatValue(seg.value, computedTotal)
                : `${seg.label}: ${seg.pct.toFixed(1)}%`);

            return (
              <div
                key={seg.id}
                style={{
                  width: `${seg.pct}%`,
                  backgroundColor: seg.color,
                  minWidth: seg.pct > 0 ? 2 : 0,
                  transition: "width 400ms cubic-bezier(0.4,0,0.2,1)",
                }}
                title={tooltipText}
              />
            );
          })}
        </div>
      </div>

      {showLabel ? (
        <p className="text-right text-xs text-muted-foreground">
          {filledPct.toFixed(0)}%
        </p>
      ) : null}

      {showLegend ? (
        <div className="flex flex-wrap items-center gap-3 pt-0.5">
          {enriched.map((seg) => (
            <div className="flex items-center gap-1.5" key={seg.id}>
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-xs text-muted-foreground">
                {seg.label}{" "}
                <span className="font-semibold text-foreground">
                  {seg.pct.toFixed(0)}%
                </span>
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
