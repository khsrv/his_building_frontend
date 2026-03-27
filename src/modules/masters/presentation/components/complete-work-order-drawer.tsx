"use client";

import { useState } from "react";
import { Stack } from "@mui/material";
import { AppDrawerForm, AppInput } from "@/shared/ui";
import { useCompleteWorkOrderMutation } from "@/modules/masters/presentation/hooks/use-work-order-actions-mutation";
import { useI18n } from "@/shared/providers/locale-provider";

interface FormState {
  actualAmount: string;
  notes: string;
}

const INITIAL_FORM: FormState = {
  actualAmount: "",
  notes: "",
};

type FormErrors = Partial<Record<"actualAmount", string>>;

interface CompleteWorkOrderDrawerProps {
  open: boolean;
  workOrderId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CompleteWorkOrderDrawer({
  open,
  workOrderId,
  onClose,
  onSuccess,
}: CompleteWorkOrderDrawerProps) {
  const { t } = useI18n();
  const mutation = useCompleteWorkOrderMutation();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  const set = (key: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "actualAmount") {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.actualAmount;
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
    const amount = parseFloat(form.actualAmount);
    if (!form.actualAmount || isNaN(amount) || amount <= 0) {
      next.actualAmount = t("masters.workOrder.complete.validation.actualAmount");
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

    const amount = parseFloat(form.actualAmount);

    mutation.mutate(
      {
        id: workOrderId,
        input: {
          actualAmount: amount,
          notes: form.notes.trim() || undefined,
        },
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
      title={t("masters.workOrder.complete.title")}
      subtitle={t("masters.workOrder.complete.subtitle")}
      saveLabel={t("masters.workOrder.complete.save")}
      cancelLabel={t("common.cancel")}
      isSaving={mutation.isPending}
      onClose={handleClose}
      onSave={handleSave}
    >
      <Stack spacing={2}>
        <AppInput
          label={t("masters.workOrder.complete.fields.actualAmountRequired")}
          type="number"
          value={form.actualAmount}
          onChangeValue={set("actualAmount")}
          {...(errors.actualAmount ? { errorText: errors.actualAmount } : {})}
        />
        <AppInput
          label={t("masters.workOrder.complete.fields.notes")}
          value={form.notes}
          onChangeValue={set("notes")}
        />
      </Stack>
    </AppDrawerForm>
  );
}
