"use client";

import { useMemo } from "react";
import {
  Box,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { format, isPast, isToday, isFuture, parseISO, isValid } from "date-fns";
import { cn } from "@/shared/lib/ui/cn";

export type AppPaymentStatus = "paid" | "overdue" | "upcoming" | "today";

export interface AppPaymentInstallment {
  id: string;
  dueDate: string; // ISO date string
  amount: number;
  currency: string;
  status?: AppPaymentStatus; // if not provided, derived from dueDate
  label?: string;
  note?: string;
}

interface AppPaymentTimelineProps {
  installments: readonly AppPaymentInstallment[];
  locale?: string;
  title?: string;
  showProgress?: boolean;
  className?: string;
  onInstallmentClick?: (installment: AppPaymentInstallment) => void;
}

function deriveStatus(dueDate: string, explicit?: AppPaymentStatus): AppPaymentStatus {
  if (explicit) return explicit;
  const date = parseISO(dueDate);
  if (!isValid(date)) return "upcoming";
  if (isToday(date)) return "today";
  if (isPast(date)) return "overdue";
  return "upcoming";
}

const STATUS_CONFIG: Record<
  AppPaymentStatus,
  { label: string; chipColor: "success" | "error" | "warning" | "default"; dotClass: string }
> = {
  paid: {
    label: "Оплачено",
    chipColor: "success",
    dotClass: "bg-emerald-500",
  },
  overdue: {
    label: "Просрочено",
    chipColor: "error",
    dotClass: "bg-red-500",
  },
  today: {
    label: "Сегодня",
    chipColor: "warning",
    dotClass: "bg-amber-500",
  },
  upcoming: {
    label: "Предстоит",
    chipColor: "default",
    dotClass: "bg-slate-300 dark:bg-slate-600",
  },
};

function formatAmount(amount: number, currency: string, locale: string): string {
  return (
    new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) +
    " " +
    currency
  );
}

export function AppPaymentTimeline({
  installments,
  locale = "ru-RU",
  title,
  showProgress = true,
  className,
  onInstallmentClick,
}: AppPaymentTimelineProps) {
  const enriched = useMemo(
    () =>
      installments.map((inst) => ({
        ...inst,
        derivedStatus: deriveStatus(inst.dueDate, inst.status),
      })),
    [installments],
  );

  const paidCount = enriched.filter((i) => i.derivedStatus === "paid").length;
  const totalCount = enriched.length;
  const progressPct = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;

  const totalAmount = useMemo(
    () => enriched.reduce((sum, i) => sum + i.amount, 0),
    [enriched],
  );
  const paidAmount = useMemo(
    () =>
      enriched
        .filter((i) => i.derivedStatus === "paid")
        .reduce((sum, i) => sum + i.amount, 0),
    [enriched],
  );
  const currency = enriched[0]?.currency ?? "";

  return (
    <Paper className={className} sx={{ p: 2 }} variant="outlined">
      {title ? (
        <Typography sx={{ mb: 1.5, fontWeight: 600 }} variant="subtitle2">
          {title}
        </Typography>
      ) : null}

      {showProgress && totalCount > 0 ? (
        <Box sx={{ mb: 2 }}>
          <Stack
            alignItems="center"
            direction="row"
            justifyContent="space-between"
            sx={{ mb: 0.5 }}
          >
            <Typography color="text.secondary" variant="caption">
              Оплачено {paidCount} из {totalCount} взносов
            </Typography>
            <Typography variant="caption">{progressPct}%</Typography>
          </Stack>
          <LinearProgress
            color={progressPct === 100 ? "success" : "primary"}
            sx={{ borderRadius: 4, height: 6 }}
            value={progressPct}
            variant="determinate"
          />
          <Stack
            alignItems="center"
            direction="row"
            justifyContent="space-between"
            sx={{ mt: 0.5 }}
          >
            <Typography color="text.secondary" variant="caption">
              {formatAmount(paidAmount, currency, locale)}
            </Typography>
            <Typography color="text.secondary" variant="caption">
              {formatAmount(totalAmount, currency, locale)}
            </Typography>
          </Stack>
        </Box>
      ) : null}

      <Box sx={{ position: "relative" }}>
        {/* Vertical line */}
        <Box
          sx={{
            position: "absolute",
            left: 9,
            top: 8,
            bottom: 8,
            width: 2,
            bgcolor: "divider",
            borderRadius: 1,
          }}
        />

        <Stack gap={0}>
          {enriched.map((inst, idx) => {
            const cfg = STATUS_CONFIG[inst.derivedStatus];
            const date = parseISO(inst.dueDate);
            const dateLabel = isValid(date) ? format(date, "dd.MM.yyyy") : inst.dueDate;
            const isClickable = Boolean(onInstallmentClick);

            return (
              <Box
                key={inst.id}
                onClick={() => onInstallmentClick?.(inst)}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1.5,
                  py: 0.75,
                  pl: 0.25,
                  cursor: isClickable ? "pointer" : "default",
                  borderRadius: 1.5,
                  "&:hover": isClickable
                    ? { bgcolor: "action.hover" }
                    : undefined,
                  transition: "background-color 120ms ease",
                  zIndex: 1,
                  position: "relative",
                }}
              >
                {/* Timeline dot */}
                <Box
                  className={cn(
                    "w-5 h-5 rounded-full border-2 border-white dark:border-gray-900 flex-shrink-0 mt-0.5",
                    cfg.dotClass,
                  )}
                  sx={{ boxShadow: "0 0 0 1px rgba(0,0,0,0.08)" }}
                />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack
                    alignItems="center"
                    direction="row"
                    flexWrap="wrap"
                    gap={0.75}
                    justifyContent="space-between"
                  >
                    <Stack alignItems="center" direction="row" gap={0.75}>
                      <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                        {inst.label ?? `Взнос ${idx + 1}`}
                      </Typography>
                      <Chip
                        color={cfg.chipColor}
                        label={cfg.label}
                        size="small"
                        sx={{ fontSize: 10, height: 18 }}
                      />
                    </Stack>
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                      {formatAmount(inst.amount, inst.currency, locale)}
                    </Typography>
                  </Stack>

                  <Stack alignItems="center" direction="row" gap={1}>
                    <Typography color="text.secondary" sx={{ fontSize: 11 }}>
                      {dateLabel}
                    </Typography>
                    {inst.note ? (
                      <Tooltip title={inst.note}>
                        <Typography
                          color="text.disabled"
                          noWrap
                          sx={{ fontSize: 11, maxWidth: 180 }}
                        >
                          {inst.note}
                        </Typography>
                      </Tooltip>
                    ) : null}
                  </Stack>
                </Box>
              </Box>
            );
          })}
        </Stack>
      </Box>
    </Paper>
  );
}
