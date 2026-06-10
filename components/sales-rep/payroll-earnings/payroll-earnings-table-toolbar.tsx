"use client";

import { Filter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PayrollEarningsFilterState } from "@/lib/sales-rep/payroll-earnings/types";

const STATUS_OPTIONS = [
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "failed", label: "Failed" },
  { value: "on_hold", label: "On Hold" },
];

type Props = {
  filters: PayrollEarningsFilterState;
  searchError: string | null;
  showAdvancedFilters: boolean;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onPaymentStatusChange: (value: string) => void;
  onPayrollCycleChange: (value: string) => void;
  onToggleAdvancedFilters: () => void;
  onClearFilters: () => void;
};

export default function PayrollEarningsTableToolbar({
  filters,
  searchError,
  showAdvancedFilters,
  hasActiveFilters,
  onSearchChange,
  onPaymentStatusChange,
  onPayrollCycleChange,
  onToggleAdvancedFilters,
  onClearFilters,
}: Props) {
  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full lg:max-w-sm">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <Input
              theme="dark"
              placeholder="Search by vehicle, customer, stock #, or deal..."
              value={filters.search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-8 border-slate-700/80 bg-slate-800/50 pl-8 text-[11px]"
              aria-invalid={!!searchError}
              maxLength={100}
            />
          </div>
          {searchError && (
            <p className="mt-1 text-[11px] text-red-400">{searchError}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={filters.paymentStatus} onValueChange={onPaymentStatusChange}>
            <SelectTrigger theme="dark" className="h-8 min-w-[130px] text-[11px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent theme="dark">
              <SelectItem value="all" theme="dark" className="text-[11.5px]">
                All Statuses
              </SelectItem>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} theme="dark" className="text-[11.5px]">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" theme="dark" size="sm" onClick={onClearFilters}>
              <X className="h-3 w-3" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {showAdvancedFilters && (
        <div className="flex flex-wrap items-center gap-2 rounded-sm border border-slate-700/60 bg-slate-900/20 px-3 py-2.5">
          <Filter className="h-3.5 w-3.5 text-slate-500" />
          <Select value={filters.payrollCycle} onValueChange={onPayrollCycleChange}>
            <SelectTrigger theme="dark" className="h-8 w-[160px] text-[11px]">
              <SelectValue placeholder="Payroll Cycle" />
            </SelectTrigger>
            <SelectContent theme="dark">
              <SelectGroup>
                <SelectLabel>Payment Status Filter</SelectLabel>
                <SelectItem value="all" theme="dark" className="text-[11.5px]">
                  All Cycles
                </SelectItem>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} theme="dark" className="text-[11.5px]">
                    {opt.label} Only
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <span className="text-[10px] text-slate-500">
            Search also supports Employee ID, Invoice Ref, and Transaction ID.
          </span>
        </div>
      )}
    </div>
  );
}
