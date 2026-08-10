"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  parseTheme,
  themeCookieValue,
  type Theme,
} from "@/lib/theme";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function readStoredTheme(): Theme {
  try {
    return parseTheme(localStorage.getItem("theme"));
  } catch {
    return "light";
  }
}

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: Theme;
}

export function ThemeProvider({
  children,
  initialTheme = "light",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = readStoredTheme();

    if (stored !== initialTheme) {
      setThemeState(stored);
      applyTheme(stored);
      document.cookie = themeCookieValue(stored);
    } else {
      applyTheme(initialTheme);

      try {
        localStorage.setItem("theme", initialTheme);
      } catch {
        // Ignore storage failures in private browsing.
      }
    }

    setMounted(true);
  }, [initialTheme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);

    try {
      localStorage.setItem("theme", next);
    } catch {
      // Ignore storage failures in private browsing.
    }

    document.cookie = themeCookieValue(next);
    applyTheme(next);
  }, []);

  const value = useMemo(
    () => ({
      theme: mounted ? theme : initialTheme,
      setTheme,
    }),
    [mounted, theme, initialTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
