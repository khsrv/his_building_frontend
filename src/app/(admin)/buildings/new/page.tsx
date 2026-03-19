"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AppButton, AppInput, AppPageHeader, AppSelect } from "@/shared/ui";
import { routes } from "@/shared/constants/routes";
import { useCreatePropertyMutation } from "@/modules/properties/presentation/hooks/use-create-property-mutation";
import type { CreatePropertyInput } from "@/modules/properties/domain/property";

interface FormState {
  name: string;
  propertyType: string;
  address: string;
  city: string;
  district: string;
  currency: string;
  constructionStartDate: string;
  constructionEndDate: string;
  description: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  propertyType: "residential_complex",
  address: "",
  city: "",
  district: "",
  currency: "USD",
  constructionStartDate: "",
  constructionEndDate: "",
  description: "",
};

export default function BuildingCreatePage() {
  const router = useRouter();
  const createMutation = useCreatePropertyMutation();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [nameError, setNameError] = useState<string | null>(null);

  const setField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "name") {
      setNameError(null);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setNameError("Название объекта обязательно");
      return;
    }

    const input: CreatePropertyInput = {
      name: form.name.trim(),
      propertyType: form.propertyType,
      address: form.address.trim() || undefined,
      city: form.city.trim() || undefined,
      district: form.district.trim() || undefined,
      description: form.description.trim() || undefined,
      currency: form.currency || undefined,
      constructionStartDate: form.constructionStartDate || undefined,
      constructionEndDate: form.constructionEndDate || undefined,
    };

    createMutation.mutate(input, {
      onSuccess: (created) => {
        router.push(routes.buildingDetail(created.id));
      },
    });
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <AppPageHeader
        breadcrumbs={[
          { id: "dashboard", label: "Панель", href: routes.dashboard },
          { id: "buildings", label: "Объекты", href: routes.buildings },
          { id: "new", label: "Новый" },
        ]}
        title="Новый объект"
      />

      <div className="rounded-xl border border-border bg-card p-4 md:p-6 shadow-sm">
        <form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div className="sm:col-span-2">
            <AppInput
              label="Название ЖК *"
              value={form.name}
              onChangeValue={(value) => setField("name", value)}
              {...(nameError ? { errorText: nameError } : {})}
              placeholder="Например: ЖК Сомон"
            />
          </div>

          <AppSelect
            id="property-type"
            label="Тип объекта"
            value={form.propertyType}
            options={[
              { value: "residential_complex", label: "Жилой комплекс" },
              { value: "apartment_building", label: "Жилой дом" },
              { value: "commercial", label: "Коммерческий" },
            ]}
            onChange={(event) => setField("propertyType", event.target.value)}
          />

          <AppSelect
            id="currency"
            label="Валюта"
            value={form.currency}
            options={[
              { value: "USD", label: "USD" },
              { value: "TJS", label: "TJS" },
              { value: "RUB", label: "RUB" },
            ]}
            onChange={(event) => setField("currency", event.target.value)}
          />

          <div className="sm:col-span-2">
            <AppInput
              label="Адрес"
              value={form.address}
              onChangeValue={(value) => setField("address", value)}
              placeholder="Город, улица, дом"
            />
          </div>

          <AppInput
            label="Город"
            value={form.city}
            onChangeValue={(value) => setField("city", value)}
            placeholder="Душанбе"
          />

          <AppInput
            label="Район"
            value={form.district}
            onChangeValue={(value) => setField("district", value)}
            placeholder="Сино"
          />

          <AppInput
            label="Дата начала строительства"
            type="date"
            value={form.constructionStartDate}
            onChangeValue={(value) => setField("constructionStartDate", value)}
          />

          <AppInput
            label="Плановая дата завершения"
            type="date"
            value={form.constructionEndDate}
            onChangeValue={(value) => setField("constructionEndDate", value)}
          />

          <div className="sm:col-span-2">
            <AppInput
              label="Описание"
              value={form.description}
              onChangeValue={(value) => setField("description", value)}
              placeholder="Короткое описание объекта"
            />
          </div>

          <div className="sm:col-span-2">
            <AppButton
              label={createMutation.isPending ? "Создаем..." : "Создать объект"}
              type="submit"
              variant="primary"
              disabled={createMutation.isPending}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
