"use client";

import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { Autocomplete, Chip, Paper, TextField } from "@mui/material";
import { useI18n } from "@/shared/providers/locale-provider";

export interface AppTagOption {
  id: string;
  label: string;
  color?: string;
}

interface AppTagInputProps {
  value: readonly string[];
  onChange: (ids: string[]) => void;
  options?: readonly AppTagOption[];
  allowCreate?: boolean;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  maxTags?: number;
  className?: string;
  size?: "small" | "medium";
}

export function AppTagInput({
  value,
  onChange,
  options = [],
  allowCreate = true,
  placeholder,
  label,
  disabled = false,
  maxTags,
  className,
  size = "small",
}: AppTagInputProps) {
  const { t } = useI18n();
  const [inputValue, setInputValue] = useState("");
  const deferredInput = useDeferredValue(inputValue);

  const selectedOptions = useMemo(
    () =>
      value.map((id) => {
        const known = options.find((o) => o.id === id);
        return known ?? { id, label: id };
      }),
    [value, options],
  );

  const filteredOptions = useMemo(() => {
    const q = deferredInput.toLowerCase().trim();
    const base = options.filter(
      (o) =>
        !value.includes(o.id) &&
        (q === "" || o.label.toLowerCase().includes(q)),
    );
    if (
      allowCreate &&
      q !== "" &&
      !options.some((o) => o.label.toLowerCase() === q) &&
      !value.includes(q)
    ) {
      base.push({ id: q, label: t("tag.create").replace("{value}", q) });
    }
    return base;
  }, [deferredInput, options, value, allowCreate, t]);

  const handleChange = useCallback(
    (_: unknown, newValue: readonly (string | AppTagOption)[]) => {
      if (maxTags !== undefined && newValue.length > maxTags) return;
      onChange(newValue.map((o) => (typeof o === "string" ? o : o.id)));
      setInputValue("");
    },
    [onChange, maxTags],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim() && allowCreate) {
      const trimmed = inputValue.trim();
      if (!value.includes(trimmed)) {
        if (maxTags === undefined || value.length < maxTags) {
          onChange([...value, trimmed]);
        }
      }
      setInputValue("");
      e.preventDefault();
    }
    if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const isAtMax = maxTags !== undefined && value.length >= maxTags;

  return (
    <div className={className}>
      <Autocomplete
        disableClearable
        disabled={disabled}
        filterOptions={(x) => x}
        filterSelectedOptions
        freeSolo={allowCreate}
        getOptionLabel={(opt) => (typeof opt === "string" ? opt : opt.label)}
        inputValue={inputValue}
        multiple
        onChange={handleChange}
        onInputChange={(_, v, reason) => {
          if (reason !== "reset") setInputValue(v);
        }}
        options={filteredOptions}
        PaperComponent={({ children }) => (
          <Paper className="mt-1 rounded-xl border border-border shadow-sm" elevation={0}>
            {children}
          </Paper>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            disabled={disabled || isAtMax}
            label={label}
            onKeyDown={handleKeyDown}
            placeholder={isAtMax ? undefined : (placeholder ?? t("tag.placeholder"))}
            size={size}
            slotProps={{ input: { ...params.InputProps } }}
          />
        )}
        renderOption={(props, option) => {
          const { key, ...rest } = props as React.HTMLAttributes<HTMLLIElement> & { key: string };
          return (
            <li className="flex items-center gap-2 px-3 py-1.5 text-sm" key={key} {...rest}>
              {option.color ? (
                <span
                  className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: option.color }}
                />
              ) : null}
              <span className="text-foreground">{option.label}</span>
            </li>
          );
        }}
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => {
            const { key, ...tagProps } = getTagProps({ index });
            return (
              <Chip
                key={key}
                label={option.label}
                size="small"
                sx={{
                  fontSize: 12,
                  height: 22,
                  bgcolor: option.color ? `${option.color}22` : undefined,
                  borderColor: option.color ?? undefined,
                  borderWidth: option.color ? 1 : undefined,
                  borderStyle: option.color ? "solid" : undefined,
                }}
                {...tagProps}
              />
            );
          })
        }
        size={size}
        value={selectedOptions}
      />
      {maxTags !== undefined ? (
        <p className="mt-0.5 text-right text-[10px] text-muted-foreground">
          {value.length}/{maxTags}
        </p>
      ) : null}
    </div>
  );
}
