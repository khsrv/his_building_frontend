"use client";

import { useState, useMemo } from "react";
import { Alert, Box, Typography } from "@mui/material";
import { AppDrawerForm, AppInput, AppSelect } from "@/shared/ui";
import { useSellBarterMutation } from "@/modules/finance/presentation/hooks/use-sell-barter-mutation";
import { usePropertiesListQuery } from "@/modules/properties/presentation/hooks/use-properties-list-query";
import type { Account, BarterSellResult } from "@/modules/finance/domain/finance";

const CURRENCY_OPTIONS = [
  { value: "TJS", label: "TJS" },
  { value: "USD", label: "USD" },
  { value: "RUB", label: "RUB" },
] as const;

function formatMoney(n: number, currency: string): string {
  return `${n.toLocaleString("ru-RU")} ${currency}`;
}

interface FormState {
  bookValue: string;
  salePrice: string;
  cashAccountId: string;
  currency: string;
  description: string;
  propertyId: string;
}

type FormErrors = Partial<Record<"salePrice" | "cashAccountId" | "description", string>>;

interface BarterSellDrawerProps {
  open: boolean;
  barterAccount: Account;
  cashAccounts: readonly Account[];
  onClose: () => void;
}

export function BarterSellDrawer({
  open,
  barterAccount,
  cashAccounts,
  onClose,
}: BarterSellDrawerProps) {
  const mutation = useSellBarterMutation();
  const { data: propertiesResult } = usePropertiesListQuery();
  const properties = propertiesResult?.items ?? [];

  const [form, setForm] = useState<FormState>({
    bookValue: String(barterAccount.balance),
    salePrice: "",
    cashAccountId: cashAccounts[0]?.id ?? "",
    currency: barterAccount.currency,
    description: "",
    propertyId: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [result, setResult] = useState<BarterSellResult | null>(null);

  const cashAccountOptions = cashAccounts.map((a) => ({
    value: a.id,
    label: `${a.name} (${a.currency})`,
  }));

  const propertyOptions = [
    { value: "", label: "Без объекта" },
    ...properties.map((p) => ({ value: p.id, label: p.name })),
  ];

  // Live profit/loss calculation
  const profitLoss = useMemo(() => {
    const sale = parseFloat(form.salePrice);
    const book = parseFloat(form.bookValue);
    if (isNaN(sale) || isNaN(book)) return null;
    return sale - book;
  }, [form.salePrice, form.bookValue]);

  const set = (key: keyof FormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const reset = () => {
    setForm({
      bookValue: String(barterAccount.balance),
      salePrice: "",
      cashAccountId: cashAccounts[0]?.id ?? "",
      currency: barterAccount.currency,
      description: "",
      propertyId: "",
    });
    setErrors({});
    setResult(null);
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    const saleNum = parseFloat(form.salePrice);
    if (!form.salePrice || isNaN(saleNum) || saleNum <= 0) {
      next.salePrice = "Введите корректную цену продажи";
    }
    if (!form.cashAccountId) {
      next.cashAccountId = "Выберите счёт для зачисления";
    }
    if (!form.description.trim()) {
      next.description = "Укажите что продаётся";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = () => {
    if (!validate()) return;

    mutation.mutate(
      {
        barterAccountId: barterAccount.id,
        cashAccountId: form.cashAccountId,
        bookValue: parseFloat(form.bookValue) || barterAccount.balance,
        salePrice: parseFloat(form.salePrice),
        currency: form.currency,
        description: form.description.trim(),
        propertyId: form.propertyId || undefined,
      },
      {
        onSuccess: (res) => {
          setResult(res);
        },
      },
    );
  };

  // After success — show result screen
  if (result !== null) {
    return (
      <AppDrawerForm
        open={open}
        title="Бартерный актив продан"
        saveLabel="Закрыть"
        cancelLabel=""
        onClose={handleClose}
        onSave={handleClose}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Alert severity={result.isProfit ? "success" : "warning"} sx={{ borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {result.isProfit ? "Прибыль" : "Убыток"}:{" "}
              {result.isProfit ? "+" : ""}
              {formatMoney(result.profitLoss, form.currency)}
            </Typography>
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Деньги зачислены на счёт. Бартерный актив списан.
          </Typography>
        </Box>
      </AppDrawerForm>
    );
  }

  return (
    <AppDrawerForm
      open={open}
      title={`Продать: ${barterAccount.name}`}
      subtitle="Укажите детали продажи бартерного актива"
      saveLabel="Продать"
      cancelLabel="Отмена"
      isSaving={mutation.isPending}
      saveDisabled={mutation.isPending}
      onClose={handleClose}
      onSave={handleSave}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <AppInput
          label="Бартерный счёт"
          value={`${barterAccount.name} (${formatMoney(barterAccount.balance, barterAccount.currency)})`}
          onChangeValue={() => {/* read-only */}}
        />
        <AppInput
          label="Книжная стоимость"
          type="number"
          value={form.bookValue}
          onChangeValue={set("bookValue")}
        />
        <AppInput
          label="Фактическая цена продажи *"
          type="number"
          value={form.salePrice}
          onChangeValue={set("salePrice")}
          placeholder="0"
          {...(errors.salePrice ? { errorText: errors.salePrice } : {})}
        />

        {/* Live profit/loss */}
        {profitLoss !== null && (
          <Alert
            severity={profitLoss >= 0 ? "success" : "warning"}
            sx={{ py: 0.5, borderRadius: 2 }}
          >
            {profitLoss >= 0 ? "Прибыль" : "Убыток"}:{" "}
            {profitLoss >= 0 ? "+" : ""}
            {formatMoney(profitLoss, form.currency)}
          </Alert>
        )}

        <AppSelect
          id="barter-sell-cash-account"
          label="Куда зачислить деньги *"
          options={cashAccountOptions}
          value={form.cashAccountId}
          onChange={(e) => set("cashAccountId")(e.target.value)}
          {...(errors.cashAccountId ? { errorText: errors.cashAccountId } : {})}
        />
        <AppSelect
          id="barter-sell-currency"
          label="Валюта"
          options={CURRENCY_OPTIONS}
          value={form.currency}
          onChange={(e) => set("currency")(e.target.value)}
        />
        <AppInput
          label="Что продаётся *"
          value={form.description}
          onChangeValue={set("description")}
          placeholder="Toyota Camry 2022, госномер 01A 123 AA"
          {...(errors.description ? { errorText: errors.description } : {})}
        />
        <AppSelect
          id="barter-sell-property"
          label="Объект"
          options={propertyOptions}
          value={form.propertyId}
          onChange={(e) => set("propertyId")(e.target.value)}
        />
      </Box>
    </AppDrawerForm>
  );
}
