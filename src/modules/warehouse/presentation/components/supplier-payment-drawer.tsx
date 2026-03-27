"use client";

import { useState } from "react";
import { Stack } from "@mui/material";
import { AppDrawerForm, AppInput, AppSelect } from "@/shared/ui";
import { useCreateSupplierPaymentMutation } from "@/modules/warehouse/presentation/hooks/use-create-supplier-payment-mutation";
import { usePropertiesListQuery } from "@/modules/properties/presentation/hooks/use-properties-list-query";
import { useCurrencyOptions } from "@/modules/finance/presentation/hooks/use-currency-options";
import { usePropertyContext } from "@/shared/providers/property-provider";
import { useI18n } from "@/shared/providers/locale-provider";

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
  const { t } = useI18n();
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
      next.amount = t("warehouse.supplierPayment.validation.amountValid");
    }
    if (!form.propertyId) {
      next.propertyId = t("warehouse.supplierPayment.validation.selectProperty");
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
      title={t("warehouse.supplierPayment.title")}
      subtitle={t("warehouse.supplierPayment.subtitle")}
      saveLabel={t("warehouse.supplierPayment.save")}
      cancelLabel={t("common.cancel")}
      isSaving={mutation.isPending}
      onClose={handleClose}
      onSave={handleSave}
    >
      <Stack spacing={2}>
        <AppInput
          label={t("warehouse.supplierPayment.fields.amountRequired")}
          type="number"
          value={form.amount}
          onChangeValue={set("amount")}
          {...(errors.amount ? { errorText: errors.amount } : {})}
        />
        <AppSelect
          id="payment-currency"
          label={t("warehouse.supplierPayment.fields.currency")}
          options={currencyOptions}
          value={form.currency}
          onChange={(e) => set("currency")(e.target.value)}
        />
        {hasProperty ? (
          <AppInput
            label={t("warehouse.supplierPayment.fields.propertyRequired")}
            value={properties.find((p) => p.id === form.propertyId)?.name ?? ""}
            disabled
          />
        ) : (
          <AppSelect
            id="payment-property"
            label={t("warehouse.supplierPayment.fields.propertyRequired")}
            options={propertyOptions}
            value={form.propertyId}
            onChange={(e) => set("propertyId")(e.target.value)}
            {...(errors.propertyId ? { errorText: errors.propertyId } : {})}
          />
        )}
        <AppInput
          label={t("warehouse.fields.notes")}
          value={form.notes}
          onChangeValue={set("notes")}
        />
      </Stack>
    </AppDrawerForm>
  );
}
