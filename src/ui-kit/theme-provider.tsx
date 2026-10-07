import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  DEFAULT_THEME,
  THEME_ATTRIBUTE,
  saveTheme,
  watchTheme,
  type ThemeId,
} from "@/core/theme";

type ThemeContextValue = {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Applies the stored colour theme to <html> and keeps it in sync. */
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);

  useEffect(() => watchTheme(setThemeState), []);

  useEffect(() => {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
  }, [theme]);

  const setTheme = (next: ThemeId) => {
    setThemeState(next);
    saveTheme(next).catch(() => {});
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
  );
};

/** Current theme and setter. Must be used inside ThemeProvider. */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};
