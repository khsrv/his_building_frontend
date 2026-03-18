"use client";

import { useMemo } from "react";
import { format, isPast, isToday, parseISO, isValid } from "date-fns";
import { cn } from "@/shared/lib/ui/cn";
import { useI18n } from "@/shared/providers/locale-provider";

export type AppPaymentStatus = "paid" | "overdue" | "today" | "upcoming";

export interface AppPaymentInstallment {
  id: string;
  dueDate: string;
  amount: number;
  currency: string;
  status?: AppPaymentStatus;
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

const dotClass: Record<AppPaymentStatus, string> = {
  paid: "bg-success",
  overdue: "bg-danger",
  today: "bg-warning",
  upcoming: "bg-border",
};

const chipClass: Record<AppPaymentStatus, string> = {
  paid: "bg-success/15 text-success",
  overdue: "bg-danger/15 text-danger",
  today: "bg-warning/15 text-warning",
  upcoming: "bg-muted text-muted-foreground",
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
  const { t } = useI18n();

  const statusLabels: Record<AppPaymentStatus, string> = {
    paid: t("payment.status.paid"),
    overdue: t("payment.status.overdue"),
    today: t("payment.status.today"),
    upcoming: t("payment.status.upcoming"),
  };

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
    <div className={cn("rounded-xl border border-border bg-card p-4 shadow-sm", className)}>
      {title ? (
        <p className="mb-3 text-sm font-semibold text-foreground">{title}</p>
      ) : null}

      {showProgress && totalCount > 0 ? (
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {t("payment.paidCount")
                .replace("{paid}", String(paidCount))
                .replace("{total}", String(totalCount))}
            </span>
            <span className="text-xs font-medium text-foreground">{progressPct}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                progressPct === 100 ? "bg-success" : "bg-primary",
              )}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {formatAmount(paidAmount, currency, locale)}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatAmount(totalAmount, currency, locale)}
            </span>
          </div>
        </div>
      ) : null}

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute bottom-2 left-[9px] top-2 w-0.5 rounded bg-border" />

        <div className="space-y-0">
          {enriched.map((inst, idx) => {
            const status = inst.derivedStatus;
            const date = parseISO(inst.dueDate);
            const dateLabel = isValid(date) ? format(date, "dd.MM.yyyy") : inst.dueDate;
            const isClickable = Boolean(onInstallmentClick);

            return (
              <div
                className={cn(
                  "relative z-[1] flex items-start gap-3 rounded-lg px-0.5 py-2",
                  isClickable && "cursor-pointer hover:bg-muted/50 transition-colors",
                )}
                key={inst.id}
                onClick={() => onInstallmentClick?.(inst)}
              >
                {/* Dot */}
                <span
                  className={cn(
                    "mt-1 h-5 w-5 shrink-0 rounded-full border-2 border-card",
                    dotClass[status],
                  )}
                  style={{ boxShadow: "0 0 0 1px var(--color-border)" }}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-foreground">
                        {inst.label ?? t("payment.installment").replace("{n}", String(idx + 1))}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                          chipClass[status],
                        )}
                      >
                        {statusLabels[status]}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {formatAmount(inst.amount, inst.currency, locale)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{dateLabel}</span>
                    {inst.note ? (
                      <span className="max-w-[180px] truncate text-xs text-muted-foreground/60" title={inst.note}>
                        {inst.note}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
