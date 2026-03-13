import { StarterShowcase, TemplateList } from "@/modules/_template/presentation";

export default function AdminDashboardPage() {
  return (
    <main className="space-y-6 p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Replace this screen with your first module and keep route files composition-only.
        </p>
      </header>

      <StarterShowcase />
      <TemplateList />
    </main>
  );
}
