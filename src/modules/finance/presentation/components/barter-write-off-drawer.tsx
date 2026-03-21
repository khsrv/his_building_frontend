"use client";

import { useState } from "react";
import { Box } from "@mui/material";
import { AppDrawerForm, AppInput, AppSelect } from "@/shared/ui";
import { useCreateTransactionMutation } from "@/modules/finance/presentation/hooks/use-create-transaction-mutation";
import { useExpenseCategoriesQuery } from "@/modules/finance/presentation/hooks/use-expense-categories-query";
import { usePropertiesListQuery } from "@/modules/properties/presentation/hooks/use-properties-list-query";
import type { Account } from "@/modules/finance/domain/finance";

const CURRENCY_OPTIONS = [
  { value: "TJS", label: "TJS" },
  { value: "USD", label: "USD" },
  { value: "RUB", label: "RUB" },
] as const;

interface FormState {
  amount: string;
  currency: string;
  propertyId: string;
  categoryId: string;
  description: string;
}

type FormErrors = Partial<Record<"amount" | "propertyId" | "description", string>>;

interface BarterWriteOffDrawerProps {
  open: boolean;
  barterAccount: Account;
  onClose: () => void;
}

export function BarterWriteOffDrawer({
  open,
  barterAccount,
  onClose,
}: BarterWriteOffDrawerProps) {
  const mutation = useCreateTransactionMutation();
  const { data: categories = [] } = useExpenseCategoriesQuery();
  const { data: propertiesResult } = usePropertiesListQuery();
  const properties = propertiesResult?.items ?? [];

  const [form, setForm] = useState<FormState>({
    amount: "",
    currency: barterAccount.currency,
    propertyId: "",
    categoryId: "",
    description: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const categoryOptions = [
    { value: "", label: "Без категории" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const propertyOptions = [
    { value: "", label: "Выберите объект" },
    ...properties.map((p) => ({ value: p.id, label: p.name })),
  ];

  const set = (key: keyof FormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const reset = () => {
    setForm({
      amount: "",
      currency: barterAccount.currency,
      propertyId: "",
      categoryId: "",
      description: "",
    });
    setErrors({});
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    const amountNum = parseFloat(form.amount);
    if (!form.amount || isNaN(amountNum) || amountNum <= 0) {
      next.amount = "Введите корректную сумму";
    }
    if (!form.propertyId) {
      next.propertyId = "Выберите объект";
    }
    if (!form.description.trim()) {
      next.description = "Укажите что списывается";
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

    const today = new Date().toISOString().slice(0, 10);

    mutation.mutate(
      {
        type: "expense",
        accountId: barterAccount.id,
        amount: parseFloat(form.amount),
        currency: form.currency,
        description: form.description.trim(),
        transactionDate: today,
        categoryId: form.categoryId || undefined,
        propertyId: form.propertyId,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      },
    );
  };

  return (
    <AppDrawerForm
      open={open}
      title={`Списать: ${barterAccount.name}`}
      subtitle="Списание бартерного актива на объект строительства"
      saveLabel="Списать"
      cancelLabel="Отмена"
      isSaving={mutation.isPending}
      saveDisabled={mutation.isPending}
      onClose={handleClose}
      onSave={handleSave}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <AppInput
          label="Бартерный счёт"
          value={barterAccount.name}
          onChangeValue={() => {/* read-only */}}
        />
        <AppInput
          label="Сумма *"
          type="number"
          value={form.amount}
          onChangeValue={set("amount")}
          placeholder="0"
          {...(errors.amount ? { errorText: errors.amount } : {})}
        />
        <AppSelect
          id="writeoff-currency"
          label="Валюта"
          options={CURRENCY_OPTIONS}
          value={form.currency}
          onChange={(e) => set("currency")(e.target.value)}
        />
        <AppSelect
          id="writeoff-property"
          label="Объект *"
          options={propertyOptions}
          value={form.propertyId}
          onChange={(e) => set("propertyId")(e.target.value)}
          {...(errors.propertyId ? { errorText: errors.propertyId } : {})}
        />
        <AppSelect
          id="writeoff-category"
          label="Категория расхода"
          options={categoryOptions}
          value={form.categoryId}
          onChange={(e) => set("categoryId")(e.target.value)}
        />
        <AppInput
          label="Что списывается *"
          value={form.description}
          onChangeValue={set("description")}
          placeholder="Пластиковые окна (бартер от ООО Окнапласт)"
          {...(errors.description ? { errorText: errors.description } : {})}
        />
      </Box>
    </AppDrawerForm>
  );
}
