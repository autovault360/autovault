"use client";

import { Calendar, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { buildPeriodLabel } from "@/lib/dashboard/server/period-utils";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const YEARS = Array.from(
  { length: 5 },
  (_, i) => new Date().getFullYear() - 2 + i,
);

export default function DashboardPeriodFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const viewMode = (searchParams.get("view") ?? "monthly") as "monthly" | "yearly";
  const month = Number(searchParams.get("month") ?? new Date().getMonth() + 1);
  const year = Number(searchParams.get("year") ?? new Date().getFullYear());

  const buildHref = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        params.set(key, value);
      }
      return `/dashboard?${params.toString()}`;
    },
    [searchParams],
  );

  const { from, to } = (() => {
    if (viewMode === "yearly") {
      return { from: `${year}-01-01`, to: `${year}-12-31` };
    }
    const m = Math.max(1, Math.min(12, month));
    const f = `${year}-${String(m).padStart(2, "0")}-01`;
    const daysInMonth = new Date(year, m, 0).getDate();
    const t = `${year}-${String(m).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;
    return { from: f, to: t };
  })();
  const dateRangeLabel = buildPeriodLabel(from, to);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2 rounded-lg border border-slate-700/80 bg-[#0e1626] px-3 py-2">
        <Calendar className="h-4 w-4 shrink-0 text-slate-500" />
        <span className="text-[12px] font-medium text-slate-200 tabular-nums">
          {dateRangeLabel}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
      </div>

      <div className="flex rounded-lg border border-slate-700/80 bg-[#0e1626] p-0.5">
        {(["monthly", "yearly"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("view", mode);
              if (mode === "yearly") params.delete("month");
              router.push(`/dashboard?${params.toString()}`);
            }}
            className={cn(
              "rounded-md px-4 py-1.5 text-[12px] font-medium capitalize transition-colors",
              viewMode === mode
                ? "bg-violet-600 text-white"
                : "text-slate-400 hover:text-white",
            )}
          >
            {mode}
          </button>
        ))}
      </div>

      {viewMode === "monthly" && (
        <Select
          value={String(month)}
          onValueChange={(value) => {
            router.push(buildHref({ month: value }));
          }}
        >
          <SelectTrigger
            theme="dark"
            className="h-9 w-[130px] border-slate-700/80 bg-[#0e1626] text-[11px] text-slate-300"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent theme="dark">
            {MONTHS.map((label, i) => (
              <SelectItem
                key={label}
                value={String(i + 1)}
                className="text-[11px]"
              >
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select
        value={String(year)}
        onValueChange={(value) => {
          router.push(buildHref({ year: value }));
        }}
      >
        <SelectTrigger
          theme="dark"
          className="h-9 w-[90px] border-slate-700/80 bg-[#0e1626] text-[11px] text-slate-300"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent theme="dark">
          {YEARS.map((y) => (
            <SelectItem key={y} value={String(y)} className="text-[11px]">
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
