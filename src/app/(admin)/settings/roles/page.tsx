"use client";

import { useRouter } from "next/navigation";
import { AppButton, AppDataTable, type AppDataTableColumn, AppKpiGrid, AppPageHeader, AppStatePanel } from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { useUsersListQuery } from "@/modules/admin/presentation/hooks/use-users-list-query";
import type { BackendRole } from "@/modules/admin/domain/admin";

const ROLE_LABELS: Record<BackendRole, string> = {
  super_admin: "Супер-админ",
  company_admin: "Администратор",
  sales_head: "Руководитель продаж",
  manager: "Менеджер",
  accountant: "Бухгалтер",
  cashier: "Кассир",
  foreman: "Прораб",
  warehouse_manager: "Кладовщик",
  broker: "Брокер",
};

interface RoleSummaryRow {
  role: BackendRole;
  label: string;
  users: number;
  activeUsers: number;
  blockedUsers: number;
}

const columns: readonly AppDataTableColumn<RoleSummaryRow>[] = [
  {
    id: "label",
    header: "Роль",
    cell: (row) => row.label,
    sortAccessor: (row) => row.label,
    searchAccessor: (row) => row.label,
  },
  {
    id: "users",
    header: "Пользователей",
    cell: (row) => row.users,
    sortAccessor: (row) => row.users,
    align: "right",
  },
  {
    id: "activeUsers",
    header: "Активных",
    cell: (row) => row.activeUsers,
    sortAccessor: (row) => row.activeUsers,
    align: "right",
  },
  {
    id: "blockedUsers",
    header: "Заблокированных",
    cell: (row) => row.blockedUsers,
    sortAccessor: (row) => row.blockedUsers,
    align: "right",
  },
];

export default function SettingsRolesPage() {
  const router = useRouter();
  const usersQuery = useUsersListQuery({ limit: 300 });

  if (usersQuery.isError) {
    return (
      <main className="space-y-6 p-4 md:p-6">
        <AppPageHeader
          title="Роли и права"
          breadcrumbs={[
            { id: "dashboard", label: "Панель", href: routes.dashboard },
            { id: "settings", label: "Настройки", href: routes.settings },
            { id: "roles", label: "Роли и права" },
          ]}
        />
        <AppStatePanel
          tone="error"
          title="Ошибка загрузки"
          description="Не удалось загрузить распределение ролей."
        />
      </main>
    );
  }

  const users = usersQuery.data?.items ?? [];

  const rows: RoleSummaryRow[] = (Object.keys(ROLE_LABELS) as BackendRole[])
    .map((role) => {
      const byRole = users.filter((user) => user.role === role);
      const activeUsers = byRole.filter((user) => user.canLogin).length;
      return {
        role,
        label: ROLE_LABELS[role],
        users: byRole.length,
        activeUsers,
        blockedUsers: byRole.length - activeUsers,
      };
    })
    .filter((row) => row.users > 0)
    .sort((a, b) => b.users - a.users);

  return (
    <main className="space-y-6 p-4 md:p-6">
      <AppPageHeader
        title="Роли и права"
        subtitle="Сводка по ролям на основе текущих пользователей"
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "settings", label: "Настройки", href: routes.settings },
          { id: "roles", label: "Роли и права" },
        ]}
        actions={
          <AppButton
            label="Управлять пользователями"
            variant="primary"
            onClick={() => router.push(routes.settingsUsers)}
          />
        }
      />

      <AppKpiGrid
        columns={3}
        items={[
          { title: "Всего ролей в использовании", value: rows.length, deltaTone: "info" },
          { title: "Всего пользователей", value: users.length, deltaTone: "success" },
          {
            title: "Заблокированных",
            value: users.filter((user) => !user.canLogin).length,
            deltaTone: "danger",
          },
        ]}
      />

      <AppDataTable<RoleSummaryRow>
        data={rows}
        columns={columns}
        rowKey={(row) => row.role}
        title="Распределение ролей"
        searchPlaceholder="Поиск по роли..."
      />
    </main>
  );
}
