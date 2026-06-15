"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ADMIN_PANEL_SHELL_CLASS } from "@/app/dashboard/_components/admin-panel-styles";
import { formatCurrency } from "@/lib/dealer/dashboard/calculations";
import {
  aggregateSoldVehiclesByDay,
  computeSoldVehicleStats,
  formatCalendarSalesAmount,
  formatSoldDate,
  getMonthDateRange,
} from "@/lib/dealer/dashboard/sold-vehicle-calculations";
import type { SoldVehicleRecord } from "@/lib/dealer/dashboard/types";
import { cn } from "@/lib/utils";

type CalendarView = "month" | "week" | "list";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i),
  label: new Date(2024, i, 1).toLocaleDateString("en-US", { month: "long" }),
}));

function toIsoDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function buildMonthGrid(year: number, month: number) {
  const { lastDay } = getMonthDateRange(year, month);
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const prevMonthLastDay = new Date(prevYear, prevMonth + 1, 0).getDate();
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;

  const cells: Array<{
    day: number;
    date: string;
    isCurrentMonth: boolean;
    month: number;
    year: number;
  }> = [];

  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    cells.push({
      day,
      date: toIsoDate(prevYear, prevMonth, day),
      isCurrentMonth: false,
      month: prevMonth,
      year: prevYear,
    });
  }

  for (let day = 1; day <= lastDay; day++) {
    cells.push({
      day,
      date: toIsoDate(year, month, day),
      isCurrentMonth: true,
      month,
      year,
    });
  }

  const trailing = cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7);
  for (let day = 1; day <= trailing; day++) {
    cells.push({
      day,
      date: toIsoDate(nextYear, nextMonth, day),
      isCurrentMonth: false,
      month: nextMonth,
      year: nextYear,
    });
  }

  return cells;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function SoldVehiclesCalendar({
  records,
  year,
  month,
  selectedDate,
  onMonthChange,
  onSelectedDateChange,
  onReset,
  defaultYear,
  defaultMonth,
  loading,
}: {
  records: SoldVehicleRecord[];
  year: number;
  month: number;
  selectedDate: string | null;
  onMonthChange: (year: number, month: number) => void;
  onSelectedDateChange: (date: string | null) => void;
  onReset: () => void;
  defaultYear: number;
  defaultMonth: number;
  loading?: boolean;
}) {
  const [view, setView] = useState<CalendarView>("month");
  const today = new Date();

  const { lastDay } = getMonthDateRange(year, month);
  const dayAggregates = useMemo(
    () => aggregateSoldVehiclesByDay(records),
    [records],
  );
  const stats = useMemo(() => computeSoldVehicleStats(records), [records]);

  const monthLabel = new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const calendarCells = useMemo(
    () => buildMonthGrid(year, month),
    [year, month],
  );

  const weekDays = useMemo(() => {
    const anchor = selectedDate
      ? new Date(`${selectedDate}T00:00:00`)
      : new Date(year, month, Math.min(13, lastDay));
    const start = new Date(anchor);
    start.setDate(anchor.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [selectedDate, year, month, lastDay]);

  const listRecords = useMemo(
    () =>
      [...records].sort((a, b) =>
        a.dateSold > b.dateSold ? -1 : a.dateSold < b.dateSold ? 1 : 0,
      ),
    [records],
  );

  const goMonth = (delta: number) => {
    const next = new Date(year, month + delta, 1);
    onMonthChange(next.getFullYear(), next.getMonth());
    onSelectedDateChange(null);
  };

  const goToday = () => {
    onMonthChange(today.getFullYear(), today.getMonth());
    onSelectedDateChange(
      toIsoDate(today.getFullYear(), today.getMonth(), today.getDate()),
    );
  };

  const handleReset = () => {
    setView("month");
    onReset();
  };

  const hasActiveFilters =
    selectedDate !== null ||
    view !== "month" ||
    year !== defaultYear ||
    month !== defaultMonth;
  return (
    <div
      className={cn(
        "flex min-h-0 flex-col rounded-sm border p-3.5 text-slate-200 shadow-none",
        ADMIN_PANEL_SHELL_CLASS,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            theme="dark"
            size="icon-sm"
            onClick={() => goMonth(-1)}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            theme="dark"
            size="icon-sm"
            onClick={() => goMonth(1)}
            aria-label="Next month"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>

          <Select
            value={String(month)}
            onValueChange={(value) => {
              onMonthChange(year, Number(value));
              onSelectedDateChange(null);
            }}
          >
            <SelectTrigger
              theme="dark"
              className="h-8 min-w-[120px] border-slate-800 bg-card text-[11px] font-semibold"
            >
              <SelectValue>{monthLabel}</SelectValue>
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </SelectTrigger>
            <SelectContent theme="dark">
              {MONTH_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  theme="dark"
                  className="text-[11px]"
                >
                  {opt.label} {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="outline"
            theme="dark"
            size="sm"
            className="h-8 text-[11px]"
            onClick={goToday}
          >
            Today
          </Button>

          <Button
            type="button"
            variant="outline"
            theme="dark"
            size="sm"
            className="h-8 text-[11px]"
            onClick={handleReset}
            disabled={!hasActiveFilters}
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        </div>

        <div className="flex rounded-sm border border-slate-700/80 bg-card">
          {(["month", "week", "list"] as CalendarView[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setView(mode)}
              className={cn(
                "px-3 py-1.5 text-[10px] font-semibold capitalize transition-colors first:rounded-l-sm last:rounded-r-sm",
                view === mode
                  ? "bg-[#3b82f6] text-white"
                  : "text-slate-400 hover:text-slate-200",
                mode !== "month" && "border-l border-slate-700/80",
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="mt-3 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-8 animate-pulse rounded bg-slate-800/80"
            />
          ))}
        </div>
      ) : view === "month" ? (
        <div className="mt-3 overflow-hidden rounded-sm border border-slate-700/80 bg-card">
          <div className="grid grid-cols-7 divide-x divide-slate-700/80 border-b border-slate-700/80">
            {WEEKDAY_LABELS.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-[9px] font-semibold uppercase tracking-[0.06em] text-slate-500"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 divide-x divide-y divide-slate-700/80">
            {calendarCells.map((cell) => {
              const aggregate = dayAggregates.get(cell.date);
              const cellDate = new Date(`${cell.date}T00:00:00`);
              const isToday = isSameDay(cellDate, today);
              const todayInViewedMonth =
                year === today.getFullYear() && month === today.getMonth();
              const isReferenceDay =
                !todayInViewedMonth &&
                year === 2024 &&
                month === 4 &&
                cell.isCurrentMonth &&
                cell.day === 13;
              const isHighlighted = isToday || isReferenceDay;
              const isSelected = selectedDate === cell.date;

              return (
                <button
                  key={cell.date}
                  type="button"
                  onClick={() => {
                    if (!cell.isCurrentMonth) {
                      onMonthChange(cell.year, cell.month);
                    }
                    onSelectedDateChange(
                      selectedDate === cell.date ? null : cell.date,
                    );
                  }}
                  className={cn(
                    "relative min-h-[74px] bg-card p-1.5 text-left transition-colors hover:bg-slate-800/30",
                    isSelected && "bg-blue-500/10",
                  )}
                >
                  <div className="absolute left-1.5 top-1">
                    {isHighlighted ? (
                      <span
                        className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#3b82f6] text-[10px] font-semibold text-white"
                      >
                        {cell.day}
                      </span>
                    ) : (
                      <span
                        className={cn(
                          "text-[11px] font-medium tabular-nums",
                          cell.isCurrentMonth
                            ? "text-slate-300"
                            : "text-slate-600",
                        )}
                      >
                        {cell.day}
                      </span>
                    )}
                  </div>

                  {aggregate && cell.isCurrentMonth ? (
                    <div className="flex min-h-[74px] flex-col items-center justify-center pt-3 text-center text-[9px] leading-snug">
                      <span className="font-semibold text-emerald-400">
                        {aggregate.count} Sold
                      </span>
                      <span className="mt-0.5 font-medium text-[#d4e157]">
                        {formatCalendarSalesAmount(aggregate.totalSales)}
                      </span>
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-slate-700/80 px-3 py-2.5 text-[10px]">
            <span className="text-[12px] font-semibold text-white tabular-nums">
              {stats.total} Total Sold
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="tabular-nums">
                {formatCurrency(stats.totalSales)} Total Sales
              </span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="h-2 w-2 rounded-full bg-violet-400" />
              <span className="tabular-nums">
                {formatCurrency(stats.totalGrossProfit)} Total Profit
              </span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span className="tabular-nums">
                {formatCurrency(stats.averageGrossProfit)} Avg Profit
              </span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              <span className="tabular-nums">
                {stats.pendingCount} Pending Payments
              </span>
            </span>
          </div>
        </div>
      ) : view === "week" ? (
        <div className="mt-3 space-y-2">
          {weekDays.map((day) => {
            const iso = toIsoDate(
              day.getFullYear(),
              day.getMonth(),
              day.getDate(),
            );
            const aggregate = dayAggregates.get(iso);
            const dayRecords = records.filter((r) => r.dateSold === iso);
            const isToday = isSameDay(day, today);

            return (
              <button
                key={iso}
                type="button"
                onClick={() =>
                  onSelectedDateChange(selectedDate === iso ? null : iso)
                }
                className={cn(
                  "rounded-sm border border-slate-800/60 px-3 py-2 text-left transition-colors hover:bg-slate-800/30",
                  selectedDate === iso && "border-blue-500/40 bg-blue-500/10",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "text-[11px] font-semibold",
                      isToday ? "text-blue-400" : "text-slate-200",
                    )}
                  >
                    {day.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  {aggregate ? (
                    <span className="text-[10px] text-emerald-400">
                      {aggregate.count} sold -{" "}
                      {formatCalendarSalesAmount(aggregate.totalSales)}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500">No sales</span>
                  )}
                </div>
                {dayRecords.length > 0 && (
                  <div className="mt-1.5 space-y-1">
                    {dayRecords.map((row) => (
                      <div
                        key={row.id}
                        className="text-[10px] text-slate-400"
                      >
                        {row.vehicleLabel} -{" "}
                        {formatCalendarSalesAmount(row.salePrice)}
                      </div>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mt-3 max-h-[320px] space-y-1 overflow-y-auto pr-1">
          {listRecords.length === 0 ? (
            <p className="py-6 text-center text-[11px] text-slate-500">
              No sold vehicles this month.
            </p>
          ) : (
            listRecords.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() =>
                  onSelectedDateChange(
                    selectedDate === row.dateSold ? null : row.dateSold,
                  )
                }
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-sm border border-slate-800/50 px-2.5 py-2 text-left transition-colors hover:bg-slate-800/30",
                  selectedDate === row.dateSold && "border-blue-500/40 bg-blue-500/10",
                )}
              >
                <div className="min-w-0">
                  <div className="truncate text-[11px] font-medium text-slate-200">
                    {row.vehicleLabel}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {formatSoldDate(row.dateSold)} - {row.buyer}
                  </div>
                </div>
                <span className="shrink-0 text-[11px] font-semibold text-emerald-400">
                  {formatCalendarSalesAmount(row.salePrice)}
                </span>
              </button>
            ))
          )}
        </div>
      )}

      {view !== "month" && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-800 pt-3 text-[10px] text-slate-400">
          <span className="font-semibold text-white tabular-nums">
            {stats.total} Total Sold
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="tabular-nums">
              {formatCurrency(stats.totalSales)} Total Sales
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            <span className="tabular-nums">
              {formatCurrency(stats.totalGrossProfit)} Total Profit
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span className="tabular-nums">
              {formatCurrency(stats.averageGrossProfit)} Avg Profit
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            <span className="tabular-nums">
              {stats.pendingCount} Pending Payments
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
