export const appColors = {
  brandPrimary: "#F5B301",
  brandPrimaryStrong: "#D89B00",
  brandPrimarySoft: "#FFF7E0",
  brandDark: "#111827",
  brandDark2: "#0B1220",

  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#0EA5E9",

  surface: "#FFFFFF",
  surfaceAlt: "#FAFBFC",
  textStrong: "#0B1220",
  textMuted: "#6B7280",
  line: "#EAECEF",
  bg: "#F7F8FA",

  bgDark: "#0B0E11",
  surfaceDark: "#0E1114",
  surfaceAltDark: "#141A1F",
  textStrongDark: "#E6E8EF",
  textMutedDark: "#9AA4B2",
  lineDark: "#20262C",
} as const;

export const appSpacing = {
  x1: "4px",
  x2: "8px",
  x3: "12px",
  x4: "16px",
  x5: "20px",
  x6: "24px",
  x7: "32px",
  x8: "40px",
  x9: "48px",
  x10: "56px",
  x12: "64px",
  x16: "80px",
  x20: "96px",
  x24: "112px",
} as const;

export const appRadius = {
  s: "4px",
  m: "8px",
  l: "12px",
  xl: "16px",
  xxl: "20px",
  full: "999px",
} as const;

export const appTypography = {
  h1: { fontSize: "30px", fontWeight: 700, lineHeight: "1.2" },
  h2: { fontSize: "24px", fontWeight: 600, lineHeight: "1.3" },
  h3: { fontSize: "20px", fontWeight: 600, lineHeight: "1.4" },
  h4: { fontSize: "18px", fontWeight: 600, lineHeight: "1.4" },
  h5: { fontSize: "16px", fontWeight: 600, lineHeight: "1.4" },
  h6: { fontSize: "14px", fontWeight: 600, lineHeight: "1.4" },
  bodyL: { fontSize: "16px", fontWeight: 400, lineHeight: "1.6" },
  bodyM: { fontSize: "14px", fontWeight: 400, lineHeight: "1.5" },
  bodyS: { fontSize: "12px", fontWeight: 400, lineHeight: "1.4" },
  labelL: { fontSize: "14px", fontWeight: 500, lineHeight: "1.4" },
  labelM: { fontSize: "12px", fontWeight: 500, lineHeight: "1.4" },
  labelS: { fontSize: "10px", fontWeight: 500, lineHeight: "1.3" },
} as const;

export const appShadows = {
  sm: "0 4px 10px rgba(2, 8, 23, 0.06)",
  md: "0 10px 20px rgba(2, 8, 23, 0.10)",
  lg: "0 20px 40px rgba(0, 0, 0, 0.15)",
} as const;
