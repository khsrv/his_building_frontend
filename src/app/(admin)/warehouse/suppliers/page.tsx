import { AppPageHeader } from "@/shared/ui";

export default function WarehouseSuppliersPage() {
  return (
    <main className="space-y-6 p-6">
      <AppPageHeader
        title="Поставщики"
        subtitle="Модуль в разработке"
        breadcrumbs={[
          { id: "home", label: "Панель", href: "/dashboard" },
          { id: "warehouse", label: "Склад", href: "/warehouse" },
          { id: "suppliers", label: "Поставщики" },
        ]}
      />
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        <p className="text-lg">🚧 Раздел в разработке</p>
        <p className="mt-2 text-sm">Этот модуль будет доступен в ближайшее время</p>
      </div>
    </main>
  );
}
