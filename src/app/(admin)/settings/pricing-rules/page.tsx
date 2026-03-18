"use client";

import { useState } from "react";
import {
  AppPageHeader,
  AppDataTable,
  AppDrawerForm,
  AppButton,
  AppInput,
  AppSelect,
  AppActionMenu,
  ConfirmDialog,
  ShimmerBox,
  AppStatePanel,
  type AppDataTableColumn,
} from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import type { PricingRule } from "@/modules/advanced/domain/advanced";
import { usePricingRulesQuery } from "@/modules/advanced/presentation/hooks/use-pricing-rules-query";
import { useCreatePricingRuleMutation } from "@/modules/advanced/presentation/hooks/use-create-pricing-rule-mutation";
import { useDeletePricingRuleMutation } from "@/modules/advanced/presentation/hooks/use-delete-pricing-rule-mutation";

// ─── Columns ────────────────────────────────────────────────────────────────

const BASE_COLUMNS: readonly AppDataTableColumn<PricingRule>[] = [
  {
    id: "name",
    header: "Название",
    cell: (row) => row.name,
    sortAccessor: (row) => row.name,
    searchAccessor: (row) => row.name,
  },
  {
    id: "ruleType",
    header: "Тип правила",
    cell: (row) => row.ruleType,
    sortAccessor: (row) => row.ruleType,
  },
  {
    id: "conditionValue",
    header: "Условие",
    cell: (row) => (row.conditionValue !== null ? row.conditionValue.toString() : "—"),
    sortAccessor: (row) => row.conditionValue ?? 0,
    align: "right",
  },
  {
    id: "adjustmentPct",
    header: "Корректировка (%)",
    cell: (row) => `${row.adjustmentPct}%`,
    sortAccessor: (row) => row.adjustmentPct,
    align: "right",
  },
  {
    id: "priority",
    header: "Приоритет",
    cell: (row) => row.priority,
    sortAccessor: (row) => row.priority,
    align: "right",
  },
  {
    id: "validFrom",
    header: "Действует с",
    cell: (row) => (row.validFrom ? new Date(row.validFrom).toLocaleDateString("ru-RU") : "—"),
    sortAccessor: (row) => row.validFrom ?? "",
  },
  {
    id: "validTo",
    header: "Действует до",
    cell: (row) => (row.validTo ? new Date(row.validTo).toLocaleDateString("ru-RU") : "—"),
    sortAccessor: (row) => row.validTo ?? "",
  },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function PricingRulesPage() {
  // Filter
  const [selectedPropertyId, setSelectedPropertyId] = useState("");

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [name, setName] = useState("");
  const [ruleType, setRuleType] = useState("floor");
  const [conditionValue, setConditionValue] = useState("");
  const [adjustmentPct, setAdjustmentPct] = useState("");
  const [priority, setPriority] = useState("0");
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Queries & mutations
  const rulesQuery = usePricingRulesQuery(selectedPropertyId || undefined);
  const createMutation = useCreatePricingRuleMutation();
  const deleteMutation = useDeletePricingRuleMutation();

  const rules = rulesQuery.data ?? [];

  function resetForm() {
    setName("");
    setRuleType("floor");
    setConditionValue("");
    setAdjustmentPct("");
    setPriority("0");
    setValidFrom("");
    setValidTo("");
  }

  function handleSave() {
    if (!name || !adjustmentPct || !selectedPropertyId) return;
    createMutation.mutate(
      {
        propertyId: selectedPropertyId,
        name,
        ruleType,
        conditionValue: conditionValue ? Number(conditionValue) : undefined,
        adjustmentPct: Number(adjustmentPct),
        priority: priority ? Number(priority) : undefined,
        validFrom: validFrom || undefined,
        validTo: validTo || undefined,
      },
      { onSuccess: () => { setDrawerOpen(false); resetForm(); } },
    );
  }

  const columnsWithActions: readonly AppDataTableColumn<PricingRule>[] = [
    ...BASE_COLUMNS,
    {
      id: "actions",
      header: "",
      cell: (row) => (
        <AppActionMenu
          triggerLabel="Действия"
          groups={[
            {
              id: "main",
              items: [
                { id: "delete", label: "Удалить", destructive: true, onClick: () => setDeleteId(row.id) },
              ],
            },
          ]}
        />
      ),
      align: "right",
    },
  ];

  return (
    <main className="space-y-6 p-6">
      <AppPageHeader
        title="Правила ценообразования"
        subtitle="Настройка правил корректировки цен"
        breadcrumbs={[
          { id: "home", label: "Панель", href: routes.dashboard },
          { id: "settings", label: "Настройки", href: routes.settings },
          { id: "pricing-rules", label: "Правила цен" },
        ]}
        actions={
          <AppButton
            label="Добавить правило"
            variant="primary"
            onClick={() => { resetForm(); setDrawerOpen(true); }}
            disabled={!selectedPropertyId}
          />
        }
      />

      {/* Property filter */}
      <div className="max-w-xs">
        <AppInput
          id="property-filter"
          label="ID объекта (фильтр)"
          value={selectedPropertyId}
          onChange={(e) => setSelectedPropertyId(e.target.value)}
          placeholder="Введите ID объекта"
        />
      </div>

      {!selectedPropertyId ? (
        <AppStatePanel tone="empty" title="Выберите объект" description="Введите ID объекта для просмотра правил ценообразования" />
      ) : rulesQuery.isLoading ? (
        <ShimmerBox className="h-64" />
      ) : rulesQuery.isError ? (
        <AppStatePanel tone="error" title="Ошибка" description="Не удалось загрузить правила" />
      ) : (
        <AppDataTable<PricingRule>
          title="Правила ценообразования"
          data={rules}
          columns={columnsWithActions}
          rowKey={(row) => row.id}
          enableExport={false}
        />
      )}

      {/* Create drawer */}
      <AppDrawerForm
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); resetForm(); }}
        title="Новое правило"
        onSave={handleSave}
        saveLabel="Создать"
        isSaving={createMutation.isPending}
      >
        <div className="space-y-4">
          <AppInput
            id="rule-name"
            label="Название"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Наценка за этаж"
          />
          <AppSelect
            id="rule-type"
            label="Тип правила"
            value={ruleType}
            onChange={(e) => setRuleType(e.target.value)}
            options={[
              { value: "floor", label: "Этаж" },
              { value: "area", label: "Площадь" },
              { value: "view", label: "Вид" },
              { value: "season", label: "Сезон" },
              { value: "early_bird", label: "Ранняя покупка" },
            ]}
          />
          <AppInput
            id="rule-condition"
            label="Значение условия"
            type="number"
            value={conditionValue}
            onChange={(e) => setConditionValue(e.target.value)}
            placeholder="Числовое значение"
          />
          <AppInput
            id="rule-adjustment"
            label="Корректировка (%)"
            type="number"
            value={adjustmentPct}
            onChange={(e) => setAdjustmentPct(e.target.value)}
            required
            placeholder="5.0"
          />
          <AppInput
            id="rule-priority"
            label="Приоритет"
            type="number"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            placeholder="0"
          />
          <AppInput
            id="rule-valid-from"
            label="Действует с"
            type="date"
            value={validFrom}
            onChange={(e) => setValidFrom(e.target.value)}
          />
          <AppInput
            id="rule-valid-to"
            label="Действует до"
            type="date"
            value={validTo}
            onChange={(e) => setValidTo(e.target.value)}
          />
        </div>
      </AppDrawerForm>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        title="Удалить правило"
        message="Вы уверены, что хотите удалить это правило ценообразования?"
        confirmText="Удалить"
        cancelText="Отмена"
        destructive
        onConfirm={() => {
          if (deleteId) {
            deleteMutation.mutate(deleteId, {
              onSuccess: () => setDeleteId(null),
            });
          }
        }}
        onClose={() => setDeleteId(null)}
      />
    </main>
  );
}
