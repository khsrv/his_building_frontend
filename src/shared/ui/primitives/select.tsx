"use client";

import type { SelectHTMLAttributes } from "react";
import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from "@mui/material";

export interface SelectOption<T extends string = string> {
  label: string;
  value: T;
}

interface AppSelectProps<T extends string = string>
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children" | "onChange"> {
  label?: string;
  placeholder?: string;
  hint?: string;
  errorText?: string;
  options: readonly SelectOption<T>[];
  onChange?: (event: { target: { value: string } }) => void;
}

export function AppSelect<T extends string = string>({
  label,
  placeholder,
  hint,
  errorText,
  options,
  className,
  value,
  onChange,
  id,
  ...rest
}: AppSelectProps<T>) {
  const currentValue = value ?? "";
  const hasFloatingLabel = Boolean(label);

  return (
    <FormControl className={className} error={Boolean(errorText)} fullWidth>
      {hasFloatingLabel ? <InputLabel id={`${id ?? "app-select"}-label`}>{label}</InputLabel> : null}
      <Select
        id={id}
        label={label}
        labelId={hasFloatingLabel ? `${id ?? "app-select"}-label` : undefined}
        displayEmpty={Boolean(placeholder && !hasFloatingLabel)}
        onChange={(event) => onChange?.({ target: { value: String(event.target.value) } })}
        renderValue={(selected) => {
          const next = String(selected ?? "");

          if (!next && placeholder && !hasFloatingLabel) {
            return <span style={{ color: "rgba(100, 116, 139, 0.95)" }}>{placeholder}</span>;
          }

          const option = options.find((item) => item.value === next);
          return option?.label ?? next;
        }}
        size="small"
        value={currentValue}
        variant="outlined"
        sx={{
          "& .MuiOutlinedInput-root": {
            minHeight: 40,
          },
          "& .MuiSelect-select": {
            display: "flex",
            alignItems: "center",
            minHeight: "40px !important",
            boxSizing: "border-box",
            py: "0 !important",
            lineHeight: 1.25,
          },
          "& .MuiSelect-icon": {
            top: "50%",
            transform: "translateY(-50%)",
            marginTop: 0,
          },
          "& .MuiInputLabel-root": {
            top: "50%",
            transform: "translate(14px, -50%) scale(1)",
            transformOrigin: "left center",
            lineHeight: 1.25,
          },
          "& .MuiInputLabel-root.MuiInputLabel-shrink": {
            top: 0,
            transform: "translate(14px, -9px) scale(0.75)",
          },
        }}
        {...(rest as Record<string, unknown>)}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {(errorText || hint) ? <FormHelperText>{errorText ?? hint}</FormHelperText> : null}
    </FormControl>
  );
}
