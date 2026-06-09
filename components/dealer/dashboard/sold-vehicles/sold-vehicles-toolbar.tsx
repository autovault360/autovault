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
  SALE_TYPE_OPTIONS,
} from "@/lib/dealer/dashboard/sold-vehicle-constants";
import type {
  SaleType,
  TransactionPaymentStatus,
} from "@/lib/dealer/dashboard/types";

export type SoldVehicleFilters = {
  search: string;
  saleType: SaleType | "all";
  status: TransactionPaymentStatus | "all";
  dateLabel: string;
};

export default function SoldVehiclesToolbar({
  filters,
  onSearchChange,
  onSaleTypeChange,
  onStatusChange,
  onExport,
}: {
  filters: SoldVehicleFilters;
  onSearchChange: (value: string) => void;
  onSaleTypeChange: (value: SaleType | "all") => void;
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
          placeholder="Search by VIN, Stock #, Buyer, or Deal #..."
          className="h-8 border-[#1e293b] pl-8 text-[11px]"
        />
      </div>

      <Select
        value={filters.saleType}
        onValueChange={(v) => onSaleTypeChange(v as SaleType | "all")}
      >
        <SelectTrigger theme="dark" className="h-8 w-[130px] border-[#1e293b] text-[11px]">
          <SelectValue placeholder="All Sales Types" />
        </SelectTrigger>
        <SelectContent theme="dark" className="border-[#1e293b]">
          <SelectItem value="all" theme="dark">
            All Sales Types
          </SelectItem>
          {SALE_TYPE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} theme="dark">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.status}
        onValueChange={(v) => onStatusChange(v as TransactionPaymentStatus | "all")}
      >
        <SelectTrigger theme="dark" className="h-8 w-[140px] border-[#1e293b] text-[11px]">
          <SelectValue placeholder="All Payment Status" />
        </SelectTrigger>
        <SelectContent theme="dark" className="border-[#1e293b]">
          <SelectItem value="all" theme="dark">
            All Payment Status
          </SelectItem>
          {PAYMENT_STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} theme="dark">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <button
        type="button"
        className="flex h-8 items-center gap-1.5 rounded-md border border-[#1e293b] px-2.5 text-[11px] text-slate-400"
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
