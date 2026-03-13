"use client";

import { useMemo } from "react";
import { useEffect, useState } from "react";
import { useUrlFilters } from "@/shared/hooks/use-url-filters";
import { AppButton } from "@/shared/ui/primitives/button";
import { AppInput } from "@/shared/ui/primitives/input";
import { AppSelect, type SelectOption } from "@/shared/ui/primitives/select";

export interface UrlFilterField {
  key: string;
  label: string;
  type: "text" | "select";
  placeholder?: string;
  options?: readonly SelectOption[];
}

interface AppUrlFilterBarProps {
  fields: readonly UrlFilterField[];
  applyLabel?: string;
  resetLabel?: string;
}

export function AppUrlFilterBar({
  fields,
  applyLabel = "Apply",
  resetLabel = "Reset",
}: AppUrlFilterBarProps) {
  const keys = useMemo(() => fields.map((field) => field.key), [fields]);
  const { filters, setFilters, clearFilters } = useUrlFilters({ keys });
  const [draft, setDraft] = useState<Record<string, string>>(filters);

  useEffect(() => {
    setDraft(filters);
  }, [filters]);

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {fields.map((field) => {
          if (field.type === "select") {
            return (
              <AppSelect
                key={field.key}
                label={field.label}
                onChange={(event) => setDraft((current) => ({ ...current, [field.key]: event.target.value }))}
                options={field.options ?? []}
                value={draft[field.key] ?? ""}
              />
            );
          }

          return (
            <AppInput
              key={field.key}
              label={field.label}
              onChangeValue={(value) => setDraft((current) => ({ ...current, [field.key]: value }))}
              placeholder={field.placeholder}
              value={draft[field.key] ?? ""}
            />
          );
        })}
      </div>

      <div className="flex justify-end gap-2 pt-3">
        <AppButton
          label={resetLabel}
          onClick={() => {
            clearFilters();
            setDraft(keys.reduce<Record<string, string>>((accumulator, key) => {
              accumulator[key] = "";
              return accumulator;
            }, {}));
          }}
          variant="secondary"
        />
        <AppButton label={applyLabel} onClick={() => setFilters(draft)} variant="primary" />
      </div>
    </div>
  );
}
