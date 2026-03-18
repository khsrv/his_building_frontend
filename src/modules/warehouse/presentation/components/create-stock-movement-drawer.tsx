"use client";

import { useState } from "react";
import { Stack } from "@mui/material";
import {
  AppDrawerForm,
  AppInput,
  AppSelect,
  AppSearchableSelect,
  type AppSearchableSelectOption,
} from "@/shared/ui";

import { useCreateStockMovementMutation } from "@/modules/warehouse/presentation/hooks/use-create-stock-movement-mutation";
import { useMaterialsListQuery } from "@/modules/warehouse/presentation/hooks/use-materials-list-query";
import { useSuppliersListQuery } from "@/modules/warehouse/presentation/hooks/use-suppliers-list-query";
import { useBuildingsQuery } from "@/modules/buildings/presentation/hooks/use-buildings.query";
import type { StockMovementType } from "@/modules/warehouse/domain/warehouse";

const MOVEMENT_TYPE_OPTIONS: Array<{ label: string; value: StockMovementType }> = [
  { value: "income", label: "Приход" },
  { value: "expense", label: "Расход" },
  { value: "write_off", label: "Списание" },
  { value: "return", label: "Возврат" },
];

function isMovementType(value: string): value is StockMovementType {
  return MOVEMENT_TYPE_OPTIONS.some((o) => o.value === value);
}

interface FormState {
  type: StockMovementType;
  materialId: string;
  quantity: string;
  unitPrice: string;
  supplierId: string;
  propertyId: string;
  notes: string;
}

const INITIAL_FORM: FormState = {
  type: "income",
  materialId: "",
  quantity: "",
  unitPrice: "",
  supplierId: "",
  propertyId: "",
  notes: "",
};

type FormErrors = Partial<Record<"materialId" | "quantity", string>>;

interface CreateStockMovementDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateStockMovementDrawer({
  open,
  onClose,
  onSuccess,
}: CreateStockMovementDrawerProps) {
  const mutation = useCreateStockMovementMutation();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  const materialsQuery = useMaterialsListQuery({ limit: 100 });
  const suppliersQuery = useSuppliersListQuery({ limit: 100 });
  const buildingsQuery = useBuildingsQuery();

  const materialOptions: AppSearchableSelectOption[] =
    (materialsQuery.data?.items ?? []).map((m) => ({
      id: m.id,
      label: `${m.name} (${m.unit})`,
    }));

  const supplierOptions: AppSearchableSelectOption[] =
    (suppliersQuery.data?.items ?? []).map((s) => ({
      id: s.id,
      label: s.name,
    }));

  const buildingOptions: Array<{ label: string; value: string }> = [
    { label: "— Не указан —", value: "" },
    ...(buildingsQuery.data ?? []).map((b) => ({
      value: b.id,
      label: b.title,
    })),
  ];

  const showSupplierField = form.type === "income" || form.type === "return";

  const set = (key: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "materialId" || key === "quantity") {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key as "materialId" | "quantity"];
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
    if (!form.materialId) next.materialId = "Выберите материал";
    const qty = parseFloat(form.quantity);
    if (!form.quantity || isNaN(qty) || qty <= 0) {
      next.quantity = "Введите корректное количество";
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

    const qty = parseFloat(form.quantity);
    const unitPriceNum = parseFloat(form.unitPrice);

    mutation.mutate(
      {
        materialId: form.materialId,
        type: form.type,
        quantity: qty,
        unitPrice: form.unitPrice && !isNaN(unitPriceNum) ? unitPriceNum : undefined,
        supplierId: showSupplierField && form.supplierId ? form.supplierId : undefined,
        propertyId: form.propertyId || undefined,
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
      title="Добавить движение товара"
      subtitle="Заполните данные о движении"
      saveLabel="Сохранить"
      cancelLabel="Отмена"
      isSaving={mutation.isPending}
      onClose={handleClose}
      onSave={handleSave}
    >
      <Stack spacing={2}>
        <AppSelect
          id="movement-type"
          label="Тип движения *"
          options={MOVEMENT_TYPE_OPTIONS}
          value={form.type}
          onChange={(e) => {
            const v = e.target.value;
            if (isMovementType(v)) set("type")(v);
          }}
        />

        <AppSearchableSelect
          dialogTitle="Выберите материал"
          options={materialOptions}
          value={form.materialId}
          onChange={(id) => set("materialId")(id)}
          searchPlaceholder="Поиск материала..."
          triggerLabel={
            materialOptions.find((o) => o.id === form.materialId)?.label ??
            "Выберите материал *"
          }
        />

        <AppInput
          label="Количество *"
          type="number"
          value={form.quantity}
          onChangeValue={set("quantity")}
          {...(errors.quantity ? { errorText: errors.quantity } : {})}
        />

        <AppInput
          label="Цена за единицу"
          type="number"
          value={form.unitPrice}
          onChangeValue={set("unitPrice")}
        />

        {showSupplierField ? (
          <AppSearchableSelect
            dialogTitle="Выберите поставщика"
            options={supplierOptions}
            value={form.supplierId}
            onChange={(id) => set("supplierId")(id)}
            searchPlaceholder="Поиск поставщика..."
            triggerLabel={
              supplierOptions.find((o) => o.id === form.supplierId)?.label ??
              "Выберите поставщика"
            }
          />
        ) : null}

        <AppSelect
          id="movement-property"
          label="Объект"
          options={buildingOptions}
          value={form.propertyId}
          onChange={(e) => set("propertyId")(e.target.value)}
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
