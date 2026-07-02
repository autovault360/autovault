"use client";

import { cn } from "@/lib/utils";
import { AV } from "@/lib/ui/autovault-design-tokens";

export type FinPeriodMode = "monthly" | "yearly";

export type FinPeriodCalendarProps = {
  year: number;
  /** 1-12 */
  month: number;
  mode: FinPeriodMode;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onModeChange: (mode: FinPeriodMode) => void;
  className?: string;
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default function FinPeriodCalendar({
  year,
  month,
  mode,
  onYearChange,
  onMonthChange,
  onModeChange,
  className,
}: FinPeriodCalendarProps) {
  const handleMonthClick = (value: number) => {
    onMonthChange(value);
    if (mode !== "monthly") {
      onModeChange("monthly");
    }
  };

  return (
    <div
      className={cn(
        "mb-[22px] bg-card rounded-[14px] border px-4 py-3.5",
        className,
      )}
      style={{ backgroundColor: AV.panel, borderColor: AV.border }}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex items-center gap-3 font-mono text-[16px] font-extrabold"
          style={{ color: AV.text }}
        >
          <button
            type="button"
            onClick={() => onYearChange(year - 1)}
            className="grid h-7 w-7 place-items-center rounded-[7px] border text-[16px] leading-none transition"
            style={{
              backgroundColor: AV.panel2,
              borderColor: AV.border,
              color: AV.muted,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = AV.text;
              e.currentTarget.style.borderColor = AV.blue;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = AV.muted;
              e.currentTarget.style.borderColor = AV.border;
            }}
            aria-label="Previous year"
          >
            ‹
          </button>
          <span className="min-w-[48px] text-center">{year}</span>
          <button
            type="button"
            onClick={() => onYearChange(year + 1)}
            className="grid h-7 w-7 place-items-center rounded-[7px] border text-[16px] leading-none transition"
            style={{
              backgroundColor: AV.panel2,
              borderColor: AV.border,
              color: AV.muted,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = AV.text;
              e.currentTarget.style.borderColor = AV.blue;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = AV.muted;
              e.currentTarget.style.borderColor = AV.border;
            }}
            aria-label="Next year"
          >
            ›
          </button>
        </div>

        <div
          className="flex items-center gap-[3px] rounded-[9px] border p-[3px]"
          style={{ backgroundColor: AV.panel2, borderColor: AV.border }}
        >
          {(["monthly", "yearly"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onModeChange(value)}
              className="rounded-[7px] px-[18px] py-1.5 text-[12.5px] font-bold transition"
              style={
                mode === value
                  ? { backgroundColor: AV.blue, color: "#fff" }
                  : { backgroundColor: "transparent", color: AV.muted }
              }
              onMouseEnter={(e) => {
                if (mode !== value) {
                  e.currentTarget.style.color = AV.text;
                }
              }}
              onMouseLeave={(e) => {
                if (mode !== value) {
                  e.currentTarget.style.color = AV.muted;
                }
              }}
            >
              {value === "monthly" ? "Monthly" : "Yearly"}
            </button>
          ))}
        </div>
      </div>

      <div className="-mx-0.5 flex gap-[5px] overflow-x-auto pb-0.5">
        {MONTHS.map((label, index) => {
          const value = index + 1;
          const active = mode === "monthly" && month === value;
          return (
            <button
              key={label}
              type="button"
              onClick={() => handleMonthClick(value)}
              className="min-w-[52px] flex-1 rounded-[8px] border px-1 py-[11px] text-center text-[12px] font-bold transition"
              style={
                active
                  ? {
                      backgroundColor: AV.blue,
                      borderColor: AV.blue,
                      color: "#fff",
                    }
                  : {
                      backgroundColor: AV.panel2,
                      borderColor: AV.border,
                      color: AV.muted,
                    }
              }
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.color = AV.text;
                  e.currentTarget.style.borderColor = AV.blue;
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.color = AV.muted;
                  e.currentTarget.style.borderColor = AV.border;
                }
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
