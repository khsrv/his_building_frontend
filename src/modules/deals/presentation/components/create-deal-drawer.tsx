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
import { useCurrencyOptions } from "@/modules/finance/presentation/hooks/use-currency-options";
import { useI18n } from "@/shared/providers/locale-provider";

// ─── Constants ────────────────────────────────────────────────────────────────

function formatMoney(amount: number, currency: string, localeCode: "ru-RU" | "en-US"): string {
  return (
    new Intl.NumberFormat(localeCode, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(
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
  const { locale, t } = useI18n();
  const router = useRouter();
  const numberLocale = locale === "en" ? "en-US" : "ru-RU";
  const currencyOptions = useCurrencyOptions();
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
  const paymentTypeOptions: readonly { value: DealPaymentType; label: string }[] = [
    { value: "full_payment", label: t("deals.create.paymentType.fullPayment") },
    { value: "installment", label: t("deals.create.paymentType.installment") },
    { value: "mortgage", label: t("deals.create.paymentType.mortgage") },
    { value: "barter", label: t("deals.create.paymentType.barter") },
    { value: "combined", label: t("deals.create.paymentType.combined") },
  ];
  const installmentMonthOptions: readonly { value: string; label: string }[] = [
    { value: "6", label: t("deals.create.installment.months6") },
    { value: "12", label: t("deals.create.installment.months12") },
    { value: "24", label: t("deals.create.installment.months24") },
    { value: "36", label: t("deals.create.installment.months36") },
    { value: "48", label: t("deals.create.installment.months48") },
    { value: "60", label: t("deals.create.installment.months60") },
  ];
  const installmentFrequencyOptions: readonly { value: string; label: string }[] = [
    { value: "monthly", label: t("deals.create.installment.frequency.monthly") },
    { value: "quarterly", label: t("deals.create.installment.frequency.quarterly") },
    { value: "custom", label: t("deals.create.installment.frequency.custom") },
  ];

  const propertyOptions: readonly { value: string; label: string }[] = useMemo(
    () => properties.map((p) => ({ value: p.id, label: p.name })),
    [properties],
  );

  const unitOptions: readonly { value: string; label: string }[] = useMemo(
    () =>
      units.map((u) => ({
        value: u.id,
        label: `${t("deals.create.labels.unit")} ${u.unitNumber}${u.rooms ? `, ${u.rooms}${t("deals.create.labels.roomsShort")}` : ""}${u.totalArea ? `, ${u.totalArea} ${t("deals.create.labels.squareMeter")}` : ""}`,
      })),
    [t, units],
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
    if (!form.clientId) nextErrors.clientId = t("deals.create.errors.selectClient");
    if (!form.unitId) nextErrors.unitId = t("deals.create.errors.selectUnit");
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const nextErrors: FormErrors = {};
    if (!form.totalAmount || totalAmountNum <= 0) {
      nextErrors.totalAmount = t("deals.create.errors.amountGreaterZero");
    }
    if (form.paymentType === "installment") {
      if (!form.installmentMonths) nextErrors.installmentMonths = t("deals.create.errors.installmentMonths");
      if (!form.installmentFrequency)
        nextErrors.installmentFrequency = t("deals.create.errors.installmentFrequency");
    }
    if (form.paymentType === "mortgage") {
      if (!form.mortgageBank.trim()) nextErrors.mortgageBank = t("deals.create.errors.mortgageBank");
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

  const [submitError, setSubmitError] = useState<string | null>(null);

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
      handleClose();
      router.push(routes.dealDetail(deal.id));
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t("deals.create.errors.createFailed"));
    }
  };

  // ─── Step content ──────────────────────────────────────────────────────────

  const step1Content = (
    <div className="space-y-5">
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">{t("deals.create.fields.client")}</label>
        <AppSearchableSelect
          options={clientOptions}
          value={form.clientId || null}
          onChange={(id, option) => {
            setField("clientId", id);
            setField("clientLabel", option.label);
          }}
          triggerLabel={form.clientLabel || t("deals.create.placeholders.selectClient")}
          dialogTitle={t("deals.create.dialog.searchClient")}
          searchPlaceholder={t("deals.create.placeholders.clientSearch")}
          loading={clientsSearching}
          emptyLabel={
            clientSearch.length < 2
              ? t("deals.create.empty.minSearch")
              : t("deals.create.empty.clientNotFound")
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
        <label className="text-sm font-medium text-foreground">{t("deals.create.fields.property")}</label>
        <AppSelect
          id="property-select"
          label={t("deals.create.placeholders.selectProperty")}
          options={[
            {
              value: "",
              label: propertiesLoading ? t("common.loading") : t("deals.create.placeholders.selectPropertyOption"),
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
          <label className="text-sm font-medium text-foreground">{t("deals.create.fields.unit")}</label>
          <AppSelect
            id="unit-select"
            label={t("deals.create.placeholders.selectUnit")}
            options={[
              {
                value: "",
                label: unitsLoading ? t("common.loading") : t("deals.create.placeholders.selectUnitOption"),
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
        <label className="text-sm font-medium text-foreground">{t("deals.create.fields.paymentType")}</label>
        <AppSelect
          id="payment-type-select"
          label={t("deals.create.fields.paymentType")}
          options={paymentTypeOptions}
          value={form.paymentType}
          onChange={(e) => setField("paymentType", e.target.value as DealPaymentType)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <AppInput
            label={t("deals.create.fields.totalAmount")}
            type="number"
            value={form.totalAmount}
            onChangeValue={(v) => setField("totalAmount", v)}
            {...(errors.totalAmount ? { errorText: errors.totalAmount } : {})}
          />
        </div>
        <div className="space-y-1">
          <AppSelect
            id="currency-select"
            label={t("deals.create.fields.currency")}
            options={currencyOptions}
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
            label={t("deals.create.fields.downPayment")}
            type="number"
            value={form.downPayment}
            onChangeValue={(v) => setField("downPayment", v)}
          />
          <AppSelect
            id="installment-months-select"
            label={t("deals.create.fields.installmentMonths")}
            options={[{ value: "", label: t("deals.create.placeholders.selectInstallmentMonths") }, ...installmentMonthOptions]}
            value={form.installmentMonths}
            onChange={(e) => setField("installmentMonths", e.target.value)}
            {...(errors.installmentMonths ? { errorText: errors.installmentMonths } : {})}
          />
          <AppSelect
            id="installment-freq-select"
            label={t("deals.create.fields.installmentFrequency")}
            options={[{ value: "", label: t("deals.create.placeholders.selectOption") }, ...installmentFrequencyOptions]}
            value={form.installmentFrequency}
            onChange={(e) => setField("installmentFrequency", e.target.value)}
            {...(errors.installmentFrequency ? { errorText: errors.installmentFrequency } : {})}
          />
          {/* Live calculation */}
          <div className="rounded-lg bg-primary/5 p-3">
            <p className="text-xs text-muted-foreground">{t("deals.create.calc.title")}</p>
            <p className="text-sm">
              {t("deals.create.calc.remaining")}:{" "}
              <span className="font-semibold">{formatMoney(remaining, form.currency, numberLocale)}</span>
            </p>
            {monthlyPayment !== null ? (
              <p className="text-sm">
                {t("deals.create.calc.monthlyPayment")}:{" "}
                <span className="font-semibold">
                  {formatMoney(monthlyPayment, form.currency, numberLocale)}
                </span>
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Mortgage fields */}
      {form.paymentType === "mortgage" ? (
        <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-sm font-semibold text-foreground">{t("deals.create.mortgage.title")}</p>
          <AppInput
            label={t("deals.create.fields.downPayment")}
            type="number"
            value={form.downPayment}
            onChangeValue={(v) => setField("downPayment", v)}
          />
          <AppInput
            label={t("deals.create.fields.mortgageBank")}
            value={form.mortgageBank}
            onChangeValue={(v) => setField("mortgageBank", v)}
            {...(errors.mortgageBank ? { errorText: errors.mortgageBank } : {})}
          />
          <AppInput
            label={t("deals.create.fields.mortgageRate")}
            type="number"
            value={form.mortgageRate}
            onChangeValue={(v) => setField("mortgageRate", v)}
          />
        </div>
      ) : null}

      <AppInput
        label={t("deals.create.fields.notes")}
        value={form.notes}
        onChangeValue={(v) => setField("notes", v)}
      />
    </div>
  );

  const selectedPropertyName =
    properties.find((p) => p.id === form.propertyId)?.name ?? t("deals.create.labels.dash");
  const selectedUnitLabel = unitOptions.find((u) => u.value === form.unitId)?.label ?? t("deals.create.labels.dash");
  const selectedPaymentLabel =
    paymentTypeOptions.find((p) => p.value === form.paymentType)?.label ?? t("deals.create.labels.dash");

  const step3Content = (
    <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-5">
      {submitError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {submitError}
        </div>
      ) : null}
      <h3 className="text-base font-semibold text-foreground">{t("deals.create.summary.title")}</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">{t("deals.create.fields.client")}</p>
          <p className="text-sm font-medium text-foreground">{form.clientLabel || t("deals.create.labels.dash")}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t("deals.create.fields.propertyShort")}</p>
          <p className="text-sm font-medium text-foreground">{selectedPropertyName}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t("deals.create.fields.unit")}</p>
          <p className="text-sm font-medium text-foreground">{selectedUnitLabel}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t("deals.create.fields.paymentType")}</p>
          <p className="text-sm font-medium text-foreground">{selectedPaymentLabel}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t("deals.create.fields.totalAmount")}</p>
          <p className="text-sm font-bold text-foreground">
            {totalAmountNum > 0 ? formatMoney(totalAmountNum, form.currency, numberLocale) : t("deals.create.labels.dash")}
          </p>
        </div>
        {downPaymentNum > 0 ? (
          <div>
            <p className="text-xs text-muted-foreground">{t("deals.create.fields.downPayment")}</p>
            <p className="text-sm font-medium text-foreground">
              {formatMoney(downPaymentNum, form.currency, numberLocale)}
            </p>
          </div>
        ) : null}
        {installmentMonthsNum > 0 ? (
          <div>
            <p className="text-xs text-muted-foreground">{t("deals.create.fields.installmentMonths")}</p>
            <p className="text-sm font-medium text-foreground">{t("deals.create.summary.installmentMonths", { months: installmentMonthsNum })}</p>
          </div>
        ) : null}
        {monthlyPayment !== null ? (
          <div>
            <p className="text-xs text-muted-foreground">{t("deals.create.calc.monthlyPayment")}</p>
            <p className="text-sm font-semibold text-foreground">
              {formatMoney(monthlyPayment, form.currency, numberLocale)}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );

  const steps: readonly AppStepWizardStep[] = [
    {
      id: "client-unit",
      label: t("deals.create.steps.clientAndUnit"),
      content: step1Content,
      validate: () => validateStep1(),
    },
    {
      id: "payment",
      label: t("deals.create.steps.payment"),
      content: step2Content,
      validate: () => validateStep2(),
    },
    {
      id: "confirm",
      label: t("deals.create.steps.confirm"),
      content: step3Content,
    },
  ];

  return (
    <AppDrawerForm
      open={open}
      title={t("deals.create.title")}
      subtitle={t("deals.create.subtitle")}
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
      saveLabel={activeStep < steps.length - 1 ? t("wizard.next") : t("deals.create.createDeal")}
      cancelLabel={t("common.cancel")}
      isSaving={isPending}
      widthClassName="w-[min(600px,100vw)]"
    >
      <AppStepWizard
        steps={steps}
        activeStep={activeStep}
        onStepChange={setActiveStep}
        onComplete={() => { void handleSubmit(); }}
        loading={isPending}
        completeLabel={t("deals.create.createDeal")}
        nextLabel={t("wizard.next")}
        backLabel={t("wizard.back")}
      />
    </AppDrawerForm>
  );
}
