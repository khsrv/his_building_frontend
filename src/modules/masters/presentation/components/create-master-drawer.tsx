"use client";

import { useState } from "react";
import { Stack } from "@mui/material";
import { AppDrawerForm, AppInput, AppSelect } from "@/shared/ui";
import { useCreateMasterMutation } from "@/modules/masters/presentation/hooks/use-create-master-mutation";
import type { MasterType } from "@/modules/masters/domain/master";
import { useI18n } from "@/shared/providers/locale-provider";

const MASTER_TYPE_VALUES: readonly MasterType[] = [
  "individual",
  "brigade",
];

function isMasterType(value: string): value is MasterType {
  return MASTER_TYPE_VALUES.includes(value as MasterType);
}

interface FormState {
  name: string;
  type: MasterType;
  phone: string;
  specialization: string;
  dailyRate: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  type: "individual",
  phone: "",
  specialization: "",
  dailyRate: "",
};

type FormErrors = Partial<Record<"name" | "phone" | "specialization", string>>;

interface CreateMasterDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateMasterDrawer({
  open,
  onClose,
  onSuccess,
}: CreateMasterDrawerProps) {
  const { t } = useI18n();
  const mutation = useCreateMasterMutation();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const masterTypeOptions: Array<{ label: string; value: MasterType }> = [
    { value: "individual", label: t("masters.type.individual") },
    { value: "brigade", label: t("masters.type.brigade") },
  ];

  const set = (key: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "name" || key === "phone" || key === "specialization") {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
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
    if (!form.name.trim()) next.name = t("masters.validation.nameRequired");
    if (!form.phone.trim()) next.phone = t("masters.validation.phoneRequired");
    if (!form.specialization.trim()) next.specialization = t("masters.validation.specializationRequired");
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
        fullName: form.name.trim(),
        phone: form.phone.trim(),
        specialization: form.specialization.trim(),
        companyName: form.type === "brigade" ? (form.name.trim() || undefined) : undefined,
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
      title={t("masters.create.title")}
      subtitle={t("masters.create.subtitle")}
      saveLabel={t("common.save")}
      cancelLabel={t("common.cancel")}
      isSaving={mutation.isPending}
      onClose={handleClose}
      onSave={handleSave}
    >
      <Stack spacing={2}>
        <AppInput
          label={t("masters.fields.nameRequired")}
          value={form.name}
          onChangeValue={set("name")}
          {...(errors.name ? { errorText: errors.name } : {})}
        />
        <AppSelect
          id="master-type"
          label={t("masters.fields.typeRequired")}
          options={masterTypeOptions}
          value={form.type}
          onChange={(e) => {
            const v = e.target.value;
            if (isMasterType(v)) set("type")(v);
          }}
        />
        <AppInput
          label={t("masters.fields.phoneRequired")}
          value={form.phone}
          onChangeValue={set("phone")}
          {...(errors.phone ? { errorText: errors.phone } : {})}
        />
        <AppInput
          label={t("masters.fields.specializationRequired")}
          value={form.specialization}
          onChangeValue={set("specialization")}
          {...(errors.specialization ? { errorText: errors.specialization } : {})}
        />
        <AppInput
          label={t("masters.fields.dailyRate")}
          type="number"
          value={form.dailyRate}
          onChangeValue={set("dailyRate")}
        />
      </Stack>
    </AppDrawerForm>
  );
}
