"use client";

import { useMemo, useState } from "react";
import { Box, Chip, Paper, Popover, Stack, Tooltip, Typography } from "@mui/material";
import { cn } from "@/shared/lib/ui/cn";

export type AppColorGridCellStatus = "free" | "booked" | "sold" | "reserved" | "unavailable";

export interface AppColorGridCell {
  id: string;
  label: string;
  status: AppColorGridCellStatus;
  floor?: number;
  column?: number;
  tooltip?: string;
  popoverContent?: React.ReactNode;
  data?: Record<string, unknown>;
}

export interface AppColorGridRow {
  id: string;
  label: string;
  cells: readonly AppColorGridCell[];
}

interface StatusConfig {
  label: string;
  bg: string;
  border: string;
  text: string;
}

const STATUS_CONFIG: Record<AppColorGridCellStatus, StatusConfig> = {
  free: {
    label: "Свободна",
    bg: "bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:hover:bg-emerald-800/50",
    border: "border-emerald-300 dark:border-emerald-700",
    text: "text-emerald-800 dark:text-emerald-200",
  },
  booked: {
    label: "Бронь",
    bg: "bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-800/50",
    border: "border-amber-300 dark:border-amber-700",
    text: "text-amber-800 dark:text-amber-200",
  },
  sold: {
    label: "Продана",
    bg: "bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-800/50",
    border: "border-red-300 dark:border-red-700",
    text: "text-red-800 dark:text-red-200",
  },
  reserved: {
    label: "Резерв",
    bg: "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-700/60",
    border: "border-slate-300 dark:border-slate-600",
    text: "text-slate-600 dark:text-slate-400",
  },
  unavailable: {
    label: "Недоступна",
    bg: "bg-zinc-50 dark:bg-zinc-900/30",
    border: "border-dashed border-zinc-300 dark:border-zinc-700",
    text: "text-zinc-400 dark:text-zinc-600",
  },
};

interface AppColorGridProps {
  rows: readonly AppColorGridRow[];
  onCellClick?: (cell: AppColorGridCell) => void;
  filterStatuses?: readonly AppColorGridCellStatus[];
  showLegend?: boolean;
  cellSize?: "sm" | "md" | "lg";
  title?: string;
  className?: string;
}

const cellSizeClasses = {
  sm: "w-10 h-8 text-[10px]",
  md: "w-14 h-10 text-xs",
  lg: "w-18 h-12 text-sm",
};

export function AppColorGrid({
  rows,
  onCellClick,
  filterStatuses,
  showLegend = true,
  cellSize = "md",
  title,
  className,
}: AppColorGridProps) {
  const [popoverAnchor, setPopoverAnchor] = useState<{
    el: HTMLElement;
    cell: AppColorGridCell;
  } | null>(null);

  const filteredRows = useMemo(() => {
    if (!filterStatuses || filterStatuses.length === 0) {
      return rows;
    }
    return rows.map((row) => ({
      ...row,
      cells: row.cells.map((cell) =>
        filterStatuses.includes(cell.status) ? cell : { ...cell, status: "unavailable" as const },
      ),
    }));
  }, [rows, filterStatuses]);

  const stats = useMemo(() => {
    const all = rows.flatMap((r) => r.cells);
    const counts: Record<AppColorGridCellStatus, number> = {
      free: 0,
      booked: 0,
      sold: 0,
      reserved: 0,
      unavailable: 0,
    };
    for (const cell of all) {
      counts[cell.status] += 1;
    }
    return counts;
  }, [rows]);

  const handleCellClick = (cell: AppColorGridCell, el: HTMLElement) => {
    if (cell.status === "unavailable") {
      return;
    }
    if (cell.popoverContent) {
      setPopoverAnchor({ el, cell });
      return;
    }
    onCellClick?.(cell);
  };

  return (
    <Box className={className} sx={{ width: "100%", overflowX: "auto" }}>
      {title ? (
        <Typography sx={{ mb: 1.5, fontWeight: 600 }} variant="subtitle1">
          {title}
        </Typography>
      ) : null}

      {showLegend ? (
        <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mb: 1.5 }}>
          {(Object.entries(STATUS_CONFIG) as Array<[AppColorGridCellStatus, StatusConfig]>)
            .filter(([key]) => key !== "unavailable")
            .map(([status, cfg]) => (
              <Chip
                key={status}
                label={`${cfg.label} (${stats[status]})`}
                size="small"
                sx={{ fontSize: 11 }}
                variant="outlined"
              />
            ))}
        </Stack>
      ) : null}

      <Paper sx={{ p: 1, overflow: "auto" }} variant="outlined">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          {[...filteredRows].reverse().map((row) => (
            <Box key={row.id} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography
                sx={{ minWidth: 36, textAlign: "right", flexShrink: 0, color: "text.secondary" }}
                variant="caption"
              >
                {row.label}
              </Typography>
              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "nowrap" }}>
                {row.cells.map((cell) => {
                  const cfg = STATUS_CONFIG[cell.status];
                  return (
                    <Tooltip key={cell.id} title={cell.tooltip ?? cell.label}>
                      <button
                        className={cn(
                          "rounded border transition-colors cursor-pointer flex items-center justify-center flex-shrink-0 font-medium",
                          cellSizeClasses[cellSize],
                          cfg.bg,
                          cfg.border,
                          cfg.text,
                          cell.status === "unavailable" && "cursor-default",
                        )}
                        onClick={(e) => handleCellClick(cell, e.currentTarget)}
                        type="button"
                      >
                        {cell.label}
                      </button>
                    </Tooltip>
                  );
                })}
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Popover for cell detail */}
      <Popover
        anchorEl={popoverAnchor?.el}
        anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
        onClose={() => setPopoverAnchor(null)}
        open={Boolean(popoverAnchor)}
        transformOrigin={{ horizontal: "center", vertical: "top" }}
      >
        <Box sx={{ p: 2, minWidth: 220 }}>
          {popoverAnchor?.cell.popoverContent}
        </Box>
      </Popover>
    </Box>
  );
}
