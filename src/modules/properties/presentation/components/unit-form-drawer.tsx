"use client";

import { useState } from "react";
import {
  AppDrawerForm,
  AppInput,
  AppSelect,
} from "@/shared/ui";
import { UnitPhotoManager } from "@/modules/properties/presentation/components/unit-photo-manager";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UnitFormValues {
  unitNumber: string;
  unitType: string;
  rooms: string;
  totalArea: string;
  livingArea: string;
  kitchenArea: string;
  balconyArea: string;
  pricePerSqm: string;
  finishing: string;
  description: string;
}

export const EMPTY_UNIT_FORM: UnitFormValues = {
  unitNumber: "",
  unitType: "apartment",
  rooms: "",
  totalArea: "",
  livingArea: "",
  kitchenArea: "",
  balconyArea: "",
  pricePerSqm: "",
  finishing: "",
  description: "",
};

const UNIT_TYPE_OPTIONS = [
  { value: "apartment", label: "Квартира" },
  { value: "commercial", label: "Коммерция" },
  { value: "parking", label: "Паркинг" },
  { value: "storage", label: "Кладовая" },
];

// ─── Props ───────────────────────────────────────────────────────────────────

interface UnitFormDrawerProps {
  open: boolean;
  mode: "create" | "edit";
  title: string;
  subtitle?: string | undefined;
  values: UnitFormValues;
  onChange: (values: UnitFormValues) => void;
  onSave: () => void;
  onClose: () => void;
  isSaving: boolean;
  /** Show unitNumber field (hide in edit mode if not editable) */
  showUnitNumber?: boolean | undefined;
  /** Photo props — only shown in edit mode when unitId is available */
  unitId?: string | undefined;
  propertyId?: string | undefined;
  photoUrls?: readonly string[] | undefined;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function UnitFormDrawer({
  open,
  mode,
  title,
  subtitle,
  values,
  onChange,
  onSave,
  onClose,
  isSaving,
  showUnitNumber = true,
  unitId,
  propertyId,
  photoUrls,
}: UnitFormDrawerProps) {
  const setField = (field: keyof UnitFormValues, value: string) => {
    onChange({ ...values, [field]: value });
  };

  const calculatedBasePrice =
    values.totalArea && values.pricePerSqm
      ? Math.round(parseFloat(values.totalArea) * parseFloat(values.pricePerSqm))
      : null;

  return (
    <AppDrawerForm
      open={open}
      title={title}
      subtitle={subtitle ?? ""}
      saveLabel={mode === "create" ? "Создать" : "Сохранить"}
      cancelLabel="Отмена"
      isSaving={isSaving}
      saveDisabled={mode === "create" && showUnitNumber && !values.unitNumber.trim()}
      onClose={onClose}
      onSave={onSave}
    >
      <div className="space-y-4">
        {showUnitNumber ? (
          <AppInput
            label="Номер квартиры"
            value={values.unitNumber}
            onChange={(e) => setField("unitNumber", e.target.value)}
            placeholder="101"
          />
        ) : null}

        <AppSelect
          label="Тип"
          value={values.unitType}
          onChange={(e) => setField("unitType", e.target.value)}
          options={UNIT_TYPE_OPTIONS}
        />

        <AppInput
          label="Комнат"
          value={values.rooms}
          onChange={(e) => setField("rooms", e.target.value)}
          type="number"
          placeholder="2"
        />

        <AppInput
          label="Общая площадь, м²"
          value={values.totalArea}
          onChange={(e) => setField("totalArea", e.target.value)}
          type="number"
          placeholder="65"
        />

        <AppInput
          label="Жилая площадь, м²"
          value={values.livingArea}
          onChange={(e) => setField("livingArea", e.target.value)}
          type="number"
          placeholder="42"
        />

        <AppInput
          label="Кухня, м²"
          value={values.kitchenArea}
          onChange={(e) => setField("kitchenArea", e.target.value)}
          type="number"
          placeholder="10"
        />

        <AppInput
          label="Балкон, м²"
          value={values.balconyArea}
          onChange={(e) => setField("balconyArea", e.target.value)}
          type="number"
          placeholder="4"
        />

        <AppInput
          label="Цена за м² ($)"
          value={values.pricePerSqm}
          onChange={(e) => setField("pricePerSqm", e.target.value)}
          type="number"
          placeholder="800"
        />

        {calculatedBasePrice !== null ? (
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Базовая цена: </span>
            <span className="font-semibold">
              ${calculatedBasePrice.toLocaleString("ru-RU")}
            </span>
          </div>
        ) : null}

        <AppInput
          label="Отделка"
          value={values.finishing}
          onChange={(e) => setField("finishing", e.target.value)}
          placeholder="Черновая"
        />

        <AppInput
          label="Описание"
          value={values.description}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="Доп. информация"
        />

        {/* Photos section — available for both create (after save) and edit */}
        {unitId && propertyId ? (
          <div className="pt-2">
            <UnitPhotoManager
              unitId={unitId}
              propertyId={propertyId}
              photoUrls={photoUrls ?? []}
            />
          </div>
        ) : null}
      </div>
    </AppDrawerForm>
  );
}
