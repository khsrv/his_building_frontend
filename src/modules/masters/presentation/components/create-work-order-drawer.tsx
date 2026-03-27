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
import { usePropertyContext } from "@/shared/providers/property-provider";
import { useI18n } from "@/shared/providers/locale-provider";

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
  const { t } = useI18n();
  const mutation = useCreateWorkOrderMutation();
  const { currentPropertyId, hasProperty } = usePropertyContext();
  const [form, setForm] = useState<FormState>({ ...INITIAL_FORM, propertyId: currentPropertyId });
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
    setForm({ ...INITIAL_FORM, propertyId: currentPropertyId });
    setErrors({});
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.masterId) next.masterId = t("masters.workOrder.validation.selectMaster");
    if (!form.propertyId) next.propertyId = t("masters.workOrder.validation.selectProperty");
    if (!form.description.trim()) next.description = t("masters.workOrder.validation.descriptionRequired");
    const amount = parseFloat(form.plannedAmount);
    if (!form.plannedAmount || isNaN(amount) || amount <= 0) {
      next.plannedAmount = t("masters.workOrder.validation.amountValid");
    }
    if (!form.plannedStartDate) next.plannedStartDate = t("masters.workOrder.validation.startDateRequired");
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
      title={t("masters.workOrder.create.title")}
      subtitle={t("masters.workOrder.create.subtitle")}
      saveLabel={t("masters.workOrder.create.save")}
      cancelLabel={t("common.cancel")}
      isSaving={mutation.isPending}
      onClose={handleClose}
      onSave={handleSave}
    >
      <Stack spacing={2}>
        <AppSearchableSelect
          dialogTitle={t("masters.workOrder.dialog.selectMaster")}
          options={masterOptions}
          value={form.masterId}
          onChange={(id) => set("masterId")(id)}
          searchPlaceholder={t("masters.workOrder.search.master")}
          triggerLabel={
            masterOptions.find((o) => o.id === form.masterId)?.label ??
            t("masters.workOrder.fields.masterRequired")
          }
        />

        {hasProperty ? (
          <AppInput
            label={t("masters.workOrder.fields.propertyRequired")}
            value={buildingOptions.find((o) => o.id === form.propertyId)?.label ?? ""}
            disabled
          />
        ) : (
          <AppSearchableSelect
            dialogTitle={t("masters.workOrder.dialog.selectProperty")}
            options={buildingOptions}
            value={form.propertyId}
            onChange={(id) => set("propertyId")(id)}
            searchPlaceholder={t("masters.workOrder.search.property")}
            triggerLabel={
              buildingOptions.find((o) => o.id === form.propertyId)?.label ??
              t("masters.workOrder.fields.propertyRequired")
            }
          />
        )}

        <AppInput
          label={t("masters.workOrder.fields.descriptionRequired")}
          value={form.description}
          onChangeValue={set("description")}
          {...(errors.description ? { errorText: errors.description } : {})}
        />

        <AppInput
          label={t("masters.workOrder.fields.plannedAmountRequired")}
          type="number"
          value={form.plannedAmount}
          onChangeValue={set("plannedAmount")}
          {...(errors.plannedAmount ? { errorText: errors.plannedAmount } : {})}
        />

        <AppInput
          label={t("masters.workOrder.fields.startDateRequired")}
          type="date"
          value={form.plannedStartDate}
          onChangeValue={set("plannedStartDate")}
          {...(errors.plannedStartDate ? { errorText: errors.plannedStartDate } : {})}
        />

        <AppInput
          label={t("masters.workOrder.fields.endDatePlan")}
          type="date"
          value={form.plannedEndDate}
          onChangeValue={set("plannedEndDate")}
        />
      </Stack>
    </AppDrawerForm>
  );
}
