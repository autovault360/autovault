"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import "./landing-theme.css";

type LandingThemeContextValue = {
  isDark: boolean;
  toggleTheme: () => void;
};

const LandingThemeContext = createContext<LandingThemeContextValue | null>(null);

const STORAGE_KEY = "landing-theme";

export function useLandingTheme() {
  const ctx = useContext(LandingThemeContext);
  if (!ctx) {
    throw new Error("useLandingTheme must be used within LandingThemeProvider");
  }
  return ctx;
}

export default function LandingThemeProvider({
  children,
  playfairVariable,
}: {
  children: ReactNode;
  playfairVariable: string;
}) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setIsDark(stored === "dark");
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
      return next;
    });
  }, []);

  return (
    <LandingThemeContext.Provider value={{ isDark, toggleTheme }}>
      <main
        className={cn(
          "landing-page min-h-screen overflow-x-hidden px-4 sm:px-6 lg:px-8 antialiased transition-colors duration-300",
          playfairVariable,
          mounted && isDark && "landing-dark",
        )}
        data-landing-theme={mounted ? (isDark ? "dark" : "light") : undefined}
      >
        {children}
      </main>
    </LandingThemeContext.Provider>
  );
}
