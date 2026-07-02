"use client";

import FinPeriodCalendar from "@/components/ui/fin-period-calendar";
import type { ExpensePeriodMode } from "@/lib/expenses/expense-page-calculations";

type Props = {
  year: number;
  month: number;
  mode: ExpensePeriodMode;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onModeChange: (mode: ExpensePeriodMode) => void;
};

function toCal(m: ExpensePeriodMode): "monthly" | "yearly" {
  return m === "month" ? "monthly" : "yearly";
}

function fromCal(m: "monthly" | "yearly"): ExpensePeriodMode {
  return m === "monthly" ? "month" : "year";
}

export default function ExpensesFinCalendar(props: Props) {
  return (
    <FinPeriodCalendar
      year={props.year}
      month={props.month}
      mode={toCal(props.mode)}
      onYearChange={props.onYearChange}
      onMonthChange={props.onMonthChange}
      onModeChange={(m) => props.onModeChange(fromCal(m))}
    />
  );
}
