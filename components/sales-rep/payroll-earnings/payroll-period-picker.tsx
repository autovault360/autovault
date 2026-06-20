"use client";

import { Calendar, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import type { PayrollPeriodMonth } from "@/lib/sales-rep/payroll-earnings/types";

const PERIOD_OPTIONS: { value: PayrollPeriodMonth; label: string }[] = [
  { value: "2026-05", label: "May 1 �€“ May 31, 2026" },
  { value: "2026-04", label: "Apr 1 �€“ Apr 30, 2026" },
  { value: "2026-03", label: "Mar 1 �€“ Mar 31, 2026" },
  { value: "2026-02", label: "Feb 1 �€“ Feb 28, 2026" },
  { value: "2026-01", label: "Jan 1 �€“ Jan 31, 2026" },
];

type Props = {
  value: PayrollPeriodMonth;
  displayLabel: string;
  onChange: (month: PayrollPeriodMonth) => void;
};

export default function PayrollPeriodPicker({
  value,
  displayLabel,
  onChange,
}: Props) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as PayrollPeriodMonth)}>
      <SelectTrigger
        theme="dark"
        className="h-9 min-w-[220px] gap-2 border-slate-700/80 bg-[#0f1729]/80 px-3 text-[12px] text-slate-200 shadow-none [&>svg:last-child]:hidden"
      >
        <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-500" />
        <span className="flex-1 text-left">{displayLabel}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-500" />
      </SelectTrigger>
      <SelectContent theme="dark" className="border-slate-700 bg-card">
        {PERIOD_OPTIONS.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            theme="dark"
            className="text-[12px]"
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
