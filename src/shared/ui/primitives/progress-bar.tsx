"use client";

import { useMemo } from "react";
import { Box, Stack, Tooltip, Typography } from "@mui/material";

export interface AppProgressSegment {
  id: string;
  label: string;
  value: number; // absolute value (e.g. units count or percentage points)
  color?: string; // CSS color string
  tooltip?: string;
}

type AppProgressBarSize = "sm" | "md" | "lg";

interface AppProgressBarProps {
  segments: readonly AppProgressSegment[];
  total?: number; // if omitted, derived as sum of segment values
  showLegend?: boolean;
  showLabel?: boolean; // show overall % inside/above bar
  size?: AppProgressBarSize;
  title?: string;
  className?: string;
  formatValue?: (value: number, total: number) => string;
}

const DEFAULT_COLORS = [
  "#2563eb",
  "#16a34a",
  "#d97706",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
];

const SIZE_PX: Record<AppProgressBarSize, number> = {
  sm: 8,
  md: 14,
  lg: 20,
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

  const heightPx = SIZE_PX[size];

  return (
    <Box className={className}>
      {title ? (
        <Typography sx={{ mb: 0.75, fontWeight: 600, fontSize: 13 }} variant="subtitle2">
          {title}
        </Typography>
      ) : null}

      {/* Bar */}
      <Box
        sx={{
          width: "100%",
          height: heightPx,
          borderRadius: heightPx / 2,
          bgcolor: "action.disabledBackground",
          overflow: "hidden",
          display: "flex",
        }}
      >
        {enriched.map((seg, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === enriched.length - 1;
          const tooltipText =
            seg.tooltip ??
            (formatValue
              ? formatValue(seg.value, computedTotal)
              : `${seg.label}: ${seg.pct.toFixed(1)}%`);

          return (
            <Tooltip key={seg.id} title={tooltipText}>
              <Box
                sx={{
                  width: `${seg.pct}%`,
                  bgcolor: seg.color,
                  flexShrink: 0,
                  borderRadius:
                    isFirst && isLast
                      ? `${heightPx / 2}px`
                      : isFirst
                        ? `${heightPx / 2}px 0 0 ${heightPx / 2}px`
                        : isLast
                          ? `0 ${heightPx / 2}px ${heightPx / 2}px 0`
                          : 0,
                  transition: "width 400ms cubic-bezier(0.4,0,0.2,1)",
                  minWidth: seg.pct > 0 ? 2 : 0,
                }}
              />
            </Tooltip>
          );
        })}
      </Box>

      {showLabel ? (
        <Typography
          color="text.secondary"
          sx={{ fontSize: 11, mt: 0.25, textAlign: "right" }}
        >
          {filledPct.toFixed(0)}%
        </Typography>
      ) : null}

      {showLegend ? (
        <Stack direction="row" flexWrap="wrap" gap={1.25} sx={{ mt: 1 }}>
          {enriched.map((seg) => (
            <Stack alignItems="center" direction="row" gap={0.5} key={seg.id}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: seg.color,
                  flexShrink: 0,
                }}
              />
              <Typography color="text.secondary" sx={{ fontSize: 11 }}>
                {seg.label}
                {" "}
                <Typography
                  component="span"
                  sx={{ fontSize: 11, fontWeight: 600, color: "text.primary" }}
                >
                  {seg.pct.toFixed(0)}%
                </Typography>
              </Typography>
            </Stack>
          ))}
        </Stack>
      ) : null}
    </Box>
  );
}
