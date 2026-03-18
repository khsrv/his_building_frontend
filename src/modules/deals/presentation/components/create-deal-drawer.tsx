"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  AppDrawerForm,
  AppStepWizard,
  type AppStepWizardStep,
  AppSearchableSelect,
  type AppSearchableSelectOption,
  AppSelect,
  AppInput,
} from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { useCreateDealMutation } from "@/modules/deals/presentation/hooks/use-create-deal-mutation";
import { usePropertiesQuery } from "@/modules/deals/presentation/hooks/use-properties-query";
import { useAvailableUnitsQuery } from "@/modules/deals/presentation/hooks/use-available-units-query";
import { useClientSearchQuery } from "@/modules/deals/presentation/hooks/use-client-search-query";
import type { DealPaymentType } from "@/modules/deals/domain/deal";

// ─── Constants ────────────────────────────────────────────────────────────────

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

const CURRENCY_OPTIONS: readonly { value: string; label: string }[] = [
  { value: "USD", label: "USD" },
  { value: "TJS", label: "TJS" },
  { value: "RUB", label: "RUB" },
  { value: "EUR", label: "EUR" },
];

function formatMoney(amount: number, currency: string): string {
  return (
    new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(
      amount,
    ) +
    " " +
    currency
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

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
  totalAmount?: string;
  installmentMonths?: string;
  installmentFrequency?: string;
  mortgageBank?: string;
}

const DEFAULT_FORM: FormState = {
  clientId: "",
  clientLabel: "",
  propertyId: "",
  unitId: "",
  paymentType: "full_payment",
  totalAmount: "",
  currency: "USD",
  downPayment: "",
  installmentMonths: "",
  installmentFrequency: "monthly",
  mortgageBank: "",
  mortgageRate: "",
  notes: "",
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface CreateDealDrawerProps {
  open: boolean;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CreateDealDrawer({ open, onClose }: CreateDealDrawerProps) {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [clientSearch, setClientSearch] = useState("");

  const { mutateAsync: createDeal, isPending } = useCreateDealMutation();
  const { data: properties = [], isLoading: propertiesLoading } = usePropertiesQuery();
  const { data: units = [], isLoading: unitsLoading } = useAvailableUnitsQuery(form.propertyId);
  const { data: clients = [], isFetching: clientsSearching } = useClientSearchQuery(clientSearch);

  const setField = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const propertyOptions: readonly { value: string; label: string }[] = useMemo(
    () => properties.map((p) => ({ value: p.id, label: p.name })),
    [properties],
  );

  const unitOptions: readonly { value: string; label: string }[] = useMemo(
    () =>
      units.map((u) => ({
        value: u.id,
        label: `Кв. ${u.unitNumber}${u.rooms ? `, ${u.rooms}к` : ""}${u.totalArea ? `, ${u.totalArea} м²` : ""}`,
      })),
    [units],
  );

  const clientOptions: AppSearchableSelectOption[] = useMemo(
    () =>
      clients.map((c) => ({
        id: c.id,
        label: c.fullName,
        secondary: c.phone,
      })),
    [clients],
  );

  const totalAmountNum = parseFloat(form.totalAmount) || 0;
  const downPaymentNum = parseFloat(form.downPayment) || 0;
  const remaining = Math.max(0, totalAmountNum - downPaymentNum);
  const installmentMonthsNum = parseInt(form.installmentMonths, 10) || 0;
  const monthlyPayment = installmentMonthsNum > 0 ? remaining / installmentMonthsNum : null;

  const validateStep1 = (): boolean => {
    const nextErrors: FormErrors = {};
    if (!form.clientId) nextErrors.clientId = "Выберите клиента";
    if (!form.unitId) nextErrors.unitId = "Выберите квартиру";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const nextErrors: FormErrors = {};
    if (!form.totalAmount || totalAmountNum <= 0) {
      nextErrors.totalAmount = "Введите сумму больше 0";
    }
    if (form.paymentType === "installment") {
      if (!form.installmentMonths) nextErrors.installmentMonths = "Укажите срок рассрочки";
      if (!form.installmentFrequency)
        nextErrors.installmentFrequency = "Выберите периодичность платежей";
    }
    if (form.paymentType === "mortgage") {
      if (!form.mortgageBank.trim()) nextErrors.mortgageBank = "Укажите банк";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleClose = useCallback(() => {
    setForm(DEFAULT_FORM);
    setErrors({});
    setActiveStep(0);
    setClientSearch("");
    onClose();
  }, [onClose]);

  const handleSubmit = async () => {
    if (!validateStep2()) return;
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
    const deal = await createDeal(input);
    handleClose();
    router.push(routes.dealDetail(deal.id));
  };

  // ─── Step content ──────────────────────────────────────────────────────────

  const step1Content = (
    <div className="space-y-5">
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Клиент</label>
        <AppSearchableSelect
          options={clientOptions}
          value={form.clientId || null}
          onChange={(id, option) => {
            setField("clientId", id);
            setField("clientLabel", option.label);
          }}
          triggerLabel={form.clientLabel || "Выберите клиента"}
          dialogTitle="Поиск клиента"
          searchPlaceholder="Имя или телефон..."
          loading={clientsSearching}
          emptyLabel={
            clientSearch.length < 2
              ? "Введите минимум 2 символа для поиска"
              : "Клиент не найден"
          }
          filterFn={(_option, query) => {
            setClientSearch(query);
            return true;
          }}
        />
        {errors.clientId ? (
          <p className="text-xs text-red-500">{errors.clientId}</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">ЖК (Объект)</label>
        <AppSelect
          id="property-select"
          label="Выберите ЖК"
          options={[
            {
              value: "",
              label: propertiesLoading ? "Загрузка..." : "— Выберите ЖК —",
            },
            ...propertyOptions,
          ]}
          value={form.propertyId}
          onChange={(e) => {
            setField("propertyId", e.target.value);
            setField("unitId", "");
          }}
        />
      </div>

      {form.propertyId ? (
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Квартира</label>
          <AppSelect
            id="unit-select"
            label="Выберите квартиру"
            options={[
              {
                value: "",
                label: unitsLoading ? "Загрузка..." : "— Выберите квартиру —",
              },
              ...unitOptions,
            ]}
            value={form.unitId}
            onChange={(e) => setField("unitId", e.target.value)}
          />
          {errors.unitId ? (
            <p className="text-xs text-red-500">{errors.unitId}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  const step2Content = (
    <div className="space-y-5">
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Тип оплаты</label>
        <AppSelect
          id="payment-type-select"
          label="Тип оплаты"
          options={PAYMENT_TYPE_OPTIONS}
          value={form.paymentType}
          onChange={(e) => setField("paymentType", e.target.value as DealPaymentType)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <AppInput
            label="Общая сумма"
            type="number"
            value={form.totalAmount}
            onChangeValue={(v) => setField("totalAmount", v)}
            {...(errors.totalAmount ? { errorText: errors.totalAmount } : {})}
          />
        </div>
        <div className="space-y-1">
          <AppSelect
            id="currency-select"
            label="Валюта"
            options={CURRENCY_OPTIONS}
            value={form.currency}
            onChange={(e) => setField("currency", e.target.value)}
          />
        </div>
      </div>

      {/* Installment fields */}
      {form.paymentType === "installment" ? (
        <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-sm font-semibold text-foreground">Параметры рассрочки</p>
          <AppInput
            label="Первоначальный взнос"
            type="number"
            value={form.downPayment}
            onChangeValue={(v) => setField("downPayment", v)}
          />
          <AppSelect
            id="installment-months-select"
            label="Срок рассрочки"
            options={[{ value: "", label: "— Выберите срок —" }, ...INSTALLMENT_MONTH_OPTIONS]}
            value={form.installmentMonths}
            onChange={(e) => setField("installmentMonths", e.target.value)}
            {...(errors.installmentMonths ? { errorText: errors.installmentMonths } : {})}
          />
          <AppSelect
            id="installment-freq-select"
            label="Периодичность"
            options={[{ value: "", label: "— Выберите —" }, ...INSTALLMENT_FREQUENCY_OPTIONS]}
            value={form.installmentFrequency}
            onChange={(e) => setField("installmentFrequency", e.target.value)}
            {...(errors.installmentFrequency ? { errorText: errors.installmentFrequency } : {})}
          />
          {/* Live calculation */}
          <div className="rounded-lg bg-primary/5 p-3">
            <p className="text-xs text-muted-foreground">Расчёт:</p>
            <p className="text-sm">
              Остаток:{" "}
              <span className="font-semibold">{formatMoney(remaining, form.currency)}</span>
            </p>
            {monthlyPayment !== null ? (
              <p className="text-sm">
                Ежемесячный платёж:{" "}
                <span className="font-semibold">
                  {formatMoney(monthlyPayment, form.currency)}
                </span>
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Mortgage fields */}
      {form.paymentType === "mortgage" ? (
        <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-sm font-semibold text-foreground">Параметры ипотеки</p>
          <AppInput
            label="Первоначальный взнос"
            type="number"
            value={form.downPayment}
            onChangeValue={(v) => setField("downPayment", v)}
          />
          <AppInput
            label="Банк"
            value={form.mortgageBank}
            onChangeValue={(v) => setField("mortgageBank", v)}
            {...(errors.mortgageBank ? { errorText: errors.mortgageBank } : {})}
          />
          <AppInput
            label="Процентная ставка (%)"
            type="number"
            value={form.mortgageRate}
            onChangeValue={(v) => setField("mortgageRate", v)}
          />
        </div>
      ) : null}

      <AppInput
        label="Примечание"
        value={form.notes}
        onChangeValue={(v) => setField("notes", v)}
      />
    </div>
  );

  const selectedPropertyName =
    properties.find((p) => p.id === form.propertyId)?.name ?? "—";
  const selectedUnitLabel = unitOptions.find((u) => u.value === form.unitId)?.label ?? "—";
  const selectedPaymentLabel =
    PAYMENT_TYPE_OPTIONS.find((p) => p.value === form.paymentType)?.label ?? "—";

  const step3Content = (
    <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-5">
      <h3 className="text-base font-semibold text-foreground">Итого по сделке</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">Клиент</p>
          <p className="text-sm font-medium text-foreground">{form.clientLabel || "—"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">ЖК</p>
          <p className="text-sm font-medium text-foreground">{selectedPropertyName}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Квартира</p>
          <p className="text-sm font-medium text-foreground">{selectedUnitLabel}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Тип оплаты</p>
          <p className="text-sm font-medium text-foreground">{selectedPaymentLabel}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Общая сумма</p>
          <p className="text-sm font-bold text-foreground">
            {totalAmountNum > 0 ? formatMoney(totalAmountNum, form.currency) : "—"}
          </p>
        </div>
        {downPaymentNum > 0 ? (
          <div>
            <p className="text-xs text-muted-foreground">Первоначальный взнос</p>
            <p className="text-sm font-medium text-foreground">
              {formatMoney(downPaymentNum, form.currency)}
            </p>
          </div>
        ) : null}
        {installmentMonthsNum > 0 ? (
          <div>
            <p className="text-xs text-muted-foreground">Срок рассрочки</p>
            <p className="text-sm font-medium text-foreground">{installmentMonthsNum} месяцев</p>
          </div>
        ) : null}
        {monthlyPayment !== null ? (
          <div>
            <p className="text-xs text-muted-foreground">Ежемесячный платёж</p>
            <p className="text-sm font-semibold text-foreground">
              {formatMoney(monthlyPayment, form.currency)}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );

  const steps: readonly AppStepWizardStep[] = [
    {
      id: "client-unit",
      label: "Клиент и квартира",
      content: step1Content,
      validate: () => validateStep1(),
    },
    {
      id: "payment",
      label: "Тип оплаты",
      content: step2Content,
      validate: () => validateStep2(),
    },
    {
      id: "confirm",
      label: "Подтверждение",
      content: step3Content,
    },
  ];

  return (
    <AppDrawerForm
      open={open}
      title="Новая сделка"
      subtitle="Заполните данные для создания сделки"
      onClose={handleClose}
      onSave={() => {
        if (activeStep < steps.length - 1) {
          const valid = steps[activeStep]?.validate?.() ?? true;
          if (valid instanceof Promise) {
            void valid.then((ok) => { if (ok) setActiveStep((s) => s + 1); });
          } else if (valid) {
            setActiveStep((s) => s + 1);
          }
        } else {
          void handleSubmit();
        }
      }}
      saveLabel={activeStep < steps.length - 1 ? "Далее" : "Создать сделку"}
      cancelLabel="Отмена"
      isSaving={isPending}
      widthClassName="w-[min(600px,100vw)]"
    >
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
    </AppDrawerForm>
  );
}
