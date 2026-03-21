"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Popover } from "@mui/material";
import { cn } from "@/shared/lib/ui/cn";
import { useI18n } from "@/shared/providers/locale-provider";

export type AppColorGridCellStatus = "free" | "booked" | "sold" | "reserved" | "unavailable";

export interface AppColorGridCell {
  id: string;
  label: string;
  sublabel?: string | undefined;
  secondarySublabel?: string | undefined;
  status: AppColorGridCellStatus;
  floor?: number;
  column?: number;
  tooltip?: string;
  popoverContent?: ReactNode;
  data?: Record<string, unknown>;
}

export interface AppColorGridRow {
  id: string;
  label: string;
  cells: readonly AppColorGridCell[];
}

interface StatusConfig {
  bg: string;
  text: string;
}

const STATUS_STYLE: Record<AppColorGridCellStatus, StatusConfig> = {
  free: { bg: "bg-success/15 hover:bg-success/25", text: "text-success" },
  booked: { bg: "bg-warning/15 hover:bg-warning/25", text: "text-warning" },
  sold: { bg: "bg-danger/15 hover:bg-danger/25", text: "text-danger" },
  reserved: { bg: "bg-muted hover:bg-muted/80", text: "text-muted-foreground" },
  unavailable: { bg: "bg-muted/40", text: "text-muted-foreground/50" },
};

interface AppColorGridProps {
  rows: readonly AppColorGridRow[];
  onCellClick?: (cell: AppColorGridCell) => void;
  onRowAddClick?: (row: AppColorGridRow) => void;
  filterStatuses?: readonly AppColorGridCellStatus[];
  showLegend?: boolean;
  cellSize?: "sm" | "md" | "lg" | "xl";
  title?: string;
  className?: string;
}

const cellSizeClasses = {
  sm: "w-10 h-8 text-[10px]",
  md: "w-14 h-10 text-xs",
  lg: "w-18 h-12 text-sm",
  xl: "w-20 h-16 text-xs",
};

type StatusKey = "free" | "booked" | "sold" | "reserved";

export function AppColorGrid({
  rows,
  onCellClick,
  onRowAddClick,
  filterStatuses,
  showLegend = true,
  cellSize = "md",
  title,
  className,
}: AppColorGridProps) {
  const { t } = useI18n();

  const [popoverAnchor, setPopoverAnchor] = useState<{
    el: HTMLElement;
    cell: AppColorGridCell;
  } | null>(null);

  const STATUS_LABELS: Record<AppColorGridCellStatus, string> = {
    free: t("grid.status.free"),
    booked: t("grid.status.booked"),
    sold: t("grid.status.sold"),
    reserved: t("grid.status.reserved"),
    unavailable: t("grid.status.unavailable"),
  };

  const filteredRows = useMemo(() => {
    if (!filterStatuses || filterStatuses.length === 0) return rows;
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
      free: 0, booked: 0, sold: 0, reserved: 0, unavailable: 0,
    };
    for (const cell of all) counts[cell.status] += 1;
    return counts;
  }, [rows]);

  const handleCellClick = (cell: AppColorGridCell, el: HTMLElement) => {
    if (cell.status === "unavailable") return;
    if (cell.popoverContent) {
      setPopoverAnchor({ el, cell });
      return;
    }
    onCellClick?.(cell);
  };

  const legendStatuses: readonly StatusKey[] = ["free", "booked", "sold", "reserved"];

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      {title ? (
        <p className="mb-2 text-sm font-semibold text-foreground">{title}</p>
      ) : null}

      {showLegend ? (
        <div className="mb-2 flex flex-wrap gap-2">
          {legendStatuses.map((status) => {
            const cfg = STATUS_STYLE[status];
            return (
              <span
                className={cn(
                  "inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs",
                  cfg.text,
                )}
                key={status}
              >
                {STATUS_LABELS[status]} ({stats[status]})
              </span>
            );
          })}
        </div>
      ) : null}

      <div className="overflow-auto rounded-xl border border-border bg-card p-2 shadow-sm">
        <div className="flex flex-col gap-1">
          {[...filteredRows].reverse().map((row) => (
            <div className="flex items-center gap-1" key={row.id}>
              <span className={cn(
                "shrink-0 text-right text-xs font-medium text-muted-foreground whitespace-nowrap",
                cellSize === "xl" ? "w-16" : "w-12",
              )}>
                {row.label}
              </span>
              <div className="flex flex-nowrap gap-1">
                {row.cells.map((cell) => {
                  const cfg = STATUS_STYLE[cell.status];
                  const hasSubContent = cellSize === "xl" && (cell.sublabel ?? cell.secondarySublabel);
                  return (
                    <button
                      className={cn(
                        "flex shrink-0 items-center justify-center rounded-lg border border-border font-medium transition-colors",
                        cellSizeClasses[cellSize],
                        cfg.bg,
                        cfg.text,
                        cell.status === "unavailable"
                          ? "cursor-default border-dashed"
                          : "cursor-pointer",
                        hasSubContent && "flex-col gap-0 px-1",
                      )}
                      key={cell.id}
                      onClick={(e) => handleCellClick(cell, e.currentTarget)}
                      title={cell.tooltip ?? cell.label}
                      type="button"
                    >
                      {hasSubContent ? (
                        <>
                          <span className="text-xs font-semibold leading-tight">{cell.label}</span>
                          <span className="text-[9px] leading-tight opacity-80">{cell.sublabel}</span>
                          {cell.secondarySublabel ? (
                            <span className="text-[9px] leading-tight opacity-60">{cell.secondarySublabel}</span>
                          ) : null}
                        </>
                      ) : (
                        cell.label
                      )}
                    </button>
                  );
                })}
                {onRowAddClick ? (
                  <button
                    className={cn(
                      "flex shrink-0 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer",
                      cellSize === "xl" ? "w-10 h-16" : cellSize === "lg" ? "w-10 h-12" : cellSize === "md" ? "w-10 h-10" : "w-8 h-8",
                    )}
                    onClick={() => onRowAddClick(row)}
                    title="Добавить квартиру"
                    type="button"
                  >
                    <svg aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Popover
        anchorEl={popoverAnchor?.el}
        anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
        onClose={() => setPopoverAnchor(null)}
        open={Boolean(popoverAnchor)}
        transformOrigin={{ horizontal: "center", vertical: "top" }}
      >
        <div className="min-w-[220px] rounded-xl border border-border bg-card p-3 shadow-sm">
          {popoverAnchor?.cell.popoverContent}
        </div>
      </Popover>
    </div>
  );
}
