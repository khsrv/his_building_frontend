"use client";

import { useParams } from "next/navigation";
import { AppPageHeader, AppButton, AppStatusBadge } from "@/shared/ui";
import { routes } from "@/shared/constants/routes";

export default function LandParcelDetailPage() {
  const params = useParams();
  const _id = params.id as string;

  return (
    <div className="space-y-6">
      <AppPageHeader
        title="Участок — ул. Айни, 45"
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "land", label: "Земля", href: routes.land },
          { id: "detail", label: "Участок" },
        ]}
        actions={
          <AppButton label="Редактировать" variant="outline" />
        }
      />

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Информация об участке
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Адрес</p>
            <p className="text-sm font-medium text-foreground">г. Душанбе, ул. Айни, 45</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Кадастровый номер</p>
            <p className="text-sm font-medium text-foreground">01:05:0301001:1234</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Площадь</p>
            <p className="text-sm font-medium text-foreground">2 500 м²</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Статус</p>
            <div className="mt-0.5">
              <AppStatusBadge label="Оформлен" tone="success" />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Тип сделки</p>
            <p className="text-sm font-medium text-foreground">Покупка</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Продавец</p>
            <p className="text-sm font-medium text-foreground">ООО &quot;ЗемелСтрой&quot;</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Общая стоимость</p>
            <p className="text-sm font-bold text-foreground">1 200 000 USD</p>
          </div>
        </div>
      </div>
    </div>
  );
}
