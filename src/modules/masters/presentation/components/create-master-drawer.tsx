"use client";

import { useState } from "react";
import { Stack } from "@mui/material";
import { AppDrawerForm, AppInput, AppSelect } from "@/shared/ui";
import { useCreateMasterMutation } from "@/modules/masters/presentation/hooks/use-create-master-mutation";
import type { MasterType } from "@/modules/masters/domain/master";

const MASTER_TYPE_OPTIONS: Array<{ label: string; value: MasterType }> = [
  { value: "individual", label: "Индивидуал" },
  { value: "brigade", label: "Бригада" },
];

function isMasterType(value: string): value is MasterType {
  return MASTER_TYPE_OPTIONS.some((o) => o.value === value);
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

type FormErrors = Partial<Record<"name", string>>;

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
  const mutation = useCreateMasterMutation();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  const set = (key: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "name") {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.name;
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
    if (!form.name.trim()) next.name = "Имя обязательно";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = () => {
    if (!validate()) return;

    const dailyRateNum = parseFloat(form.dailyRate);

    mutation.mutate(
      {
        name: form.name.trim(),
        type: form.type,
        phone: form.phone.trim() || undefined,
        specialization: form.specialization.trim() || undefined,
        dailyRate: form.dailyRate && !isNaN(dailyRateNum) ? dailyRateNum : undefined,
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
      title="Добавить мастера"
      subtitle="Заполните информацию о мастере"
      saveLabel="Сохранить"
      cancelLabel="Отмена"
      isSaving={mutation.isPending}
      onClose={handleClose}
      onSave={handleSave}
    >
      <Stack spacing={2}>
        <AppInput
          label="Имя *"
          value={form.name}
          onChangeValue={set("name")}
          {...(errors.name ? { errorText: errors.name } : {})}
        />
        <AppSelect
          id="master-type"
          label="Тип *"
          options={MASTER_TYPE_OPTIONS}
          value={form.type}
          onChange={(e) => {
            const v = e.target.value;
            if (isMasterType(v)) set("type")(v);
          }}
        />
        <AppInput
          label="Телефон"
          value={form.phone}
          onChangeValue={set("phone")}
        />
        <AppInput
          label="Специализация"
          value={form.specialization}
          onChangeValue={set("specialization")}
        />
        <AppInput
          label="Ставка в день"
          type="number"
          value={form.dailyRate}
          onChangeValue={set("dailyRate")}
        />
      </Stack>
    </AppDrawerForm>
  );
}
