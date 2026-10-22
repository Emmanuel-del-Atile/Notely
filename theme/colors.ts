
export const lightColors = {
  // Brand
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  primaryLight: "#DBEAFE",

  // App
  background: "#F8FAFC",
  surface: "#FFFFFF",

  // Text
  text: "#0F172A",
  secondaryText: "#64748B",
  mutedText: "#94A3B8",

  // UI
  border: "#E2E8F0",
  inputBackground: "#F8FAFC",

  // Status
  success: "#16A34A",
  successLight: "#DCFCE7",
  warning: "#D97706",
  warningLight: "#FEF3C7",
  danger: "#DC2626",
  dangerLight: "#FEE2E2",

  // Utility
  white: "#FFFFFF",
  black: "#000000",
};

export const darkColors = {
  // Brand
  primary: "#60A5FA",
  primaryDark: "#3B82F6",
  primaryLight: "#1E3A5F",

  // App
  background: "#0F172A",
  surface: "#1E293B",

  // Text
  text: "#F1F5F9",
  secondaryText: "#CBD5E1",
  mutedText: "#94A3B8",

  // UI
  border: "#334155",
  inputBackground: "#1E293B",

  // Status
  success: "#4ADE80",
  successLight: "#14532D",
  warning: "#FBBF24",
  warningLight: "#78350F",
  danger: "#F87171",
  dangerLight: "#7F1D1D",

  // Utility
  white: "#FFFFFF",
  black: "#000000",
};

// Keep existing imports working while we migrate screens.
export const colors = lightColors;

export type ThemeColors = typeof lightColors;
