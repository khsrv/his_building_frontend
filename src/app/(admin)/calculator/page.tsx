"use client";

import { useCallback, useMemo, useState } from "react";
import { TextField, Slider, ToggleButton, ToggleButtonGroup } from "@mui/material";
import {
  AppButton,
  AppCurrencyDisplay,
  AppMoneyInput,
  AppPageHeader,
  AppPaymentTimeline,
} from "@/shared/ui";
import type { AppPaymentInstallment } from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { addMonths, format } from "date-fns";

// ─── Types ──────────────────────────────────────────────────────────────────

type DownPaymentMode = "percent" | "amount";

interface CalcInput {
  area: number | null;
  pricePerSqm: number | null;
  downPaymentPercent: number;
  downPaymentAmount: number | null;
  downPaymentMode: DownPaymentMode;
  termMonths: number;
  currency: string;
  startDate: string; // YYYY-MM-DD
}

interface CalcResult {
  totalPrice: number;
  downPayment: number;
  financeAmount: number;
  monthlyPayment: number;
  installments: AppPaymentInstallment[];
}

// ─── Calculation ─────────────────────────────────────────────────────────────

function calculate(input: CalcInput): CalcResult | null {
  const { area, pricePerSqm, downPaymentPercent, downPaymentAmount, downPaymentMode, termMonths, currency, startDate } = input;

  if (!area || area <= 0 || !pricePerSqm || pricePerSqm <= 0 || termMonths <= 0) return null;

  const totalPrice = area * pricePerSqm;
  const downPayment =
    downPaymentMode === "percent"
      ? Math.round(totalPrice * (downPaymentPercent / 100))
      : Math.min(downPaymentAmount ?? 0, totalPrice);

  const financeAmount = totalPrice - downPayment;
  const monthlyPayment = termMonths > 0 ? Math.round(financeAmount / termMonths) : 0;

  const start = startDate ? new Date(startDate) : new Date();
  const installments: AppPaymentInstallment[] = [];

  // Down payment as first installment
  if (downPayment > 0) {
    installments.push({
      id: "dp",
      dueDate: format(start, "yyyy-MM-dd"),
      amount: downPayment,
      currency,
      label: "Предоплата",
      status: "upcoming",
    });
  }

  // Monthly installments
  for (let i = 1; i <= termMonths; i++) {
    const dueDate = addMonths(start, i);
    const isLast = i === termMonths;
    // Adjust last payment for rounding
    const amount = isLast ? financeAmount - monthlyPayment * (termMonths - 1) : monthlyPayment;
    installments.push({
      id: `m-${i}`,
      dueDate: format(dueDate, "yyyy-MM-dd"),
      amount,
      currency,
      label: `Взнос ${i}`,
      status: "upcoming",
    });
  }

  return { totalPrice, downPayment, financeAmount, monthlyPayment, installments };
}

// ─── Format helpers ──────────────────────────────────────────────────────────

