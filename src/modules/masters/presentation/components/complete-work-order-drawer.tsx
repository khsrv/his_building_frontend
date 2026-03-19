"use client";

import { useState } from "react";
import { Stack } from "@mui/material";
import { AppDrawerForm, AppInput } from "@/shared/ui";
import { useCompleteWorkOrderMutation } from "@/modules/masters/presentation/hooks/use-work-order-actions-mutation";

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
      next.actualAmount = "Фактическая сумма должна быть больше 0";
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
      title="Завершить наряд"
      subtitle="Укажите фактическую сумму выполненных работ"
      saveLabel="Завершить"
      cancelLabel="Отмена"
      isSaving={mutation.isPending}
      onClose={handleClose}
      onSave={handleSave}
    >
      <Stack spacing={2}>
        <AppInput
          label="Фактическая сумма *"
          type="number"
          value={form.actualAmount}
          onChangeValue={set("actualAmount")}
          {...(errors.actualAmount ? { errorText: errors.actualAmount } : {})}
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
