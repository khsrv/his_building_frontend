"use client";

import { useState } from "react";
import { Stack } from "@mui/material";
import { AppDrawerForm, AppInput, AppSelect } from "@/shared/ui";
import { useAddInteractionMutation } from "@/modules/clients/presentation/hooks/use-add-interaction-mutation";
import type { InteractionType } from "@/modules/clients/domain/client";
import { useI18n } from "@/shared/providers/locale-provider";

const INTERACTION_TYPES: readonly InteractionType[] = [
  "call",
  "meeting",
  "message",
  "email",
  "other",
];

function isInteractionType(value: string): value is InteractionType {
  return (INTERACTION_TYPES as readonly string[]).includes(value);
}

interface FormState {
  type: InteractionType;
  notes: string;
  nextContactDate: string;
}

const INITIAL_FORM: FormState = {
  type: "call",
  notes: "",
  nextContactDate: "",
};

type FormErrors = Partial<Record<"notes", string>>;

interface AddInteractionDrawerProps {
  clientId: string;
  open: boolean;
  onClose: () => void;
}

export function AddInteractionDrawer({ clientId, open, onClose }: AddInteractionDrawerProps) {
  const { t } = useI18n();
  const mutation = useAddInteractionMutation(clientId);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const interactionTypeOptions: Array<{ label: string; value: InteractionType }> = [
    { value: "call", label: t("clients.interaction.type.call") },
    { value: "meeting", label: t("clients.interaction.type.meeting") },
    { value: "message", label: t("clients.interaction.type.message") },
    { value: "email", label: "Email" },
    { value: "other", label: t("clients.interaction.type.other") },
  ];

  const reset = () => {
    setForm(INITIAL_FORM);
    setErrors({});
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.notes.trim()) next.notes = t("clients.interaction.validation.notesRequired");
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
        type: form.type,
        notes: form.notes.trim(),
        nextContactDate: form.nextContactDate || undefined,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      },
    );
  };

  return (
    <AppDrawerForm
      open={open}
      title={t("clients.interaction.title")}
      saveLabel={t("common.save")}
      cancelLabel={t("common.cancel")}
      isSaving={mutation.isPending}
      onClose={handleClose}
      onSave={handleSave}
    >
      <Stack spacing={2}>
        <AppSelect
          id="interaction-type"
          label={t("clients.interaction.fields.typeRequired")}
          options={interactionTypeOptions}
          value={form.type}
          onChange={(e) => {
            const v = e.target.value;
            if (isInteractionType(v)) {
              setForm((prev) => ({ ...prev, type: v }));
            }
          }}
        />

        <AppInput
          label={t("clients.interaction.fields.notesRequired")}
          value={form.notes}
          onChangeValue={(v) => {
            setForm((prev) => ({ ...prev, notes: v }));
            setErrors((prev) => {
              const next = { ...prev };
              delete next.notes;
              return next;
            });
          }}
          {...(errors.notes ? { errorText: errors.notes } : {})}
        />

        <AppInput
          label={t("clients.interaction.fields.nextContactDate")}
          type="date"
          value={form.nextContactDate}
          onChangeValue={(v) => setForm((prev) => ({ ...prev, nextContactDate: v }))}
        />
      </Stack>
    </AppDrawerForm>
  );
}
