"use client";

import { useState } from "react";
import { Stack } from "@mui/material";
import { AppDrawerForm, AppInput, AppSelect } from "@/shared/ui";
import { useCreateSupplierPaymentMutation } from "@/modules/warehouse/presentation/hooks/use-create-supplier-payment-mutation";

const CURRENCY_OPTIONS = [
  { label: "TJS", value: "TJS" },
  { label: "USD", value: "USD" },
  { label: "RUB", value: "RUB" },
] as const;

interface FormState {
  amount: string;
  currency: string;
  notes: string;
}

const INITIAL_FORM: FormState = {
  amount: "",
  currency: "TJS",
  notes: "",
};

type FormErrors = Partial<Record<"amount", string>>;

interface SupplierPaymentDrawerProps {
  open: boolean;
  supplierId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SupplierPaymentDrawer({
  open,
  supplierId,
  onClose,
  onSuccess,
}: SupplierPaymentDrawerProps) {
  const mutation = useCreateSupplierPaymentMutation(supplierId);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  const set = (key: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "amount") {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.amount;
        return next;
      });
    }
  };

  const reset = () => {
    setForm(INITIAL_FORM);
    setErrors({});
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    const parsed = parseFloat(form.amount);
    if (!form.amount.trim() || isNaN(parsed) || parsed <= 0) {
      next.amount = "Введите корректную сумму";
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

    const parsed = parseFloat(form.amount);

    mutation.mutate(
      {
        amount: parsed,
        currency: form.currency,
        notes: form.notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          reset();
          onSuccess?.();
          onClose();
        },
      },
    );
  };

  return (
    <AppDrawerForm
      open={open}
      title="Оплата поставщику"
      subtitle="Введите данные платежа"
      saveLabel="Оплатить"
      cancelLabel="Отмена"
      isSaving={mutation.isPending}
      onClose={handleClose}
      onSave={handleSave}
    >
      <Stack spacing={2}>
        <AppInput
          label="Сумма *"
          type="number"
          value={form.amount}
          onChangeValue={set("amount")}
          {...(errors.amount ? { errorText: errors.amount } : {})}
        />
        <AppSelect
          id="payment-currency"
          label="Валюта"
          options={CURRENCY_OPTIONS}
          value={form.currency}
          onChange={(e) => set("currency")(e.target.value)}
        />
        <AppInput
          label="Заметки"
          value={form.notes}
          onChangeValue={set("notes")}
        />
      </Stack>
    </AppDrawerForm>
  );
}
