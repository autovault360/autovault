"use client";

import { cn } from "@/lib/utils";
import type { CalendarViewMode } from "@/lib/calendar/types";

type Props = {
  viewMode: CalendarViewMode;
  onViewChange: (mode: CalendarViewMode) => void;
};

export default function CalendarViewToggles({ viewMode, onViewChange }: Props) {
  return (
    <div className="inline-flex rounded-md border border-slate-700 bg-[#0e1626] p-0.5">
      {(
        [
          { id: "monthly" as const, label: "Monthly Calendar" },
          { id: "yearly" as const, label: "Yearly Calendar" },
        ] as const
      ).map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onViewChange(tab.id)}
          className={cn(
            "rounded px-3 py-1.5 text-[11.5px] font-medium transition-colors",
            viewMode === tab.id
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:text-slate-200",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
