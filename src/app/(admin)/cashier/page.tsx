"use client";

import { useRouter } from "next/navigation";
import { AppPageHeader } from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { CreateDealDrawer } from "@/modules/deals/presentation/components/create-deal-drawer";

export default function CashierPage() {
  const router = useRouter();

  return (
    <div className="space-y-6 p-4 md:p-6">
      <AppPageHeader
        title="Касса — оформление сделки"
        subtitle="Оформление продажи через рабочий flow создания сделки"
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "cashier", label: "Касса" },
        ]}
      />

      <CreateDealDrawer
        open
        onClose={() => {
          router.push(routes.deals);
        }}
      />
    </div>
  );
}
