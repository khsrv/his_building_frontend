import { AppPageHeader } from "@/shared/ui";

export default function SettingsCompanyPage() {
  return (
    <main className="space-y-6 p-6">
      <AppPageHeader
        title="Компания"
        subtitle="Модуль в разработке"
        breadcrumbs={[
          { id: "home", label: "Панель", href: "/dashboard" },
          { id: "settings", label: "Настройки", href: "/settings" },
          { id: "company", label: "Компания" },
        ]}
      />
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        <p className="text-lg">🚧 Раздел в разработке</p>
        <p className="mt-2 text-sm">Этот модуль будет доступен в ближайшее время</p>
      </div>
    </main>
  );
}
