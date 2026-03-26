"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Paper } from "@mui/material";
import {
  AppPageHeader,
  AppStepWizard,
  type AppStepWizardStep,
  AppSearchableSelect,
  type AppSearchableSelectOption,
  AppSelect,
  AppInput,
  AppStatusBadge,
} from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { useCreateDealMutation } from "@/modules/deals/presentation/hooks/use-create-deal-mutation";
import { usePropertiesQuery } from "@/modules/deals/presentation/hooks/use-properties-query";
import { useAvailableUnitsQuery } from "@/modules/deals/presentation/hooks/use-available-units-query";
import { useClientSearchQuery } from "@/modules/deals/presentation/hooks/use-client-search-query";
import type { DealPaymentType } from "@/modules/deals/domain/deal";
import { useCurrencyOptions } from "@/modules/finance/presentation/hooks/use-currency-options";
import { usePropertyContext } from "@/shared/providers/property-provider";

// ─── Constants ──────────────────────────────────────────────────────────────

const PAYMENT_TYPE_OPTIONS: readonly { value: DealPaymentType; label: string }[] = [
  { value: "full_payment", label: "Полная оплата" },
  { value: "installment", label: "Рассрочка" },
  { value: "mortgage", label: "Ипотека" },
  { value: "barter", label: "Бартер" },
  { value: "combined", label: "Комбинированная" },
];

const INSTALLMENT_MONTH_OPTIONS: readonly { value: string; label: string }[] = [
  { value: "6", label: "6 месяцев" },
  { value: "12", label: "12 месяцев" },
  { value: "24", label: "24 месяца" },
  { value: "36", label: "36 месяцев" },
  { value: "48", label: "48 месяцев" },
  { value: "60", label: "60 месяцев" },
];

const INSTALLMENT_FREQUENCY_OPTIONS: readonly { value: string; label: string }[] = [
  { value: "monthly", label: "Ежемесячно" },
  { value: "quarterly", label: "Ежеквартально" },
  { value: "custom", label: "Произвольно" },
];

function formatMoney(amount: number, currency: string): string {
  return (
    new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount) +
    " " +
    currency
  );
}

// ─── Form state ─────────────────────────────────────────────────────────────

interface FormState {
  clientId: string;
  clientLabel: string;
  propertyId: string;
  unitId: string;
  paymentType: DealPaymentType;
  totalAmount: string;
  currency: string;
  downPayment: string;
  installmentMonths: string;
  installmentFrequency: string;
  mortgageBank: string;
  mortgageRate: string;
  notes: string;
}

interface FormErrors {
  clientId?: string;
  unitId?: string;
  propertyId?: string;
  totalAmount?: string;
  installmentMonths?: string;
  installmentFrequency?: string;
  mortgageBank?: string;
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function DealCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currencyOptions = useCurrencyOptions();
  const { currentPropertyId } = usePropertyContext();

  // Pre-fill from query params (e.g. from chess grid or unit detail)
  const prefillPropertyId = searchParams.get("propertyId") || currentPropertyId;
  const prefillUnitId = searchParams.get("unitId") || "";

  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    clientId: "",
    clientLabel: "",
    propertyId: prefillPropertyId,
    unitId: prefillUnitId,
    paymentType: "full_payment",
    totalAmount: "",
    currency: "USD",
    downPayment: "",
    installmentMonths: "",
    installmentFrequency: "monthly",
    mortgageBank: "",
    mortgageRate: "",
    notes: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [clientSearch, setClientSearch] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { mutateAsync: createDeal, isPending } = useCreateDealMutation();
  const { data: properties = [], isLoading: propertiesLoading } = usePropertiesQuery();
  const { data: units = [], isLoading: unitsLoading } = useAvailableUnitsQuery(form.propertyId);
  const { data: clients = [], isFetching: clientsSearching } = useClientSearchQuery(clientSearch);

  // Auto-fill totalAmount from pre-selected unit when units data loads
  const [priceAutoFilled, setPriceAutoFilled] = useState(false);
  if (prefillUnitId && units.length > 0 && !priceAutoFilled && !form.totalAmount) {
    const prefillUnit = units.find((u) => u.id === prefillUnitId);
    if (prefillUnit?.basePrice) {
      setForm((prev) => ({ ...prev, totalAmount: String(prefillUnit.basePrice) }));
      setPriceAutoFilled(true);
    }
  }

