"use client";

import { useState, useMemo } from "react";
import {
  AppPageHeader,
  AppDataTable,
  AppDrawerForm,
  AppButton,
  AppInput,
  AppSelect,
  AppStatusBadge,
  AppActionMenu,
  ConfirmDialog,
  ShimmerBox,
  AppStatePanel,
  type AppDataTableColumn,
} from "@/shared/ui";
import type { ExpenseCategory } from "@/modules/finance/domain/finance";
import { useExpenseCategoriesQuery } from "@/modules/finance/presentation/hooks/use-expense-categories-query";
import { useCreateExpenseCategoryMutation } from "@/modules/finance/presentation/hooks/use-create-expense-category-mutation";
import { useDeleteExpenseCategoryMutation } from "@/modules/finance/presentation/hooks/use-delete-expense-category-mutation";

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ExpenseCategoriesPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formParentId, setFormParentId] = useState("");
  const [formSortOrder, setFormSortOrder] = useState("0");

  const categoriesQuery = useExpenseCategoriesQuery();
  const createMutation = useCreateExpenseCategoryMutation();
  const deleteMutation = useDeleteExpenseCategoryMutation();

  const categories = categoriesQuery.data ?? [];

  // Parent options for the select
  const parentOptions = useMemo(() => {
    const base = [{ value: "", label: "Без родителя (корневая)" }];
    return [
      ...base,
      ...categories.map((c) => ({ value: c.id, label: c.name })),
    ];
  }, [categories]);

  function resetForm() {
    setFormName("");
    setFormSlug("");
    setFormParentId("");
    setFormSortOrder("0");
  }

  const columns: readonly AppDataTableColumn<ExpenseCategory>[] = [
    {
      id: "name",
      header: "Название",
      cell: (row) => (
        <span className="flex items-center gap-2">
          {row.parentId ? (
            <span className="text-muted-foreground">└</span>
          ) : null}
          <span className={row.parentId ? "" : "font-semibold"}>{row.name}</span>
        </span>
      ),
      searchAccessor: (row) => row.name,
      sortAccessor: (row) => row.name,
    },
    {
      id: "parent",
      header: "Родитель",
      cell: (row) => row.parentName ?? "—",
    },
    {
      id: "children",
      header: "Подкатегорий",
      cell: (row) =>
        row.childrenCount > 0 ? (
          <AppStatusBadge label={String(row.childrenCount)} tone="info" />
        ) : (
          "—"
        ),
      sortAccessor: (row) => row.childrenCount,
      align: "center",
    },
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
                {
                  id: "delete",
                  label: "Удалить",
                  destructive: true,
                  onClick: () => setDeleteId(row.id),
                },
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
        title="Категории расходов"
        subtitle="Управление категориями для классификации расходов"
        breadcrumbs={[
          { id: "home", label: "Панель", href: "/dashboard" },
          { id: "finance", label: "Финансы", href: "/finance" },
          { id: "categories", label: "Категории расходов" },
        ]}
        actions={
          <AppButton
            label="Добавить категорию"
            variant="primary"
            onClick={() => { resetForm(); setDrawerOpen(true); }}
          />
        }
      />

      {categoriesQuery.isLoading ? (
        <ShimmerBox className="h-64" />
      ) : categoriesQuery.isError ? (
        <AppStatePanel
          tone="error"
          title="Ошибка"
          description="Не удалось загрузить категории"
        />
      ) : categories.length === 0 ? (
        <AppStatePanel
          tone="empty"
          title="Нет категорий"
          description="Создайте первую категорию расходов"
        />
      ) : (
        <AppDataTable<ExpenseCategory>
          title="Категории"
          data={categories}
          columns={columns}
          rowKey={(row) => row.id}
          searchPlaceholder="Поиск по названию..."
          enableExport={false}
        />
      )}

      {/* Create drawer */}
      <AppDrawerForm
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Новая категория"
        onSave={() => {
          if (!formName || !formSlug) return;
          createMutation.mutate(
            {
              name: formName,
              slug: formSlug,
              parentId: formParentId || undefined,
              sortOrder: Number(formSortOrder) || undefined,
            },
            { onSuccess: () => { setDrawerOpen(false); resetForm(); } },
          );
        }}
        saveLabel="Создать"
        isSaving={createMutation.isPending}
      >
        <div className="space-y-4">
          <AppInput
            id="cat-name"
            label="Название"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />
          <AppInput
            id="cat-slug"
            label="Slug"
            value={formSlug}
            onChange={(e) => setFormSlug(e.target.value)}
            required
            placeholder="e.g. materials, labor, transport"
          />
          <AppSelect
            id="cat-parent"
            label="Родительская категория"
            options={parentOptions}
            value={formParentId}
            onChange={(e) => setFormParentId(e.target.value)}
          />
          <AppInput
            id="cat-order"
            label="Порядок сортировки"
            type="number"
            value={formSortOrder}
            onChange={(e) => setFormSortOrder(e.target.value)}
          />
        </div>
      </AppDrawerForm>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        title="Удалить категорию"
        message="Вы уверены? Подкатегории этой категории станут корневыми."
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
