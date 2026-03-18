"use client";

import { useState } from "react";
import { AppPageHeader, AppButton, AppInput, AppSelect } from "@/shared/ui";
import { routes } from "@/shared/constants/routes";

const SOURCE_OPTIONS = [
  { label: "Instagram", value: "instagram" },
  { label: "Facebook", value: "facebook" },
  { label: "Сайт", value: "website" },
  { label: "Рекомендация", value: "referral" },
  { label: "Прямой", value: "direct" },
  { label: "Другое", value: "other" },
] as const;

export default function ClientCreatePage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState("");
  const [manager, setManager] = useState("");
  const [passport, setPassport] = useState("");

  return (
    <div className="space-y-6">
      <AppPageHeader
        title="Новый клиент"
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "clients", label: "Клиенты", href: routes.clients },
          { id: "new", label: "Новый" },
        ]}
      />

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Данные клиента
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AppInput
            label="ФИО"
            placeholder="Введите полное имя"
            value={fullName}
            onChangeValue={setFullName}
          />

          <AppInput
            label="Телефон"
            placeholder="+992 XX XXX XXXX"
            type="tel"
            value={phone}
            onChangeValue={setPhone}
          />

          <AppInput
            label="Email"
            placeholder="client@example.com"
            type="email"
            value={email}
            onChangeValue={setEmail}
          />

          <AppSelect
            label="Источник"
            options={[...SOURCE_OPTIONS]}
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />

          <AppInput
            label="Менеджер"
            placeholder="Имя менеджера"
            value={manager}
            onChangeValue={setManager}
          />

          <AppInput
            label="Паспорт"
            placeholder="Серия и номер паспорта"
            value={passport}
            onChangeValue={setPassport}
          />
        </div>

        <div className="mt-6 flex justify-end">
          {/* TODO: connect to RHF + Zod + mutation */}
          <AppButton
            label="Создать клиента"
            variant="primary"
            disabled
          />
        </div>
      </div>
    </div>
  );
}
