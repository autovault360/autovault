"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, RotateCcw, ChevronDown } from "lucide-react";
import { CardShell, CardHead } from "@/components/dashboard/card-shell";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/dealer/dashboard/calculations";
import {
  aggregateSoldVehiclesByDay,
  computeSoldVehicleStats,
  filterSoldVehiclesByMonth,
  formatCalendarSalesAmount,
  getMonthDateRange,
} from "@/lib/dealer/dashboard/sold-vehicle-calculations";
import type { SoldVehicleRecord } from "@/lib/dealer/dashboard/types";
import { cn } from "@/lib/utils";
import { DEALER_ROUTES } from "@/lib/dealer/dashboard/navigation";

function getDefaultCalendarMonth() {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() };
}

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

export default function SoldVehiclesMiniPanel({
  records,
  loading,
}: {
  records: SoldVehicleRecord[];
  loading?: boolean;
}) {
  const router = useRouter();
  const today = new Date();
  const [year, setYear] = useState(() => getDefaultCalendarMonth().year);
  const [month, setMonth] = useState(() => getDefaultCalendarMonth().month);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthRecords = useMemo(
    () => filterSoldVehiclesByMonth(records, year, month),
    [records, year, month],
  );
  const dayAggregates = useMemo(
    () => aggregateSoldVehiclesByDay(monthRecords),
    [monthRecords],
  );
  const stats = useMemo(
    () => computeSoldVehicleStats(monthRecords),
    [monthRecords],
  );

  const monthLabel = new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const calendarCells = useMemo(() => buildMonthGrid(year, month), [year, month]);

  const goMonth = (delta: number) => {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
    setSelectedDate(null);
  };

  const defaultMonth = getDefaultCalendarMonth();

  const goToday = () => {
    setYear(defaultMonth.year);
    setMonth(defaultMonth.month);
    setSelectedDate(null);
  };

  const handleReset = () => {
    setYear(defaultMonth.year);
    setMonth(defaultMonth.month);
    setSelectedDate(null);
  };

  const hasActiveFilters =
    selectedDate !== null ||
    year !== defaultMonth.year ||
    month !== defaultMonth.month;

  return (
    <CardShell className="min-w-0 max-w-full overflow-hidden border-[#1e293b] bg-card backdrop-blur-sm">
      <CardHead title="SOLD VEHICLES" />

      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            theme="dark"
            size="icon-sm"
            onClick={() => goMonth(-1)}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            variant="outline"
            theme="dark"
            size="icon-sm"
            onClick={() => goMonth(1)}
            aria-label="Next month"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
          <Select
            value={String(month)}
            onValueChange={(value) => {
              setMonth(Number(value));
              setSelectedDate(null);
            }}
          >
            <SelectTrigger
              theme="dark"
              size="sm"
            >
              <SelectValue>{monthLabel}</SelectValue>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </SelectTrigger>
            <SelectContent theme="dark">
              {MONTH_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  theme="dark"
                  className="text-[10px]"
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
            className="h-7 px-2 text-[10px]"
            onClick={goToday}
          >
            Today
          </Button>
          <Button
            type="button"
            variant="outline"
            theme="dark"
            size="sm"
            className="h-7 px-2 text-[10px]"
            onClick={handleReset}
            disabled={!hasActiveFilters}
          >
            <RotateCcw className="h-2.5 w-2.5" />
            Reset
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-6 animate-pulse rounded bg-slate-800/80"
            />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-sm border border-slate-700/80 bg-card">
          <div className="grid grid-cols-7 divide-x divide-slate-700/80 border-b border-slate-700/80">
            {WEEKDAY_LABELS.map((day) => (
              <div
                key={day}
                className="py-1 text-center text-[8px] font-semibold uppercase tracking-[0.06em] text-slate-500"
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
              const isSelected = selectedDate === cell.date;

              return (
                <button
                  key={cell.date}
                  type="button"
                  onClick={() => {
                    if (!cell.isCurrentMonth) {
                      setYear(cell.year);
                      setMonth(cell.month);
                    }
                    setSelectedDate(
                      selectedDate === cell.date ? null : cell.date,
                    );
                  }}
                  className={cn(
                    "relative min-h-[52px] bg-card p-1 text-left transition-colors hover:bg-slate-800/30",
                    isSelected && "bg-blue-500/10",
                  )}
                >
                  <div className="absolute left-1 top-0.5">
                    {isToday ? (
                      <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#3b82f6] text-[9px] font-semibold text-white">
                        {cell.day}
                      </span>
                    ) : (
                      <span
                        className={cn(
                          "text-[9px] font-medium tabular-nums",
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
                    <div className="flex min-h-[52px] flex-col items-center justify-center pt-4 text-center text-[8px] leading-tight">
                      <span className="font-semibold text-emerald-400">
                        {aggregate.count}
                      </span>
                      <span className="text-[#d4e157]">
                        {formatCalendarSalesAmount(aggregate.totalSales)}
                      </span>
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 border-t border-slate-700/80 px-2 py-1.5 text-[9px]">
            <span className="font-semibold text-white tabular-nums">
              {stats.total} Total
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="tabular-nums">
                {formatCurrency(stats.totalSales)}
              </span>
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
              <span className="tabular-nums">
                {formatCurrency(stats.totalGrossProfit)}
              </span>
            </span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => router.push(DEALER_ROUTES.soldVehicles)}
        className="text-left text-[11px] text-blue-400 hover:underline"
      >
        View full sold vehicles
      </button>
    </CardShell>
  );
}
