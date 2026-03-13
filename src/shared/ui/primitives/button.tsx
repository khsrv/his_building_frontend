"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/ui/cn";

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

interface AppButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
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

const sizeClass: Record<ButtonSize, string> = {
  xs: "h-8 px-2.5 text-xs",
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-sm",
};

const iconSizeClass: Record<ButtonSize, string> = {
  xs: "h-8 w-8",
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-12 w-12",
};

const spinnerSizeClass: Record<ButtonSize, string> = {
  xs: "h-3.5 w-3.5",
  sm: "h-4 w-4",
  md: "h-4 w-4",
  lg: "h-4 w-4",
};

const variantClass: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-muted text-foreground hover:bg-muted/80",
  tonal: "bg-card text-card-foreground hover:bg-muted/60",
  outline: "border border-border bg-transparent text-foreground hover:bg-muted/40",
  text: "bg-transparent text-foreground hover:bg-muted/35",
  destructive: "bg-danger text-white hover:bg-danger/90",
  success: "bg-success text-white hover:bg-success/90",
  warning: "bg-warning text-black hover:bg-warning/90",
  icon: "aspect-square rounded-full bg-primary/10 text-primary hover:bg-primary/20",
};

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
  "aria-label": ariaLabel,
  ...rest
}: AppButtonProps) {
  const isDisabled = isLoading || disabled;
  const isIconOnly = iconOnly || variant === "icon";

  const content = children ?? (label ? <span className="truncate">{label}</span> : null);
  const iconContent = children ?? leading ?? trailing ?? null;
  const computedAriaLabel = isIconOnly ? (ariaLabel ?? label) : ariaLabel;

  return (
    <button
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-60",
        isIconOnly ? iconSizeClass[size] : sizeClass[size],
        variantClass[variant],
        fullWidth && "w-full",
        className,
      )}
      aria-label={computedAriaLabel}
      disabled={isDisabled}
      type="button"
      {...rest}
    >
      {isLoading ? (
        <>
          <span className={cn("animate-spin rounded-full border-2 border-current border-t-transparent", spinnerSizeClass[size])} />
          {!isIconOnly ? (loadingLabel ? <span className="truncate">{loadingLabel}</span> : content) : null}
        </>
      ) : (
        isIconOnly ? iconContent : (
          <>
            {leading}
            {content}
            {trailing}
          </>
        )
      )}
    </button>
  );
}
