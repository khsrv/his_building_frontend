"use client";

import { AppPageHeader, AppButton } from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import type { PageHeaderCrumb } from "@/shared/ui";

const breadcrumbs: readonly PageHeaderCrumb[] = [
  { id: "dashboard", label: "Панель", href: routes.dashboard },
  { id: "buildings", label: "Объекты", href: routes.buildings },
  { id: "new", label: "Новый" },
];

export default function BuildingCreatePage() {
  // TODO: Replace with RHF + Zod form (react-hook-form + zod schema)
  // TODO: Wire up mutation via TanStack Query

  return (
    <div className="space-y-6">
      <AppPageHeader breadcrumbs={breadcrumbs} title="Новый объект" />

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <form
          className="grid gap-5 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            // TODO: handle submit via mutation
          }}
        >
          {/* Название ЖК */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-sm font-medium text-foreground" htmlFor="name">
              Название ЖК
            </label>
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
              id="name"
              placeholder="Например: ЖК Сомон"
              type="text"
            />
          </div>

          {/* Адрес */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-sm font-medium text-foreground" htmlFor="address">
              Адрес
            </label>
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
              id="address"
              placeholder="Город, улица, номер дома"
              type="text"
            />
          </div>

          {/* Количество блоков */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="blocks">
              Количество блоков
            </label>
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
              id="blocks"
              min={1}
              placeholder="1"
              type="number"
            />
          </div>

          {/* Количество этажей */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="floors">
              Количество этажей
            </label>
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
              id="floors"
              min={1}
              placeholder="9"
              type="number"
            />
          </div>

          {/* Валюта */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="currency">
              Валюта
            </label>
            <select
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
              id="currency"
            >
              <option value="TJS">TJS — Сомони</option>
              <option value="USD">USD — Доллар</option>
            </select>
          </div>

          {/* Дата начала строительства */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="startDate">
              Дата начала строительства
            </label>
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
              id="startDate"
              type="date"
            />
          </div>

          {/* Плановая дата завершения */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="endDate">
              Плановая дата завершения
            </label>
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
              id="endDate"
              type="date"
            />
          </div>

          {/* Submit */}
          <div className="sm:col-span-2">
            {/* TODO: Enable when form is valid (RHF formState.isValid) */}
            <AppButton disabled label="Создать объект" type="submit" variant="primary" />
          </div>
        </form>
      </div>
    </div>
  );
}
