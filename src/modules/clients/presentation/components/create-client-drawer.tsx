"use client";

import { useState } from "react";
import { Stack } from "@mui/material";
import { AppDrawerForm, AppInput, AppSelect } from "@/shared/ui";
import { useCreateClientMutation } from "@/modules/clients/presentation/hooks/use-create-client-mutation";
import type { ClientSource } from "@/modules/clients/domain/client";

const SOURCE_OPTIONS: Array<{ label: string; value: ClientSource }> = [
  { value: "website", label: "Сайт" },
  { value: "phone", label: "Телефон" },
  { value: "walk_in", label: "Визит" },
  { value: "referral", label: "Рекомендация" },
  { value: "broker", label: "Брокер" },
  { value: "social_media", label: "Соцсети" },
  { value: "advertising", label: "Реклама" },
  { value: "other", label: "Другое" },
];

function isClientSource(value: string): value is ClientSource {
  return SOURCE_OPTIONS.some((o) => o.value === value);
}

interface FormState {
  fullName: string;
  phone: string;
  extraPhone: string;
  whatsapp: string;
  telegram: string;
  email: string;
  address: string;
  source: ClientSource;
  notes: string;
}

const INITIAL_FORM: FormState = {
  fullName: "",
  phone: "",
  extraPhone: "",
  whatsapp: "",
  telegram: "",
  email: "",
  address: "",
  source: "other",
  notes: "",
};

type FormErrors = Partial<Record<"fullName" | "phone", string>>;

interface CreateClientDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateClientDrawer({ open, onClose, onSuccess }: CreateClientDrawerProps) {
  const mutation = useCreateClientMutation();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  const set = (key: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "fullName" || key === "phone") {
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
    if (!form.fullName.trim()) next.fullName = "ФИО обязательно";
    if (!form.phone.trim()) next.phone = "Телефон обязателен";
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
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        source: form.source,
        extraPhone: form.extraPhone.trim() || undefined,
        whatsapp: form.whatsapp.trim() || undefined,
        telegram: form.telegram.trim() || undefined,
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
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
      title="Добавить клиента"
      subtitle="Заполните информацию о новом клиенте"
      saveLabel="Сохранить"
      cancelLabel="Отмена"
      isSaving={mutation.isPending}
      onClose={handleClose}
      onSave={handleSave}
    >
      <Stack spacing={2}>
        <AppInput
          label="ФИО *"
          value={form.fullName}
          onChangeValue={set("fullName")}
          {...(errors.fullName ? { errorText: errors.fullName } : {})}
        />

        <AppInput
          label="Телефон *"
          value={form.phone}
          onChangeValue={set("phone")}
          {...(errors.phone ? { errorText: errors.phone } : {})}
        />

        <AppInput
          label="Доп. телефон"
          value={form.extraPhone}
          onChangeValue={set("extraPhone")}
        />

        <AppInput
          label="WhatsApp"
          value={form.whatsapp}
          onChangeValue={set("whatsapp")}
        />

        <AppInput
          label="Telegram"
          value={form.telegram}
          onChangeValue={set("telegram")}
        />

        <AppInput
          label="Email"
          value={form.email}
          onChangeValue={set("email")}
        />

        <AppSelect
          id="client-source"
          label="Источник *"
          options={SOURCE_OPTIONS}
          value={form.source}
          onChange={(e) => {
            const v = e.target.value;
            if (isClientSource(v)) set("source")(v);
          }}
        />

        <AppInput
          label="Адрес"
          value={form.address}
          onChangeValue={set("address")}
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
