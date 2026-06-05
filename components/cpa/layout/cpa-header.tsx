"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Calendar, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useNProgressRouter } from "@/hooks/use-nprogress-router";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useCpaPortal } from "../context/cpa-portal-context";
import { getCpaHeaderDefaults } from "./cpa-header-config";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export type CpaHeaderProps = {
  title?: string;
  subtitle?: string;
  backLink?: { href: string; label: string };
  showViewMode?: boolean;
  showMonthNav?: boolean;
  actions?: React.ReactNode;
};

export default function CpaHeader({
  title: titleProp,
  subtitle: subtitleProp,
  backLink: backLinkProp,
  showViewMode: showViewModeProp,
  showMonthNav: showMonthNavProp,
  actions,
}: CpaHeaderProps = {}) {
  const pathname = usePathname();
  const defaults = getCpaHeaderDefaults(pathname);
  const router = useNProgressRouter();
  const {
    session,
    viewMode,
    setViewMode,
    month,
    year,
    setMonth,
    setYear,
  } = useCpaPortal();

  const title = titleProp ?? defaults.title;
  const subtitle = subtitleProp ?? defaults.subtitle;
  const backLink = backLinkProp ?? defaults.backLink;
  const showViewMode = showViewModeProp ?? defaults.showViewMode;
  const showMonthNav = showMonthNavProp ?? defaults.showMonthNav;

  const shiftMonth = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m > 12) {
      m = 1;
      y += 1;
    } else if (m < 1) {
      m = 12;
      y -= 1;
    }
    setMonth(m);
    setYear(y);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/cpa/login");
    router.refresh();
  };

  return (
    <header className="mb-4 space-y-3 border-b border-slate-800 pb-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {subtitle && (
            <p className="mt-0.5 text-[12px] text-slate-500">{subtitle}</p>
          )}
          {backLink && (
            <Link
              href={backLink.href}
              className="mt-1 inline-flex items-center gap-1 text-[12px] text-blue-400 hover:underline"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              {backLink.label}
            </Link>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {actions}

          {showViewMode && (
            <div className="flex rounded-lg border border-slate-700 p-0.5">
              {(["monthly", "yearly"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "rounded-md px-4 py-1.5 text-[12px] font-medium capitalize transition-colors",
                    viewMode === mode
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-white",
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
          )}

          {showMonthNav && (
            <div className="flex items-center gap-1 rounded-lg border border-slate-700 bg-[#0b1322] px-2 py-1">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                className="grid h-8 w-8 place-items-center text-slate-400 hover:text-white"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <Calendar className="h-4 w-4 text-blue-400" />
              <span className="min-w-[120px] text-center text-[13px] font-medium text-white">
                {MONTHS[month - 1]} {year}
              </span>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                className="grid h-8 w-8 place-items-center text-slate-400 hover:text-white"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {session && (
            <div className="flex items-center gap-3 border-l border-slate-800 pl-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-blue-600 text-xs text-white">
                  {session.initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-[12px] font-medium text-white">{session.fullName}</p>
                <p className="text-[10px] text-slate-500">{session.email}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1 rounded-md border border-slate-700 px-3 py-1.5 text-[11px] text-slate-400 hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
