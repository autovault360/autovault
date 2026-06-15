"use client";

import { Moon, Sun } from "lucide-react";
import { useLandingTheme } from "@/components/landing/landing-theme-provider";

export default function LandingThemeToggle() {
  const { isDark, toggleTheme } = useLandingTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--lp-border-toggle)] bg-[var(--lp-bg-card)] text-[var(--lp-fg-nav)] transition-colors hover:border-[var(--lp-fg-accent)] hover:text-[var(--lp-fg-accent)]"
    >
      {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );
}
