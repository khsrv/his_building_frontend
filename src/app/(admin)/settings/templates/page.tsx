import { AppPageHeader } from "@/shared/ui";

export default function SettingsTemplatesPage() {
  return (
    <main className="space-y-6 p-6">
      <AppPageHeader
        title="Шаблоны"
        subtitle="Модуль в разработке"
        breadcrumbs={[
          { id: "home", label: "Панель", href: "/dashboard" },
          { id: "settings", label: "Настройки", href: "/settings" },
          { id: "templates", label: "Шаблоны" },
        ]}
      />
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        <p className="text-lg">🚧 Раздел в разработке</p>
        <p className="mt-2 text-sm">Этот модуль будет доступен в ближайшее время</p>
      </div>
    </main>
  );
}
