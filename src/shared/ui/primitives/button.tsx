"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Button, CircularProgress, IconButton } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tonal"
  | "outline"
  | "text"
  | "destructive"
  | "success"
  | "warning"
  | "icon";

export type ButtonSize = "xs" | "sm" | "md" | "lg";

interface AppButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "color"> {
  label?: string;
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingLabel?: string;
  fullWidth?: boolean;
  iconOnly?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
}

const sizeMap = {
  xs: { button: "small" as const, height: 30, px: 1.1 },
  sm: { button: "small" as const, height: 34, px: 1.4 },
  md: { button: "medium" as const, height: 38, px: 1.8 },
  lg: { button: "large" as const, height: 42, px: 2.2 },
};

type ButtonColor = "primary" | "secondary" | "success" | "warning" | "inherit" | "error" | "info";
type IconButtonColor = ButtonColor | "default";

interface MappedVariant {
  variant: "contained" | "outlined" | "text";
  buttonColor: ButtonColor;
  iconColor: IconButtonColor;
  sx?: SxProps<Theme>;
}

function mapVariant(variant: ButtonVariant): MappedVariant {
  if (variant === "outline") {
    return { variant: "outlined", buttonColor: "inherit", iconColor: "default" };
  }

  if (variant === "text") {
    return { variant: "text", buttonColor: "inherit", iconColor: "default" };
  }

  if (variant === "secondary") {
    return { variant: "contained", buttonColor: "inherit", iconColor: "default", sx: { bgcolor: "action.hover" } };
  }

  if (variant === "tonal") {
    return { variant: "contained", buttonColor: "inherit", iconColor: "default", sx: { bgcolor: "action.selected" } };
  }

  if (variant === "destructive") {
    return { variant: "contained", buttonColor: "error", iconColor: "error" };
  }

  if (variant === "success") {
    return { variant: "contained", buttonColor: "success", iconColor: "success" };
  }

  if (variant === "warning") {
    return { variant: "contained", buttonColor: "warning", iconColor: "warning" };
  }

  if (variant === "icon") {
    return {
      variant: "contained",
      buttonColor: "primary",
      iconColor: "primary",
      sx: { bgcolor: "primary.light", color: "primary.main" },
    };
  }

  return {
    variant: "contained",
    buttonColor: "primary",
    iconColor: "primary",
  };
}

export function AppButton({
  label,
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingLabel,
  fullWidth = false,
  iconOnly = false,
  leading,
  trailing,
  disabled,
  className,
  type = "button",
  "aria-label": ariaLabel,
  ...rest
}: AppButtonProps) {
  const isDisabled = disabled || isLoading;
  const isIconOnly = iconOnly || variant === "icon";
  const content = children ?? label;
  const mapped = mapVariant(variant);
  const sizing = sizeMap[size];

  if (isIconOnly) {
    const iconNode = isLoading ? <CircularProgress color="inherit" size={16} /> : (children ?? leading ?? trailing);

    return (
      <IconButton
        aria-label={ariaLabel ?? label}
        className={className}
        color={mapped.iconColor}
        disabled={isDisabled}
        sx={{
          width: sizing.height,
          height: sizing.height,
          borderRadius: variant === "icon" ? "999px" : "12px",
          ...(mapped.sx ?? {}),
        }}
        type={type}
        {...rest}
      >
        {iconNode}
      </IconButton>
    );
  }

  return (
    <Button
      aria-label={ariaLabel}
      className={className}
      color={mapped.buttonColor}
      disabled={isDisabled}
      fullWidth={fullWidth}
      startIcon={!isLoading ? leading : <CircularProgress color="inherit" size={16} />}
      sx={{
        minHeight: sizing.height,
        px: sizing.px,
        ...(mapped.sx ?? {}),
      }}
      type={type}
      variant={mapped.variant}
      {...rest}
    >
      {isLoading ? (loadingLabel ?? content) : (
        <>
          {content}
          {trailing}
        </>
      )}
    </Button>
  );
}
