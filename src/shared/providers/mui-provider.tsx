"use client";

import { useMemo, type ReactNode } from "react";
import { enUS as dateFnsEnUS, ru as dateFnsRu, uz as dateFnsUz } from "date-fns/locale";
import { enUS as muiEnUS, ruRU as muiRuRU } from "@mui/material/locale";
import { CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { resolveIntlLocale } from "@/shared/lib/format/intl-locale";
import { useI18n } from "@/shared/providers/locale-provider";
import { useThemeMode } from "@/shared/providers/theme-provider";

interface MuiProviderProps {
  children: ReactNode;
}

const lightPalette = {
  background: "#F7F8FA",
  paper: "#FFFFFF",
  input: "#FAFBFC",
  textPrimary: "#0B1220",
  textSecondary: "#6B7280",
  border: "#EAECEF",
};

const darkPalette = {
  background: "#0B0E11",
  paper: "#141A1F",
  input: "#0E1114",
  textPrimary: "#E6E8EF",
  textSecondary: "#9AA4B2",
  border: "#20262C",
};

function createMuiTheme(mode: "light" | "dark", locale: "ru" | "en" | "tg" | "uz") {
  const colors = mode === "dark" ? darkPalette : lightPalette;
  const muiLocale = locale === "ru" || locale === "tg" ? muiRuRU : muiEnUS;

  return createTheme(
    {
      palette: {
        mode,
        primary: {
          main: "#F5B301",
          light: "#FFF7E0",
          dark: "#D89B00",
          contrastText: "#111827",
        },
        secondary: {
          main: "#0EA5E9",
          contrastText: "#FFFFFF",
        },
        success: {
          main: "#22C55E",
        },
        warning: {
          main: "#F59E0B",
        },
        error: {
          main: "#EF4444",
        },
        background: {
          default: colors.background,
          paper: colors.paper,
        },
        text: {
          primary: colors.textPrimary,
          secondary: colors.textSecondary,
        },
        divider: colors.border,
      },
      shape: {
        borderRadius: 10,
      },
      typography: {
        fontFamily: '"Inter", "SF Pro Display", "Segoe UI", sans-serif',
        fontSize: 14,
        h1: { fontSize: 30, fontWeight: 700, lineHeight: 1.2 },
        h2: { fontSize: 24, fontWeight: 600, lineHeight: 1.3 },
        h3: { fontSize: 20, fontWeight: 600, lineHeight: 1.4 },
        h4: { fontSize: 18, fontWeight: 600, lineHeight: 1.4 },
        h5: { fontSize: 16, fontWeight: 600, lineHeight: 1.4 },
        h6: { fontSize: 14, fontWeight: 600, lineHeight: 1.4 },
        subtitle1: { fontSize: 14, fontWeight: 500, lineHeight: 1.4 },
        body1: { fontSize: 16, fontWeight: 400, lineHeight: 1.6 },
        body2: { fontSize: 14, fontWeight: 400, lineHeight: 1.5 },
        caption: { fontSize: 12, fontWeight: 400, lineHeight: 1.4 },
        button: {
          fontSize: 14,
          fontWeight: 600,
          textTransform: "none",
          letterSpacing: 0,
        },
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              textRendering: "optimizeLegibility",
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              border: `1px solid ${colors.border}`,
              boxShadow: mode === "dark" ? "0 10px 24px rgba(0, 0, 0, 0.38)" : "0 4px 10px rgba(2, 8, 23, 0.06)",
              backgroundImage: "none",
            },
          },
        },
        MuiButton: {
          defaultProps: {
            disableElevation: true,
          },
          styleOverrides: {
            root: {
              minHeight: 36,
              borderRadius: 10,
              paddingInline: 14,
            },
          },
        },
        MuiIconButton: {
          styleOverrides: {
            root: {
              borderRadius: 10,
            },
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              minHeight: 40,
              borderRadius: 10,
              backgroundColor: colors.input,
            },
          },
        },
        MuiFilledInput: {
          styleOverrides: {
            root: {
              minHeight: 40,
              borderRadius: 10,
              backgroundColor: colors.input,
            },
          },
        },
        MuiInputBase: {
          styleOverrides: {
            input: {
              fontSize: 14,
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: 16,
            },
          },
        },
        MuiMenuItem: {
          styleOverrides: {
            root: {
              minHeight: 36,
              borderRadius: 8,
            },
          },
        },
      },
    },
    muiLocale,
  );
}

function resolveDateFnsLocale(locale: string) {
  const normalized = resolveIntlLocale(locale);

  if (normalized === "ru" || normalized === "tg") {
    return dateFnsRu;
  }

  if (normalized === "uz") {
    return dateFnsUz;
  }

  return dateFnsEnUS;
}

export function MuiProvider({ children }: MuiProviderProps) {
  const { locale } = useI18n();
  const { resolvedMode } = useThemeMode();

  const theme = useMemo(() => createMuiTheme(resolvedMode, locale), [locale, resolvedMode]);
  const dateLocale = useMemo(() => resolveDateFnsLocale(locale), [locale]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider adapterLocale={dateLocale} dateAdapter={AdapterDateFns}>
        {children}
      </LocalizationProvider>
    </MuiThemeProvider>
  );
}