function fmtMoney(value: number, currency: string): string {
  return (
    new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value) +
    " " +
    currency
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

const TERM_MARKS = [3, 6, 12, 18, 24, 36, 48, 60].map((v) => ({ value: v, label: `${v}` }));

export default function CalculatorPage() {
  const [input, setInput] = useState<CalcInput>({
    area: null,
    pricePerSqm: null,
    downPaymentPercent: 30,
    downPaymentAmount: null,
    downPaymentMode: "percent",
    termMonths: 12,
    currency: "USD",
    startDate: format(new Date(), "yyyy-MM-dd"),
  });

  const update = useCallback(<K extends keyof CalcInput>(key: K, value: CalcInput[K]) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  }, []);

  const result = useMemo(() => calculate(input), [input]);

  return (
    <main className="space-y-6 p-6">
      <AppPageHeader
        title="Калькулятор рассрочки"
        subtitle="Рассчитайте график платежей для клиента"
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "calculator", label: "Калькулятор" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ─── Input form ─── */}
        <div className="space-y-5 rounded-xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold">Параметры</h2>

          {/* Area */}
          <TextField
            label="Площадь квартиры (м²)"
            type="number"
            size="small"
            fullWidth
            value={input.area ?? ""}
            onChange={(e) => update("area", e.target.value ? Number(e.target.value) : null)}
            slotProps={{ htmlInput: { min: 1, step: 0.1 } }}
          />

          {/* Price per sqm */}
          <AppMoneyInput
            label="Цена за м²"
            value={input.pricePerSqm}
            currency={input.currency}
            onChangeValue={(v) => update("pricePerSqm", v)}
            onChangeCurrency={(c) => update("currency", c)}
            size="small"
            fullWidth
          />

          {/* Total price display */}
          {input.area && input.pricePerSqm ? (
            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
              <span className="text-sm text-muted-foreground">Общая стоимость</span>
              <span className="text-lg font-bold">
                <AppCurrencyDisplay amount={input.area * input.pricePerSqm} currency={input.currency} />
              </span>
            </div>
          ) : null}

          {/* Down payment mode toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Предоплата</span>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={input.downPaymentMode}
                onChange={(_, v: DownPaymentMode | null) => {
                  if (v) update("downPaymentMode", v);
                }}
              >
                <ToggleButton value="percent">%</ToggleButton>
                <ToggleButton value="amount">$</ToggleButton>
              </ToggleButtonGroup>
            </div>

            {input.downPaymentMode === "percent" ? (
              <div className="space-y-1">
                <Slider
                  value={input.downPaymentPercent}
                  onChange={(_, v) => update("downPaymentPercent", v as number)}
                  min={0}
                  max={90}
                  step={5}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(v) => `${v}%`}
                  marks={[
                    { value: 0, label: "0%" },
                    { value: 30, label: "30%" },
                    { value: 50, label: "50%" },
                    { value: 90, label: "90%" },
                  ]}
                />
                {result ? (
                  <p className="text-sm text-muted-foreground">
                    Предоплата: {fmtMoney(result.downPayment, input.currency)}
                  </p>
                ) : null}
              </div>
            ) : (
              <AppMoneyInput
                label="Сумма предоплаты"
                value={input.downPaymentAmount}
                currency={input.currency}
                onChangeValue={(v) => update("downPaymentAmount", v)}
                size="small"
                fullWidth
              />
            )}
          </div>

          {/* Term */}
          <div className="space-y-2">
            <span className="text-sm font-medium">Срок рассрочки (месяцев): {input.termMonths}</span>
            <Slider
              value={input.termMonths}
              onChange={(_, v) => update("termMonths", v as number)}
              min={1}
              max={60}
              step={1}
              valueLabelDisplay="auto"
              marks={TERM_MARKS}
            />
          </div>

          {/* Start date */}
          <TextField
            label="Дата первого платежа"
            type="date"
            size="small"
            fullWidth
            value={input.startDate}
            onChange={(e) => update("startDate", e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </div>

        {/* ─── Results ─── */}
        <div className="space-y-5">
          {result ? (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-4">
                <SummaryCard label="Общая стоимость" value={fmtMoney(result.totalPrice, input.currency)} />
                <SummaryCard label="Предоплата" value={fmtMoney(result.downPayment, input.currency)} accent="blue" />
                <SummaryCard label="Сумма рассрочки" value={fmtMoney(result.financeAmount, input.currency)} accent="amber" />
                <SummaryCard label="Ежемесячный платёж" value={fmtMoney(result.monthlyPayment, input.currency)} accent="emerald" />
              </div>

              {/* Extra info */}
              <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                <p>Количество платежей: <strong>{input.termMonths}</strong></p>
                <p>Период: с <strong>{format(new Date(input.startDate), "dd.MM.yyyy")}</strong> по{" "}
                  <strong>{format(addMonths(new Date(input.startDate), input.termMonths), "dd.MM.yyyy")}</strong>
                </p>
              </div>

              {/* Payment timeline */}
              <div className="rounded-xl border border-border bg-card p-4">
                <AppPaymentTimeline
                  title="График платежей"
                  installments={result.installments}
                  showProgress
                />
              </div>
            </>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border text-muted-foreground">
              Заполните параметры слева для расчёта графика платежей
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// ─── Small summary card ──────────────────────────────────────────────────────

function SummaryCard({ label, value, accent }: { label: string; value: string; accent?: "blue" | "amber" | "emerald" }) {
  const border = accent === "blue"
    ? "border-blue-200 dark:border-blue-800"
    : accent === "amber"
      ? "border-amber-200 dark:border-amber-800"
      : accent === "emerald"
        ? "border-emerald-200 dark:border-emerald-800"
        : "border-border";

  return (
    <div className={`rounded-xl border ${border} bg-card p-4`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}
