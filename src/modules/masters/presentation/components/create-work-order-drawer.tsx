"use client";

import { useState } from "react";
import { Stack } from "@mui/material";
import {
  AppDrawerForm,
  AppInput,
  AppSearchableSelect,
  type AppSearchableSelectOption,
} from "@/shared/ui";
import { useCreateWorkOrderMutation } from "@/modules/masters/presentation/hooks/use-create-work-order-mutation";
import { useMastersListQuery } from "@/modules/masters/presentation/hooks/use-masters-list-query";
import { useBuildingsQuery } from "@/modules/buildings/presentation/hooks/use-buildings.query";

interface FormState {
  masterId: string;
  propertyId: string;
  description: string;
  plannedAmount: string;
  plannedStartDate: string;
  plannedEndDate: string;
}

const INITIAL_FORM: FormState = {
  masterId: "",
  propertyId: "",
  description: "",
  plannedAmount: "",
  plannedStartDate: "",
  plannedEndDate: "",
};

type FormErrors = Partial<
  Record<"masterId" | "propertyId" | "description" | "plannedAmount" | "plannedStartDate", string>
>;

interface CreateWorkOrderDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateWorkOrderDrawer({
  open,
  onClose,
  onSuccess,
}: CreateWorkOrderDrawerProps) {
  const mutation = useCreateWorkOrderMutation();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  const mastersQuery = useMastersListQuery({ limit: 100 });
  const buildingsQuery = useBuildingsQuery();

  const masterOptions: AppSearchableSelectOption[] =
    (mastersQuery.data?.items ?? []).map((m) => ({
      id: m.id,
      label: m.name,
      ...(m.specialization ? { secondary: m.specialization } : {}),
    }));

  const buildingOptions: AppSearchableSelectOption[] =
    (buildingsQuery.data ?? []).map((b) => ({
      id: b.id,
      label: b.name,
    }));

  const set = (key: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    const errorKey = key as keyof FormErrors;
    setErrors((prev) => {
      const next = { ...prev };
      delete next[errorKey];
      return next;
    });
  };

  const reset = () => {
    setForm(INITIAL_FORM);
    setErrors({});
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.masterId) next.masterId = "Выберите мастера";
    if (!form.propertyId) next.propertyId = "Выберите объект";
    if (!form.description.trim()) next.description = "Описание обязательно";
    const amount = parseFloat(form.plannedAmount);
    if (!form.plannedAmount || isNaN(amount) || amount <= 0) {
      next.plannedAmount = "Введите корректную сумму";
    }
    if (!form.plannedStartDate) next.plannedStartDate = "Укажите дату начала";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = () => {
    if (!validate()) return;

    const amount = parseFloat(form.plannedAmount);

    mutation.mutate(
      {
        masterId: form.masterId,
        propertyId: form.propertyId,
        title: form.description.trim(),
        description: form.description.trim(),
        plannedAmount: amount,
        startedAt: form.plannedStartDate ? new Date(form.plannedStartDate).toISOString() : undefined,
        completedAt: form.plannedEndDate ? new Date(form.plannedEndDate).toISOString() : undefined,
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
      title="Создать наряд"
      subtitle="Заполните данные о наряде"
      saveLabel="Создать"
      cancelLabel="Отмена"
      isSaving={mutation.isPending}
      onClose={handleClose}
      onSave={handleSave}
    >
      <Stack spacing={2}>
        <AppSearchableSelect
          dialogTitle="Выберите мастера"
          options={masterOptions}
          value={form.masterId}
          onChange={(id) => set("masterId")(id)}
          searchPlaceholder="Поиск мастера..."
          triggerLabel={
            masterOptions.find((o) => o.id === form.masterId)?.label ??
            "Выберите мастера *"
          }
        />

        <AppSearchableSelect
          dialogTitle="Выберите объект"
          options={buildingOptions}
          value={form.propertyId}
          onChange={(id) => set("propertyId")(id)}
          searchPlaceholder="Поиск объекта..."
          triggerLabel={
            buildingOptions.find((o) => o.id === form.propertyId)?.label ??
            "Выберите объект *"
          }
        />

        <AppInput
          label="Описание *"
          value={form.description}
          onChangeValue={set("description")}
          {...(errors.description ? { errorText: errors.description } : {})}
        />

        <AppInput
          label="Плановая сумма *"
          type="number"
          value={form.plannedAmount}
          onChangeValue={set("plannedAmount")}
          {...(errors.plannedAmount ? { errorText: errors.plannedAmount } : {})}
        />

        <AppInput
          label="Дата начала *"
          type="date"
          value={form.plannedStartDate}
          onChangeValue={set("plannedStartDate")}
          {...(errors.plannedStartDate ? { errorText: errors.plannedStartDate } : {})}
        />

        <AppInput
          label="Дата окончания (план)"
          type="date"
          value={form.plannedEndDate}
          onChangeValue={set("plannedEndDate")}
        />
      </Stack>
    </AppDrawerForm>
  );
}
