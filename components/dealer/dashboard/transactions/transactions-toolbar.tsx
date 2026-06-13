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
    <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between">
      <div className="relative w-full xl:max-w-sm">
        <InputGroup theme="dark">
          <InputGroupAddon theme="dark">
            <Search className="h-3.5 w-3.5" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search by VIN, Stock #, Dealer, Auction..."
            value={filters.search}
            onChange={(e) => onSearchChange(e.target.value)}
            theme="dark"
          />
        </InputGroup>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={filters.type} onValueChange={(v) => onTypeChange(v as TransactionType | "all")}>
          <SelectTrigger theme="dark" className="w-auto min-w-[130px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent theme="dark" className="text-slate-300">
            <SelectGroup>
              <SelectLabel>Type</SelectLabel>
              <SelectItem value="all" theme="dark" className="text-[11.5px]">All Types</SelectItem>
              {TRANSACTION_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} theme="dark" className="text-[11.5px]">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={(v) => onStatusChange(v as TransactionPaymentStatus | "all")}>
          <SelectTrigger theme="dark" className="w-auto min-w-[130px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent theme="dark" className="text-slate-300">
            <SelectGroup>
              <SelectLabel>Payment Status</SelectLabel>
              <SelectItem value="all" theme="dark" className="text-[11.5px]">All Status</SelectItem>
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
