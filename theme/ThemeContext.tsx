
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Appearance,
  ColorSchemeName,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  lightColors,
  darkColors,
  ThemeColors,
} from "./colors";

export type ThemePreference = "light" | "dark" | "system";

type ThemeContextValue = {
  preference: ThemePreference;
  colors: ThemeColors;
  setPreference: (preference: ThemePreference) => Promise<void>;
};

const STORAGE_KEY = "@notely/theme-preference";

const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined
);

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [preference, setPreferenceState] =
    useState<ThemePreference>("system");

  const [systemScheme, setSystemScheme] =
    useState<ColorSchemeName>(Appearance.getColorScheme());

  useEffect(() => {
    let mounted = true;

    async function loadPreference() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);

        if (
          mounted &&
          (saved === "light" ||
            saved === "dark" ||
            saved === "system")
        ) {
          setPreferenceState(saved);
        }
      } catch (error) {
        console.error("Failed to load theme preference:", error);
      }
    }

    void loadPreference();

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  async function setPreference(nextPreference: ThemePreference) {
    setPreferenceState(nextPreference);

    try {
      await AsyncStorage.setItem(STORAGE_KEY, nextPreference);
    } catch (error) {
      console.error("Failed to save theme preference:", error);
    }
  }

  const isDark =
    preference === "system"
      ? systemScheme === "dark"
      : preference === "dark";

  const value: ThemeContextValue = {
    preference,
    colors: isDark ? darkColors : lightColors,
    setPreference,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}
