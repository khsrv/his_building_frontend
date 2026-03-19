"use client";

import { useRouter } from "next/navigation";
import { AppPageHeader } from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { CreateDealDrawer } from "@/modules/deals/presentation/components/create-deal-drawer";

export default function DealCreatePage() {
  const router = useRouter();

  return (
    <div className="space-y-6 p-4 md:p-6">
      <AppPageHeader
        title="Новая сделка"
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "deals", label: "Сделки", href: routes.deals },
          { id: "new", label: "Новая" },
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
