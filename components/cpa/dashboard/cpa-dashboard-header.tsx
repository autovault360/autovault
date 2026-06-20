"use client";

import { Calendar, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeaderTitle } from "@/components/layout/page-header-title";
import { cn } from "@/lib/utils";
import { useCpaPortal } from "../context/cpa-portal-context";
import { formatMonthDateRange } from "./cpa-dashboard-utils";

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

const YEARS = Array.from(
  { length: 5 },
  (_, i) => new Date().getFullYear() - 2 + i,
);

export default function CpaDashboardHeader() {
  const { session, month, year, setMonth, setYear } = useCpaPortal();

  if (!session) return null;

  const dateRangeLabel = formatMonthDateRange(month, year);

  return (
    <section className="mb-4 flex flex-col gap-4 border-b border-slate-800/60 pb-4 lg:flex-row lg:items-start lg:justify-between">
      <PageHeaderTitle
        title="CPA Dashboard"
        subtitle="Financial Summary Overview"
        titleClassName="text-[22px] font-bold tracking-[0.08em] text-white uppercase"
        subtitleClassName="text-[12px] text-slate-500 normal-case tracking-normal"
      />

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-slate-700/80 bg-[#0e1626] px-3 py-2">
            <Calendar className="h-4 w-4 shrink-0 text-slate-500" />
            <span className="text-[12px] font-medium text-slate-200 tabular-nums">
              {dateRangeLabel}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
          </div>
          <Select
            value={String(month)}
            onValueChange={(value) => setMonth(Number(value))}
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
          <Select
            value={String(year)}
            onValueChange={(value) => setYear(Number(value))}
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

        <div className="flex items-center gap-3 rounded-lg border border-slate-800/60 bg-[#0e1626]/50 px-3 py-2">
          <div className="min-w-0 text-right">
            <div className="truncate text-[13px] font-semibold text-white">
              {session.dealershipName || session.fullName}
            </div>
            <div className="truncate text-[11px] text-slate-500">
              {session.email}
            </div>
          </div>
          <Avatar className="h-10 w-10 shrink-0">
            {session.imageUrl ? (
              <AvatarImage src={session.imageUrl} alt={session.fullName} />
            ) : null}
            <AvatarFallback
              className={cn("bg-violet-600 text-sm font-semibold text-white")}
            >
              {session.initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </section>
  );
}
