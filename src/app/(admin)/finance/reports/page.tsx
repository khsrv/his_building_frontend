"use client";

import { AppPageHeader, AppStatePanel } from "@/shared/ui";
import { routes } from "@/shared/constants/routes";

export default function FinanceReportsPage() {
  return (
    <main className="space-y-6 p-6">
      <AppPageHeader
        title="Отчёты"
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "finance", label: "Финансы", href: routes.finance },
          { id: "reports", label: "Отчёты" },
        ]}
      />
      <AppStatePanel tone="empty" title="Отчёты — В разработке" description="Этот раздел находится в процессе разработки." />
    </main>
  );
}
