"use client";

import { ChevronLeft, ChevronRight, Calendar, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useNProgressRouter } from "@/hooks/use-nprogress-router";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useCpaPortal } from "../context/cpa-portal-context";

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

export default function CpaHeader() {
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
          <h1 className="text-2xl font-bold text-white">CPA Dashboard</h1>
          <p className="text-[12px] text-slate-500">
            Real-time financials, tax reporting &amp; compliance center
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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

          <div className="flex items-center gap-1 rounded-lg border border-slate-700 bg-[#0b1322] px-2 py-1">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="grid h-8 w-8 place-items-center text-slate-400 hover:text-white"
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
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

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