  const setField = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      if (key in errors) {
        setErrors((prev) => { const n = { ...prev }; delete n[key as keyof FormErrors]; return n; });
      }
    },
    [errors],
  );

  // ── Options ─────────────────────────────────────────────────────────────

  const propertyOptions = useMemo(
    () => properties.map((p) => ({ value: p.id, label: p.name })),
    [properties],
  );

  const unitOptions = useMemo(
    () =>
      units.map((u) => ({
        value: u.id,
        label: `Кв. ${u.unitNumber}${u.rooms ? `, ${u.rooms}к` : ""}${u.totalArea ? `, ${u.totalArea} м²` : ""}${u.basePrice ? ` — ${formatMoney(u.basePrice, "USD")}` : ""}`,
      })),
    [units],
  );

  const clientOptions: AppSearchableSelectOption[] = useMemo(
    () => clients.map((c) => ({ id: c.id, label: c.fullName, secondary: c.phone })),
    [clients],
  );

  // ── Calculations ────────────────────────────────────────────────────────

  const totalAmountNum = parseFloat(form.totalAmount) || 0;
  const downPaymentNum = parseFloat(form.downPayment) || 0;
  const remaining = Math.max(0, totalAmountNum - downPaymentNum);
  const installmentMonthsNum = parseInt(form.installmentMonths, 10) || 0;
  const monthlyPayment = installmentMonthsNum > 0 ? remaining / installmentMonthsNum : null;

  // Auto-fill totalAmount from unit price
  const handleUnitChange = useCallback(
    (unitId: string) => {
      setField("unitId", unitId);
      const unit = units.find((u) => u.id === unitId);
      if (unit?.basePrice && !form.totalAmount) {
        setField("totalAmount", String(unit.basePrice));
      }
    },
    [units, form.totalAmount, setField],
  );

  // ── Validation ──────────────────────────────────────────────────────────

  const validateStep1 = (): boolean => {
    const next: FormErrors = {};
    if (!form.clientId) next.clientId = "Выберите клиента";
    if (!form.propertyId) next.propertyId = "Выберите объект";
    if (!form.unitId) next.unitId = "Выберите квартиру";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep2 = (): boolean => {
    const next: FormErrors = {};
    if (!form.totalAmount || totalAmountNum <= 0) {
      next.totalAmount = "Введите сумму больше 0";
    }
    if (form.paymentType === "installment") {
      if (!form.installmentMonths) next.installmentMonths = "Укажите срок рассрочки";
      if (!form.installmentFrequency) next.installmentFrequency = "Выберите периодичность";
    }
    if (form.paymentType === "mortgage") {
      if (!form.mortgageBank.trim()) next.mortgageBank = "Укажите банк";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setSubmitError(null);

    const input: Parameters<typeof createDeal>[0] = {
      clientId: form.clientId,
      unitId: form.unitId,
      paymentType: form.paymentType,
      totalAmount: totalAmountNum,
      currency: form.currency,
    };
    if (downPaymentNum > 0) input.downPayment = downPaymentNum;
    if (installmentMonthsNum > 0) input.installmentMonths = installmentMonthsNum;
    if (form.paymentType === "installment" && form.installmentFrequency) {
      input.installmentFrequency = form.installmentFrequency as "monthly" | "quarterly" | "custom";
    }
    if (form.mortgageBank) input.mortgageBank = form.mortgageBank;
    if (form.mortgageRate) input.mortgageRate = parseFloat(form.mortgageRate);
    if (form.notes) input.notes = form.notes;

    try {
      const deal = await createDeal(input);
      router.push(routes.dealDetail(deal.id));
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Ошибка создания сделки");
    }
  };

  // ─── Step 1: Client & Unit ────────────────────────────────────────────

  const selectedUnit = units.find((u) => u.id === form.unitId);

  const step1Content = (
    <div className="space-y-6">
      {/* Client */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">Клиент *</label>
        <AppSearchableSelect
          options={clientOptions}
          value={form.clientId || null}
          onChange={(id, option) => { setField("clientId", id); setField("clientLabel", option.label); }}
          triggerLabel={form.clientLabel || "Найти клиента по имени или телефону..."}
          dialogTitle="Поиск клиента"
          searchPlaceholder="Имя или телефон..."
          loading={clientsSearching}
          emptyLabel={clientSearch.length < 2 ? "Введите минимум 2 символа" : "Клиент не найден"}
          filterFn={(_option, query) => { setClientSearch(query); return true; }}
        />
        {errors.clientId && <p className="text-xs text-red-500">{errors.clientId}</p>}
      </div>

      {/* Property */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">Объект (ЖК) *</label>
        <AppSelect
          id="deal-property"
          label="Выберите объект"
          options={[{ value: "", label: propertiesLoading ? "Загрузка..." : "— Выберите ЖК —" }, ...propertyOptions]}
          value={form.propertyId}
          onChange={(e) => { setField("propertyId", e.target.value); setField("unitId", ""); setField("totalAmount", ""); }}
        />
        {errors.propertyId && <p className="text-xs text-red-500">{errors.propertyId}</p>}
      </div>

      {/* Unit */}
      {form.propertyId && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Квартира *</label>
          <AppSelect
            id="deal-unit"
            label="Выберите квартиру"
            options={[{ value: "", label: unitsLoading ? "Загрузка..." : `— ${units.length} свободных квартир —` }, ...unitOptions]}
            value={form.unitId}
            onChange={(e) => handleUnitChange(e.target.value)}
          />
          {errors.unitId && <p className="text-xs text-red-500">{errors.unitId}</p>}

          {/* Unit info card */}
          {selectedUnit && (
            <div className="mt-3 rounded-lg border border-border bg-muted/30 p-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">Квартира</p>
                  <p className="text-sm font-semibold">№ {selectedUnit.unitNumber}</p>
                </div>
                {selectedUnit.rooms ? (
                  <div>
                    <p className="text-xs text-muted-foreground">Комнат</p>
                    <p className="text-sm font-semibold">{selectedUnit.rooms}</p>
                  </div>
                ) : null}
                {selectedUnit.totalArea ? (
                  <div>
                    <p className="text-xs text-muted-foreground">Площадь</p>
                    <p className="text-sm font-semibold">{selectedUnit.totalArea} м²</p>
                  </div>
                ) : null}
                {selectedUnit.basePrice ? (
                  <div>
                    <p className="text-xs text-muted-foreground">Цена</p>
                    <p className="text-sm font-bold text-primary">{formatMoney(selectedUnit.basePrice, "USD")}</p>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ─── Step 2: Payment ──────────────────────────────────────────────────

  const step2Content = (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">Тип оплаты</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {PAYMENT_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setField("paymentType", opt.value)}
              className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                form.paymentType === opt.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-foreground hover:border-primary/50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AppInput
          label="Общая сумма *"
          type="number"
          value={form.totalAmount}
          onChangeValue={(v) => setField("totalAmount", v)}
          placeholder="0"
          {...(errors.totalAmount ? { errorText: errors.totalAmount } : {})}
        />
        <AppSelect
          id="deal-currency"
          label="Валюта"
          options={currencyOptions}
          value={form.currency}
          onChange={(e) => setField("currency", e.target.value)}
        />
      </div>

      {/* Installment */}
      {form.paymentType === "installment" && (
        <div className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-5">
          <p className="text-sm font-bold text-foreground">Параметры рассрочки</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <AppInput
              label="Первоначальный взнос"
              type="number"
              value={form.downPayment}
              onChangeValue={(v) => setField("downPayment", v)}
              placeholder="0"
            />
            <AppSelect
              id="deal-installment-months"
              label="Срок *"
              options={[{ value: "", label: "— Срок —" }, ...INSTALLMENT_MONTH_OPTIONS]}
              value={form.installmentMonths}
              onChange={(e) => setField("installmentMonths", e.target.value)}
              {...(errors.installmentMonths ? { errorText: errors.installmentMonths } : {})}
            />
            <AppSelect
              id="deal-installment-freq"
              label="Периодичность *"
              options={[{ value: "", label: "— Выберите —" }, ...INSTALLMENT_FREQUENCY_OPTIONS]}
              value={form.installmentFrequency}
              onChange={(e) => setField("installmentFrequency", e.target.value)}
              {...(errors.installmentFrequency ? { errorText: errors.installmentFrequency } : {})}
            />
          </div>
          {/* Live calculation */}
          <div className="flex flex-wrap gap-6 rounded-lg bg-card p-4">
            <div>
              <p className="text-xs text-muted-foreground">Остаток</p>
              <p className="text-lg font-bold text-foreground">{formatMoney(remaining, form.currency)}</p>
            </div>
            {monthlyPayment !== null && (
              <div>
                <p className="text-xs text-muted-foreground">Ежемесячный платёж</p>
                <p className="text-lg font-bold text-primary">{formatMoney(monthlyPayment, form.currency)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mortgage */}
      {form.paymentType === "mortgage" && (
        <div className="space-y-4 rounded-xl border border-blue-200 bg-blue-50/50 p-5 dark:border-blue-800 dark:bg-blue-900/20">
          <p className="text-sm font-bold text-foreground">Параметры ипотеки</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <AppInput
              label="Первоначальный взнос"
              type="number"
              value={form.downPayment}
              onChangeValue={(v) => setField("downPayment", v)}
              placeholder="0"
            />
            <AppInput
              label="Банк *"
              value={form.mortgageBank}
              onChangeValue={(v) => setField("mortgageBank", v)}
              placeholder="Название банка"
              {...(errors.mortgageBank ? { errorText: errors.mortgageBank } : {})}
            />
            <AppInput
              label="Ставка (%)"
              type="number"
              value={form.mortgageRate}
              onChangeValue={(v) => setField("mortgageRate", v)}
              placeholder="0"
            />
          </div>
        </div>
      )}

      <AppInput
        label="Примечание"
        value={form.notes}
        onChangeValue={(v) => setField("notes", v)}
        placeholder="Дополнительная информация..."
      />
    </div>
  );

  // ─── Step 3: Confirmation ─────────────────────────────────────────────

  const selectedPropertyName = properties.find((p) => p.id === form.propertyId)?.name ?? "—";
  const selectedUnitLabel = unitOptions.find((u) => u.value === form.unitId)?.label ?? "—";
  const selectedPaymentLabel = PAYMENT_TYPE_OPTIONS.find((p) => p.value === form.paymentType)?.label ?? "—";

  const step3Content = (
    <div className="space-y-5">
      {submitError && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {submitError}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-5 text-lg font-bold text-foreground">Итого по сделке</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryItem label="Клиент" value={form.clientLabel || "—"} />
          <SummaryItem label="Объект" value={selectedPropertyName} />
          <SummaryItem label="Квартира" value={selectedUnitLabel} />
          <SummaryItem label="Тип оплаты">
            <AppStatusBadge label={selectedPaymentLabel} tone="info" />
          </SummaryItem>
          <SummaryItem label="Общая сумма" value={totalAmountNum > 0 ? formatMoney(totalAmountNum, form.currency) : "—"} bold />
          {downPaymentNum > 0 && (
            <SummaryItem label="Первоначальный взнос" value={formatMoney(downPaymentNum, form.currency)} />
          )}
          {installmentMonthsNum > 0 && (
            <SummaryItem label="Срок рассрочки" value={`${installmentMonthsNum} мес.`} />
          )}
          {monthlyPayment !== null && (
            <SummaryItem label="Ежемесячный платёж" value={formatMoney(monthlyPayment, form.currency)} bold />
          )}
          {form.mortgageBank && <SummaryItem label="Банк" value={form.mortgageBank} />}
          {form.notes && <SummaryItem label="Примечание" value={form.notes} />}
        </div>
      </div>
    </div>
  );

  // ─── Wizard steps ─────────────────────────────────────────────────────

  const steps: readonly AppStepWizardStep[] = [
    { id: "client-unit", label: "Клиент и квартира", content: step1Content, validate: validateStep1 },
    { id: "payment", label: "Условия оплаты", content: step2Content, validate: validateStep2 },
    { id: "confirm", label: "Подтверждение", content: step3Content },
  ];

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <main className="space-y-6 p-4 md:p-6">
      <AppPageHeader
        title="Новая сделка"
        subtitle="Оформление продажи квартиры"
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "deals", label: "Сделки", href: routes.deals },
          { id: "new", label: "Новая сделка" },
        ]}
      />

      <Paper sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3 }}>
        <AppStepWizard
          steps={steps}
          activeStep={activeStep}
          onStepChange={setActiveStep}
          onComplete={() => { void handleSubmit(); }}
          loading={isPending}
          completeLabel="Создать сделку"
          nextLabel="Далее"
          backLabel="Назад"
        />
      </Paper>
    </main>
  );
}

// ─── Summary helper ─────────────────────────────────────────────────────────

function SummaryItem({ label, value, bold, children }: { label: string; value?: string; bold?: boolean; children?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      {children ?? (
        <p className={`text-sm ${bold ? "font-bold" : "font-medium"} text-foreground`}>{value}</p>
      )}
    </div>
  );
}
