"use client";

import { useState } from "react";
import { Stack } from "@mui/material";
import { AppDrawerForm, AppInput, AppSelect } from "@/shared/ui";
import { useCreateSupplierPaymentMutation } from "@/modules/warehouse/presentation/hooks/use-create-supplier-payment-mutation";
import { usePropertiesListQuery } from "@/modules/properties/presentation/hooks/use-properties-list-query";
import { useCurrencyOptions } from "@/modules/finance/presentation/hooks/use-currency-options";
import { usePropertyContext } from "@/shared/providers/property-provider";

interface FormState {
  amount: string;
  currency: string;
  propertyId: string;
  notes: string;
}

const INITIAL_FORM: FormState = {
  amount: "",
  currency: "TJS",
  propertyId: "",
  notes: "",
};

type FormErrors = Partial<Record<"amount" | "propertyId", string>>;

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
  const { data: propertiesResult } = usePropertiesListQuery();
  const currencyOptions = useCurrencyOptions();
  const { currentPropertyId, hasProperty } = usePropertyContext();
  const properties = propertiesResult?.items ?? [];

  const propertyOptions = properties.map((p) => ({ value: p.id, label: p.name }));

  const [form, setForm] = useState<FormState>({ ...INITIAL_FORM, propertyId: currentPropertyId });
  const [errors, setErrors] = useState<FormErrors>({});

  const set = (key: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "amount" || key === "propertyId") {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key as "amount" | "propertyId"];
        return next;
      });
    }
  };

  const reset = () => {
    setForm({ ...INITIAL_FORM, propertyId: currentPropertyId });
    setErrors({});
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    const parsed = parseFloat(form.amount);
    if (!form.amount.trim() || isNaN(parsed) || parsed <= 0) {
      next.amount = "Введите корректную сумму";
    }
    if (!form.propertyId) {
      next.propertyId = "Выберите объект";
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
        propertyId: form.propertyId,
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
          options={currencyOptions}
          value={form.currency}
          onChange={(e) => set("currency")(e.target.value)}
        />
        {hasProperty ? (
          <AppInput
            label="Объект *"
            value={properties.find((p) => p.id === form.propertyId)?.name ?? ""}
            disabled
          />
        ) : (
          <AppSelect
            id="payment-property"
            label="Объект *"
            options={propertyOptions}
            value={form.propertyId}
            onChange={(e) => set("propertyId")(e.target.value)}
            {...(errors.propertyId ? { errorText: errors.propertyId } : {})}
          />
        )}
        <AppInput
          label="Заметки"
          value={form.notes}
          onChangeValue={set("notes")}
        />
      </Stack>
    </AppDrawerForm>
  );
}
