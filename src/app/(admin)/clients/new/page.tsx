"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppPageHeader, AppButton, AppInput, AppSelect } from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { useCreateClientMutation } from "@/modules/clients/presentation/hooks/use-create-client-mutation";
import type { ClientSource, CreateClientInput } from "@/modules/clients/domain/client";

const SOURCE_OPTIONS: readonly { label: string; value: ClientSource }[] = [
  { label: "Instagram", value: "instagram" },
  { label: "Facebook", value: "facebook" },
  { label: "Сайт", value: "website" },
  { label: "Рекомендация", value: "referral" },
  { label: "Прямой", value: "direct" },
  { label: "Другое", value: "other" },
];

export default function ClientCreatePage() {
  const router = useRouter();
  const createMutation = useCreateClientMutation();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [extraPhone, setExtraPhone] = useState("");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState<ClientSource>("other");
  const [managerId, setManagerId] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Partial<Record<"fullName" | "phone", string>>>({});

  const handleSubmit = () => {
    const nextErrors: { fullName?: string; phone?: string } = {};
    if (!fullName.trim()) {
      nextErrors.fullName = "ФИО обязательно";
    }
    if (!phone.trim()) {
      nextErrors.phone = "Телефон обязателен";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const input: CreateClientInput = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      source,
      extraPhone: extraPhone.trim() || undefined,
      email: email.trim() || undefined,
      managerId: managerId.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    createMutation.mutate(input, {
      onSuccess: (created) => {
        router.push(routes.clientDetail(created.id));
      },
    });
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <AppPageHeader
        title="Новый клиент"
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "clients", label: "Клиенты", href: routes.clients },
          { id: "new", label: "Новый" },
        ]}
      />

      <div className="rounded-xl border border-border bg-card p-4 md:p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Данные клиента</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AppInput
            label="ФИО *"
            placeholder="Введите полное имя"
            value={fullName}
            onChangeValue={(value) => {
              setFullName(value);
              setErrors((prev) => {
                const next = { ...prev };
                delete next.fullName;
                return next;
              });
            }}
            {...(errors.fullName ? { errorText: errors.fullName } : {})}
          />

          <AppInput
            label="Телефон *"
            placeholder="+992 XX XXX XXXX"
            type="tel"
            value={phone}
            onChangeValue={(value) => {
              setPhone(value);
              setErrors((prev) => {
                const next = { ...prev };
                delete next.phone;
                return next;
              });
            }}
            {...(errors.phone ? { errorText: errors.phone } : {})}
          />

          <AppInput
            label="Доп. телефон"
            placeholder="+992 XX XXX XXXX"
            type="tel"
            value={extraPhone}
            onChangeValue={setExtraPhone}
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
            onChange={(e) => setSource(e.target.value as ClientSource)}
          />

          <AppInput
            label="ID менеджера"
            placeholder="UUID менеджера (опционально)"
            value={managerId}
            onChangeValue={setManagerId}
          />

          <div className="md:col-span-2">
            <AppInput
              label="Заметки"
              placeholder="Комментарий по клиенту"
              value={notes}
              onChangeValue={setNotes}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <AppButton
            label={createMutation.isPending ? "Создаем..." : "Создать клиента"}
            variant="primary"
            onClick={handleSubmit}
            disabled={createMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
}
