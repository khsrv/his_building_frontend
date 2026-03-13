"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { Box, Paper, Typography } from "@mui/material";

export type CardVariant =
  | "elevated"
  | "outlined"
  | "tonal"
  | "interactive"
  | "status-info"
  | "status-success"
  | "status-warning"
  | "status-error";

export type CardDensity = "dense" | "regular";

interface AppCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> {
  variant?: CardVariant;
  density?: CardDensity;
  leading?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  children?: ReactNode;
}

const densitySpacing = {
  dense: 1.5,
  regular: 2,
};

function getVariantSx(variant: CardVariant) {
  if (variant === "outlined") {
    return { boxShadow: "none" };
  }

  if (variant === "tonal") {
    return { bgcolor: "action.hover" };
  }

  if (variant === "interactive") {
    return {
      transition: "transform 160ms ease",
      "&:hover": { transform: "translateY(-2px)" },
    };
  }

  if (variant === "status-info") {
    return { bgcolor: "info.light", borderColor: "info.main" };
  }

  if (variant === "status-success") {
    return { bgcolor: "success.light", borderColor: "success.main" };
  }

  if (variant === "status-warning") {
    return { bgcolor: "warning.light", borderColor: "warning.main" };
  }

  if (variant === "status-error") {
    return { bgcolor: "error.light", borderColor: "error.main" };
  }

  return {};
}

export function AppCard({
  variant = "elevated",
  density = "regular",
  leading,
  title,
  subtitle,
  trailing,
  children,
  className,
  ...rest
}: AppCardProps) {
  return (
    <Paper className={className} sx={{ p: densitySpacing[density], ...getVariantSx(variant) }} {...rest}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
        {leading ? <Box sx={{ pt: 0.25 }}>{leading}</Box> : null}

        <Box sx={{ minWidth: 0, flex: 1 }}>
          {title ? <Typography variant="subtitle1">{title}</Typography> : null}
          {subtitle ? (
            <Typography color="text.secondary" sx={{ mt: 0.25 }} variant="body2">
              {subtitle}
            </Typography>
          ) : null}
          {children ? <Box sx={{ pt: 1.5 }}>{children}</Box> : null}
        </Box>

        {trailing ? <Box>{trailing}</Box> : null}
      </Box>
    </Paper>
  );
}

interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function SectionCard({ title, subtitle, children, className }: SectionCardProps) {
  return (
    <AppCard className={className} subtitle={subtitle} title={title} variant="outlined">
      {children}
    </AppCard>
  );
}
