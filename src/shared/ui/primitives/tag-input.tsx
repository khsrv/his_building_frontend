"use client";

import { useCallback, useDeferredValue, useMemo, useRef, useState } from "react";
import {
  Autocomplete,
  Box,
  Chip,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

export interface AppTagOption {
  id: string;
  label: string;
  color?: string;
}

interface AppTagInputProps {
  value: readonly string[]; // array of tag ids
  onChange: (ids: string[]) => void;
  options?: readonly AppTagOption[]; // known tags for autocomplete
  allowCreate?: boolean; // allow creating new tags (label becomes id)
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
  placeholder = "Добавить тег...",
  label,
  disabled = false,
  maxTags,
  className,
  size = "small",
}: AppTagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const deferredInput = useDeferredValue(inputValue);
  const inputRef = useRef<HTMLInputElement | null>(null);

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
      base.push({ id: q, label: `Создать "${q}"` });
    }
    return base;
  }, [deferredInput, options, value, allowCreate]);

  const handleChange = useCallback(
    (_: unknown, newValue: readonly (string | AppTagOption)[]) => {
      if (maxTags !== undefined && newValue.length > maxTags) return;
      onChange(
        newValue.map((o) => (typeof o === "string" ? o : o.id)),
      );
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
    <Box className={className}>
      <Autocomplete
        disableClearable
        disabled={disabled}
        filterOptions={(x) => x}
        filterSelectedOptions
        freeSolo={allowCreate}
        getOptionLabel={(opt) =>
          typeof opt === "string" ? opt : opt.label
        }
        inputValue={inputValue}
        multiple
        onChange={handleChange}
        onInputChange={(_, v, reason) => {
          if (reason !== "reset") setInputValue(v);
        }}
        options={filteredOptions}
        PaperComponent={({ children }) => (
          <Paper elevation={4} sx={{ mt: 0.5 }}>
            {children}
          </Paper>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            disabled={disabled || isAtMax}
            inputRef={inputRef}
            label={label}
            onKeyDown={handleKeyDown}
            placeholder={isAtMax ? undefined : placeholder}
            size={size}
            slotProps={{
              input: {
                ...params.InputProps,
              },
            }}
          />
        )}
        renderOption={(props, option) => {
          const { key, ...rest } = props as React.HTMLAttributes<HTMLLIElement> & { key: string };
          return (
            <Box component="li" key={key} {...rest} sx={{ py: 0.5 }}>
              {option.color ? (
                <Box
                  component="span"
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: option.color,
                    display: "inline-block",
                    mr: 1,
                    flexShrink: 0,
                  }}
                />
              ) : null}
              <Typography sx={{ fontSize: 13 }}>{option.label}</Typography>
            </Box>
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
        <Typography color="text.disabled" sx={{ fontSize: 10, mt: 0.25, textAlign: "right" }}>
          {value.length}/{maxTags}
        </Typography>
      ) : null}
    </Box>
  );
}
