"use client";

import { Calendar, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PAYMENT_STATUS_OPTIONS,
  TRANSACTION_TYPE_OPTIONS,
} from "@/lib/dealer/dashboard/transaction-constants";
import type {
  TransactionPaymentStatus,
  TransactionType,
} from "@/lib/dealer/dashboard/types";

export type TransactionFilters = {
  search: string;
  type: TransactionType | "all";
  status: TransactionPaymentStatus | "all";
  dateLabel: string;
};

export default function TransactionsToolbar({
  filters,
  onSearchChange,
  onTypeChange,
  onStatusChange,
  onExport,
}: {
  filters: TransactionFilters;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: TransactionType | "all") => void;
  onStatusChange: (value: TransactionPaymentStatus | "all") => void;
  onExport: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-0 flex-1 basis-[200px]">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
        <Input
          theme="dark"
          value={filters.search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by VIN, Stock #, Dealer, Auction..."
          className="h-8 border-[#1e293b]     pl-8 text-[11px]"
        />
      </div>

      <Select value={filters.type} onValueChange={(v) => onTypeChange(v as TransactionType | "all")}>
        <SelectTrigger theme="dark" className="h-8 w-[120px] border-[#1e293b]     text-[11px]">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent theme="dark" className="border-[#1e293b]    ">
          <SelectItem value="all" theme="dark">All Types</SelectItem>
          {TRANSACTION_TYPE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} theme="dark">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.status} onValueChange={(v) => onStatusChange(v as TransactionPaymentStatus | "all")}>
        <SelectTrigger theme="dark" className="h-8 w-[115px] border-[#1e293b]     text-[11px]">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent theme="dark" className="border-[#1e293b]    ">
          <SelectItem value="all" theme="dark">All Status</SelectItem>
          {PAYMENT_STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} theme="dark">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <button
        type="button"
        className="flex h-8 items-center gap-1.5 rounded-md border border-[#1e293b]     px-2.5 text-[11px] text-slate-400"
      >
        <Calendar className="h-3.5 w-3.5" />
        {filters.dateLabel}
      </button>

      <Button
        type="button"
        variant="outline"
        onClick={onExport}
        className="h-8 gap-1.5 border-[#1e293b] bg-[#0a101d]/60 text-[11px] text-slate-300 hover:bg-slate-800/40"
      >
        <Upload className="h-3.5 w-3.5" />
        Export
      </Button>
    </div>
  );
}
