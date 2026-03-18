import { AppPageHeader } from "@/shared/ui";

export default function AnalyticsKpiPage() {
  return (
    <main className="space-y-6 p-6">
      <AppPageHeader
        title="KPI"
        subtitle="Модуль в разработке"
        breadcrumbs={[
          { id: "home", label: "Панель", href: "/dashboard" },
          { id: "analytics", label: "Аналитика", href: "/analytics" },
          { id: "kpi", label: "KPI" },
        ]}
      />
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        <p className="text-lg">🚧 Раздел в разработке</p>
        <p className="mt-2 text-sm">Этот модуль будет доступен в ближайшее время</p>
      </div>
    </main>
  );
}
