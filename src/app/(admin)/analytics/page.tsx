import { AppPageHeader } from "@/shared/ui";

// TODO: Replace placeholder with actual analytics charts using AppChartWidget
export default function AnalyticsPage() {
  return (
    <main className="space-y-6 p-6">
      <AppPageHeader
        title="Аналитика"
        subtitle="Модуль в разработке"
        breadcrumbs={[
          { id: "home", label: "Панель", href: "/dashboard" },
          { id: "analytics", label: "Аналитика" },
        ]}
      />
      {/* Charts and dashboards will go here — use AppChartWidget for bar/line/pie */}
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        <p className="text-lg">🚧 Раздел в разработке</p>
        <p className="mt-2 text-sm">Этот модуль будет доступен в ближайшее время</p>
      </div>
    </main>
  );
}
