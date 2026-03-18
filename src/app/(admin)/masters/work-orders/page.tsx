import { AppPageHeader } from "@/shared/ui";

export default function WorkOrdersPage() {
  return (
    <main className="space-y-6 p-6">
      <AppPageHeader
        title="Наряды"
        subtitle="Модуль в разработке"
        breadcrumbs={[
          { id: "home", label: "Панель", href: "/dashboard" },
          { id: "masters", label: "Подрядчики", href: "/masters" },
          { id: "work-orders", label: "Наряды" },
        ]}
      />
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        <p className="text-lg">🚧 Раздел в разработке</p>
        <p className="mt-2 text-sm">Этот модуль будет доступен в ближайшее время</p>
      </div>
    </main>
  );
}
