"use client";

import { BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCpaPortal } from "../context/cpa-portal-context";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function CpaMonthSelector() {
  const { month, setMonth, viewMode, setViewMode } = useCpaPortal();

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-1">
        {MONTHS.map((label, i) => {
          const m = i + 1;
          return (
            <button
              key={label}
              type="button"
              onClick={() => setMonth(m)}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors",
                month === m
                  ? "bg-blue-600 text-white"
                  : "text-slate-500 hover:bg-slate-800 hover:text-white",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => setViewMode("yearly")}
        className={cn(
          "flex items-center gap-1.5 text-[11px] transition-colors",
          viewMode === "yearly" ? "text-blue-400" : "text-slate-500 hover:text-white",
        )}
      >
        <BarChart2 className="h-3.5 w-3.5" />
        Yearly Overview
      </button>
    </div>
  );
}
