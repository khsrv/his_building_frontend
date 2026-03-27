"use client";

import { useState } from "react";
import { Stack } from "@mui/material";
import { AppDrawerForm, AppInput } from "@/shared/ui";
import { useCreateSupplierMutation } from "@/modules/warehouse/presentation/hooks/use-create-supplier-mutation";
import { useI18n } from "@/shared/providers/locale-provider";

interface FormState {
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
};

type FormErrors = Partial<Record<"name", string>>;

interface CreateSupplierDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateSupplierDrawer({
  open,
  onClose,
  onSuccess,
}: CreateSupplierDrawerProps) {
  const { t } = useI18n();
  const mutation = useCreateSupplierMutation();
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
    if (!form.name.trim()) next.name = t("warehouse.validation.nameRequired");
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
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
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
      title={t("warehouse.supplier.create.title")}
      subtitle={t("warehouse.supplier.create.subtitle")}
      saveLabel={t("common.save")}
      cancelLabel={t("common.cancel")}
      isSaving={mutation.isPending}
      onClose={handleClose}
      onSave={handleSave}
    >
      <Stack spacing={2}>
        <AppInput
          label={t("warehouse.fields.nameRequired")}
          value={form.name}
          onChangeValue={set("name")}
          {...(errors.name ? { errorText: errors.name } : {})}
        />
        <AppInput
          label={t("warehouse.fields.phone")}
          value={form.phone}
          onChangeValue={set("phone")}
        />
        <AppInput
          label="Email"
          value={form.email}
          onChangeValue={set("email")}
        />
        <AppInput
          label={t("warehouse.fields.address")}
          value={form.address}
          onChangeValue={set("address")}
        />
        <AppInput
          label={t("warehouse.fields.notes")}
          value={form.notes}
          onChangeValue={set("notes")}
        />
      </Stack>
    </AppDrawerForm>
  );
}
