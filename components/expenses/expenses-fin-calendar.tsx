"use client";

import { cn } from "@/lib/utils";
import type { ExpensePeriodMode } from "@/lib/expenses/expense-page-calculations";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

type Props = {
  year: number;
  month: number;
  mode: ExpensePeriodMode;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onModeChange: (mode: ExpensePeriodMode) => void;
};

export default function ExpensesFinCalendar({
  year,
  month,
  mode,
  onYearChange,
  onMonthChange,
  onModeChange,
}: Props) {
  const handleMonthClick = (value: number) => {
    onMonthChange(value);
    if (mode !== "month") {
      onModeChange("month");
    }
  };

  return (
    <div className="mb-[22px] rounded-[14px] border border-slate-800 bg-card px-4 py-3.5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 font-mono text-[16px] font-extrabold text-white">
          <button
            type="button"
            onClick={() => onYearChange(year - 1)}
            className="grid h-7 w-7 place-items-center rounded-[7px] border border-slate-700 bg-slate-900/80 text-[16px] leading-none text-slate-400 transition hover:border-blue-500 hover:text-white"
            aria-label="Previous year"
          >
            ‹
          </button>
          <span className="min-w-[48px] text-center">{year}</span>
          <button
            type="button"
            onClick={() => onYearChange(year + 1)}
            className="grid h-7 w-7 place-items-center rounded-[7px] border border-slate-700 bg-slate-900/80 text-[16px] leading-none text-slate-400 transition hover:border-blue-500 hover:text-white"
            aria-label="Next year"
          >
            ›
          </button>
        </div>

        <div className="flex items-center gap-[3px] rounded-[9px] border border-slate-800 bg-slate-900/80 p-[3px]">
          {(["month", "year"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onModeChange(value)}
              className={cn(
                "rounded-[7px] px-[18px] py-1.5 text-[12.5px] font-bold transition",
                mode === value
                  ? "bg-blue-600 text-white"
                  : "bg-transparent text-slate-500 hover:text-slate-200",
              )}
            >
              {value === "month" ? "Monthly" : "Yearly"}
            </button>
          ))}
        </div>
      </div>

      <div className="-mx-0.5 flex gap-[5px] overflow-x-auto pb-0.5">
        {MONTHS.map((label, index) => {
          const value = index + 1;
          const active = mode === "month" && month === value;
          return (
            <button
              key={label}
              type="button"
              onClick={() => handleMonthClick(value)}
              className={cn(
                "min-w-[52px] flex-1 rounded-[8px] border px-1 py-[11px] text-center text-[12px] font-bold transition",
                active
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-800 bg-slate-900/80 text-slate-500 hover:border-blue-500 hover:text-slate-200",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
