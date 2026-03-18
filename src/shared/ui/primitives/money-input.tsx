"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { InputAdornment, MenuItem, Select, TextField } from "@mui/material";

export interface AppCurrencyOption {
  code: string;
  symbol: string;
  label: string;
}

interface AppMoneyInputProps {
  value: number | null;
  currency: string;
  onChangeValue: (value: number | null) => void;
  onChangeCurrency?: (currency: string) => void;
  currencies?: readonly AppCurrencyOption[];
  locale?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  size?: "small" | "medium";
  secondaryAmount?: number | null;
  secondaryCurrency?: string;
  fullWidth?: boolean;
}

const DEFAULT_CURRENCIES: readonly AppCurrencyOption[] = [
  { code: "TJS", symbol: "SM", label: "Сомони" },
  { code: "USD", symbol: "$", label: "Доллар" },
  { code: "RUB", symbol: "₽", label: "Рубль" },
  { code: "EUR", symbol: "€", label: "Евро" },
];

function formatDisplay(value: number | null, locale: string): string {
  if (value === null) {
    return "";
  }
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function parseInput(raw: string): number | null {
  const cleaned = raw.replace(/\s/g, "").replace(",", ".");
  if (!cleaned) {
    return null;
  }
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function AppMoneyInput({
  value,
  currency,
  onChangeValue,
  onChangeCurrency,
  currencies = DEFAULT_CURRENCIES,
  locale = "ru-RU",
  label,
  placeholder = "0",
  disabled = false,
  error = false,
  helperText,
  size = "small",
  secondaryAmount,
  secondaryCurrency,
  fullWidth = true,
}: AppMoneyInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [rawInput, setRawInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const currencySymbol = useMemo(() => {
    return currencies.find((c) => c.code === currency)?.symbol ?? currency;
  }, [currencies, currency]);

  const displayValue = isFocused ? rawInput : formatDisplay(value, locale);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setRawInput(value !== null ? String(value) : "");
  }, [value]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    const parsed = parseInput(rawInput);
    if (parsed !== value) {
      onChangeValue(parsed);
    }
  }, [onChangeValue, rawInput, value]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value;
      if (/^[\d\s.,]*$/.test(raw)) {
        setRawInput(raw);
      }
    },
    [],
  );

  const secondaryLabel = useMemo(() => {
    if (secondaryAmount === null || secondaryAmount === undefined || !secondaryCurrency) {
      return null;
    }
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(secondaryAmount);
    return `≈ ${formatted} ${secondaryCurrency}`;
  }, [locale, secondaryAmount, secondaryCurrency]);

  return (
    <div style={{ width: fullWidth ? "100%" : "auto" }}>
      <TextField
        disabled={disabled}
        error={error}
        fullWidth={fullWidth}
        helperText={secondaryLabel ?? helperText}
        inputRef={inputRef}
        label={label}
        onBlur={handleBlur}
        onChange={handleChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        size={size}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                {onChangeCurrency && currencies.length > 1 ? (
                  <Select
                    disabled={disabled}
                    onChange={(event) => onChangeCurrency(event.target.value)}
                    size="small"
                    sx={{
                      minWidth: 72,
                      "& .MuiSelect-select": { py: 0.25, pr: "24px !important" },
                      "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                      fontSize: 13,
                    }}
                    value={currency}
                    variant="outlined"
                  >
                    {currencies.map((c) => (
                      <MenuItem key={c.code} value={c.code}>
                        {c.symbol} {c.code}
                      </MenuItem>
                    ))}
                  </Select>
                ) : (
                  <span style={{ fontSize: 14, fontWeight: 500, whiteSpace: "nowrap" }}>
                    {currencySymbol}
                  </span>
                )}
              </InputAdornment>
            ),
          },
        }}
        value={displayValue}
        variant="outlined"
      />
    </div>
  );
}
