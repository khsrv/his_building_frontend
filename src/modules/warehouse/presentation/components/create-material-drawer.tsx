"use client";

import { useState } from "react";
import { Stack } from "@mui/material";
import { AppDrawerForm, AppInput, AppSelect } from "@/shared/ui";
import { useCreateMaterialMutation } from "@/modules/warehouse/presentation/hooks/use-create-material-mutation";
import { usePropertyContext } from "@/shared/providers/property-provider";
import { usePropertiesListQuery } from "@/modules/properties/presentation/hooks/use-properties-list-query";
import type { MaterialUnit } from "@/modules/warehouse/domain/warehouse";

const UNIT_OPTIONS: Array<{ label: string; value: MaterialUnit }> = [
  { value: "tonne", label: "Тонна" },
  { value: "m3", label: "м³" },
  { value: "m2", label: "м²" },
  { value: "piece", label: "Штука" },
  { value: "package", label: "Упаковка" },
  { value: "kg", label: "кг" },
  { value: "litre", label: "Литр" },
  { value: "meter", label: "Метр" },
];

function isMaterialUnit(value: string): value is MaterialUnit {
  return UNIT_OPTIONS.some((o) => o.value === value);
}

interface FormState {
  name: string;
  unit: MaterialUnit;
  propertyId: string;
  minStock: string;
  description: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  unit: "piece",
  propertyId: "",
  minStock: "0",
  description: "",
};

type FormErrors = Partial<Record<"name", string>>;

interface CreateMaterialDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateMaterialDrawer({
  open,
  onClose,
  onSuccess,
}: CreateMaterialDrawerProps) {
  const mutation = useCreateMaterialMutation();
  const { currentPropertyId, hasProperty } = usePropertyContext();
  const { data: propertiesResult } = usePropertiesListQuery();
  const properties = propertiesResult?.items ?? [];
  const [form, setForm] = useState<FormState>({ ...INITIAL_FORM, propertyId: currentPropertyId });
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
    setForm({ ...INITIAL_FORM, propertyId: currentPropertyId });
    setErrors({});
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = "Название обязательно";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = () => {
    if (!validate()) return;

    const minStockNum = parseFloat(form.minStock);

    mutation.mutate(
      {
        name: form.name.trim(),
        unit: form.unit,
        propertyId: form.propertyId || undefined,
        minStock: isNaN(minStockNum) ? undefined : minStockNum,
        description: form.description.trim() || undefined,
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
      title="Добавить материал"
      subtitle="Заполните информацию о материале"
      saveLabel="Сохранить"
      cancelLabel="Отмена"
      isSaving={mutation.isPending}
      onClose={handleClose}
      onSave={handleSave}
    >
      <Stack spacing={2}>
        <AppInput
          label="Название *"
          value={form.name}
          onChangeValue={set("name")}
          {...(errors.name ? { errorText: errors.name } : {})}
        />
        <AppSelect
          id="material-unit"
          label="Единица измерения *"
          options={UNIT_OPTIONS}
          value={form.unit}
          onChange={(e) => {
            const v = e.target.value;
            if (isMaterialUnit(v)) set("unit")(v);
          }}
        />
        {hasProperty ? (
          <AppInput
            label="Объект"
            value={properties.find((p) => p.id === form.propertyId)?.name ?? "Общий"}
            disabled
          />
        ) : (
          <AppSelect
            id="material-property"
            label="Объект"
            options={[
              { value: "", label: "Общий (без привязки)" },
              ...properties.map((p) => ({ value: p.id, label: p.name })),
            ]}
            value={form.propertyId}
            onChange={(e) => set("propertyId")(e.target.value)}
          />
        )}
        <AppInput
          label="Минимальный остаток"
          type="number"
          value={form.minStock}
          onChangeValue={set("minStock")}
        />
        <AppInput
          label="Описание"
          value={form.description}
          onChangeValue={set("description")}
        />
      </Stack>
    </AppDrawerForm>
  );
}
