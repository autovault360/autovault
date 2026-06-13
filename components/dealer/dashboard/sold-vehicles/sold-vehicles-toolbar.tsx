"use client";

import { Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
    <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between">
      <div className="relative w-full xl:max-w-sm">
        <InputGroup theme="dark">
          <InputGroupAddon theme="dark">
            <Search className="h-3.5 w-3.5" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search by VIN, Stock #, Buyer, or Deal #..."
            value={filters.search}
            onChange={(e) => onSearchChange(e.target.value)}
            theme="dark"
          />
        </InputGroup>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.saleType}
          onValueChange={(v) => onSaleTypeChange(v as SaleType | "all")}
        >
          <SelectTrigger theme="dark" className="w-auto min-w-[130px]">
            <SelectValue placeholder="All Sales Types" />
          </SelectTrigger>
          <SelectContent theme="dark" className="text-slate-300">
            <SelectGroup>
              <SelectLabel>Sale Type</SelectLabel>
              <SelectItem value="all" theme="dark" className="text-[11.5px]">All Sales Types</SelectItem>
              {SALE_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} theme="dark" className="text-[11.5px]">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(v) => onStatusChange(v as TransactionPaymentStatus | "all")}
        >
          <SelectTrigger theme="dark" className="w-auto min-w-[130px]">
            <SelectValue placeholder="All Payment Status" />
          </SelectTrigger>
          <SelectContent theme="dark" className="text-slate-300">
            <SelectGroup>
              <SelectLabel>Payment Status</SelectLabel>
              <SelectItem value="all" theme="dark" className="text-[11.5px]">All Payment Status</SelectItem>
              {PAYMENT_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} theme="dark" className="text-[11.5px]">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          theme="dark"
          onClick={onExport}
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
      </div>
    </div>
  );
}
