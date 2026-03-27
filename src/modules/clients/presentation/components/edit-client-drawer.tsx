"use client";

import { useState } from "react";
import { Stack } from "@mui/material";
import { AppDrawerForm, AppInput, AppSelect } from "@/shared/ui";
import { useUpdateClientMutation } from "@/modules/clients/presentation/hooks/use-update-client-mutation";
import type { Client, ClientSource } from "@/modules/clients/domain/client";
import { useI18n } from "@/shared/providers/locale-provider";

const SOURCE_VALUES: readonly ClientSource[] = [
  "instagram",
  "facebook",
  "website",
  "referral",
  "direct",
  "other",
];

function isClientSource(value: string): value is ClientSource {
  return SOURCE_VALUES.includes(value as ClientSource);
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

type FormErrors = Partial<Record<"fullName" | "phone", string>>;

function clientToForm(client: Client): FormState {
  return {
    fullName: client.fullName,
    phone: client.phone,
    extraPhone: client.extraPhone ?? "",
    whatsapp: client.whatsapp ?? "",
    telegram: client.telegram ?? "",
    email: client.email ?? "",
    address: client.address ?? "",
    source: client.source,
    notes: client.notes ?? "",
  };
}

interface EditClientFormProps {
  client: Client;
  onClose: () => void;
}

// Inner form — remounts when key changes (open/client id), providing clean initial state
function EditClientForm({ client, onClose }: EditClientFormProps) {
  const { t } = useI18n();
  const mutation = useUpdateClientMutation(client.id);
  const [form, setForm] = useState<FormState>(() => clientToForm(client));
  const [errors, setErrors] = useState<FormErrors>({});
  const sourceOptions: Array<{ label: string; value: ClientSource }> = [
    { value: "instagram", label: "Instagram" },
    { value: "facebook", label: "Facebook" },
    { value: "website", label: t("clients.source.website") },
    { value: "referral", label: t("clients.source.referral") },
    { value: "direct", label: t("clients.source.direct") },
    { value: "other", label: t("clients.source.other") },
  ];

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

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.fullName.trim()) next.fullName = t("clients.validation.fullNameRequired");
    if (!form.phone.trim()) next.phone = t("clients.validation.phoneRequired");
    setErrors(next);
    return Object.keys(next).length === 0;
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
          onClose();
        },
      },
    );
  };

  return (
    <AppDrawerForm
      open
      title={t("clients.edit.title")}
      saveLabel={t("common.save")}
      cancelLabel={t("common.cancel")}
      isSaving={mutation.isPending}
      onClose={onClose}
      onSave={handleSave}
    >
      <Stack spacing={2}>
        <AppInput
          label={t("clients.fields.fullName")}
          value={form.fullName}
          onChangeValue={set("fullName")}
          {...(errors.fullName ? { errorText: errors.fullName } : {})}
        />

        <AppInput
          label={t("clients.fields.phone")}
          value={form.phone}
          onChangeValue={set("phone")}
          {...(errors.phone ? { errorText: errors.phone } : {})}
        />

        <AppInput
          label={t("clients.fields.extraPhone")}
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
          id="edit-client-source"
          label={t("clients.fields.source")}
          options={sourceOptions}
          value={form.source}
          onChange={(e) => {
            const v = e.target.value;
            if (isClientSource(v)) set("source")(v);
          }}
        />

        <AppInput
          label={t("clients.fields.address")}
          value={form.address}
          onChangeValue={set("address")}
        />

        <AppInput
          label={t("clients.fields.notes")}
          value={form.notes}
          onChangeValue={set("notes")}
        />
      </Stack>
    </AppDrawerForm>
  );
}

interface EditClientDrawerProps {
  client: Client;
  open: boolean;
  onClose: () => void;
}

export function EditClientDrawer({ client, open, onClose }: EditClientDrawerProps) {
  if (!open) {
    return null;
  }

  // Re-mount EditClientForm with a fresh key each time the drawer opens
  return <EditClientForm key={`${client.id}_open`} client={client} onClose={onClose} />;
}
