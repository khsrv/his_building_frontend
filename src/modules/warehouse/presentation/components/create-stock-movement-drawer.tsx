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
import { useI18n } from "@/shared/providers/locale-provider";

const MOVEMENT_TYPE_VALUES: readonly StockMovementType[] = [
  "income",
  "expense",
  "write_off",
  "return",
];

function isMovementType(value: string): value is StockMovementType {
  return MOVEMENT_TYPE_VALUES.includes(value as StockMovementType);
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
  const { t } = useI18n();
  const mutation = useCreateStockMovementMutation();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const movementTypeOptions: Array<{ label: string; value: StockMovementType }> = [
    { value: "income", label: t("warehouse.movement.type.income") },
    { value: "expense", label: t("warehouse.movement.type.expense") },
    { value: "write_off", label: t("warehouse.movement.type.writeOff") },
    { value: "return", label: t("warehouse.movement.type.return") },
  ];

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
    { label: t("warehouse.common.notSpecified"), value: "" },
    ...(buildingsQuery.data ?? []).map((b) => ({
      value: b.id,
      label: b.name,
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
    if (!form.materialId) next.materialId = t("warehouse.movement.validation.selectMaterial");
    const qty = parseFloat(form.quantity);
    if (!form.quantity || isNaN(qty) || qty <= 0) {
      next.quantity = t("warehouse.movement.validation.quantityValid");
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
      title={t("warehouse.movement.create.title")}
      subtitle={t("warehouse.movement.create.subtitle")}
      saveLabel={t("common.save")}
      cancelLabel={t("common.cancel")}
      isSaving={mutation.isPending}
      onClose={handleClose}
      onSave={handleSave}
    >
      <Stack spacing={2}>
        <AppSelect
          id="movement-type"
          label={t("warehouse.movement.fields.typeRequired")}
          options={movementTypeOptions}
          value={form.type}
          onChange={(e) => {
            const v = e.target.value;
            if (isMovementType(v)) set("type")(v);
          }}
        />

        <AppSearchableSelect
          dialogTitle={t("warehouse.movement.dialog.selectMaterial")}
          options={materialOptions}
          value={form.materialId}
          onChange={(id) => set("materialId")(id)}
          searchPlaceholder={t("warehouse.movement.search.material")}
          triggerLabel={
            materialOptions.find((o) => o.id === form.materialId)?.label ??
            t("warehouse.movement.fields.materialRequired")
          }
        />

        <AppInput
          label={t("warehouse.movement.fields.quantityRequired")}
          type="number"
          value={form.quantity}
          onChangeValue={set("quantity")}
          {...(errors.quantity ? { errorText: errors.quantity } : {})}
        />

        <AppInput
          label={t("warehouse.movement.fields.unitPrice")}
          type="number"
          value={form.unitPrice}
          onChangeValue={set("unitPrice")}
        />

        {showSupplierField ? (
          <AppSearchableSelect
            dialogTitle={t("warehouse.movement.dialog.selectSupplier")}
            options={supplierOptions}
            value={form.supplierId}
            onChange={(id) => set("supplierId")(id)}
            searchPlaceholder={t("warehouse.movement.search.supplier")}
            triggerLabel={
              supplierOptions.find((o) => o.id === form.supplierId)?.label ??
              t("warehouse.movement.fields.selectSupplier")
            }
          />
        ) : null}

        <AppSelect
          id="movement-property"
          label={t("warehouse.fields.property")}
          options={buildingOptions}
          value={form.propertyId}
          onChange={(e) => set("propertyId")(e.target.value)}
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
