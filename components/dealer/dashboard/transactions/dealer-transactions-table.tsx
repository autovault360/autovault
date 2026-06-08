"use client";

import { FileText } from "lucide-react";
import DataTable, { type Column } from "@/components/reusable/DataTable";
import { CardShell, CardHead } from "@/components/dashboard/card-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatCurrencyExact } from "@/lib/dealer/dashboard/calculations";
import type { DealerTransaction, PaymentStatus } from "@/lib/dealer/dashboard/types";

function PaymentBadge({ status }: { status: PaymentStatus }) {
  const config = {
    pending: { label: "Pending", className: "bg-amber-500/15 text-amber-400" },
    funded: { label: "Funded", className: "bg-blue-500/15 text-blue-400" },
    settled: { label: "Paid", className: "bg-emerald-500/15 text-emerald-400" },
  }[status];

  return (
    <Badge className={cn("pointer-events-none", config.className)}>
      {config.label}
    </Badge>
  );
}

function computeFooter(transactions: DealerTransaction[]) {
  const totalSales = transactions.reduce((s, t) => s + t.salePrice, 0);
  const paid = transactions
    .filter((t) => t.paymentStatus === "settled" || t.paymentStatus === "funded")
    .reduce((s, t) => s + t.salePrice, 0);
  const pending = transactions
    .filter((t) => t.paymentStatus === "pending")
    .reduce((s, t) => s + t.salePrice, 0);
  return { totalSales, paid, pending };
}

export default function DealerTransactionsTable({
  transactions,
  loading,
  onRowClick,
}: {
  transactions: DealerTransaction[];
  loading?: boolean;
  onRowClick: (transaction: DealerTransaction) => void;
}) {
  const footer = computeFooter(transactions);

  const columns: Column<DealerTransaction>[] = [
    {
      key: "dateSold",
      header: "Date Sold",
      sortable: true,
      cell: (row) => (
        <span className="text-[11px] text-slate-400">{row.dateSold}</span>
      ),
    },
    {
      key: "buyerDealer",
      header: "Buyer Dealer",
      sortable: true,
      cell: (row) => (
        <span className="text-[11px] font-medium text-white">
          {row.buyerDealer}
        </span>
      ),
    },
    {
      key: "contactPerson",
      header: "Contact Person",
      cell: (row) => (
        <span className="text-[11px] text-slate-400">{row.contactPerson}</span>
      ),
    },
    {
      key: "vehicleLabel",
      header: "Vehicle",
      cell: (row) => (
        <span className="text-[11px] text-slate-300">{row.vehicleLabel}</span>
      ),
    },
    {
      key: "stockNumber",
      header: "Stock #",
      cell: (row) => (
        <span className="tabular-nums text-[11px]">{row.stockNumber}</span>
      ),
    },
    {
      key: "salePrice",
      header: "Sale Price",
      sortable: true,
      accessor: (row) => row.salePrice,
      cell: (row) => (
        <span className="tabular-nums text-[11px] font-semibold text-white">
          {formatCurrencyExact(row.salePrice)}
        </span>
      ),
    },
    {
      key: "paymentStatus",
      header: "Payment Status",
      cell: (row) => <PaymentBadge status={row.paymentStatus} />,
    },
    {
      key: "documents",
      header: "Documents",
      cell: (row) => (
        <div className="flex items-center gap-1 text-blue-400">
          <FileText className="h-3.5 w-3.5" />
          <span className="text-[10px]">{row.documents.length}</span>
        </div>
      ),
    },
    {
      key: "notes",
      header: "Notes",
      cell: (row) => (
        <span className="max-w-[120px] truncate text-[10px] text-slate-500">
          {row.notes || "-"}
        </span>
      ),
    },
  ];

  return (
    <CardShell className="border-[#1e293b] bg-[#0a101d]/60 backdrop-blur-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <CardHead title="DEALER TRANSACTIONS" />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="flex h-8 items-center gap-1 rounded-md border border-[#1e293b] bg-[#070c14]/60 px-2.5 text-[11px] text-slate-400"
          >
            May 1 - May 24, 2024
          </button>
          <Select defaultValue="all">
            <SelectTrigger theme="dark" className="h-8 w-[120px] border-[#1e293b] bg-[#070c14]/60 text-[11px]">
              <SelectValue placeholder="All Dealers" />
            </SelectTrigger>
            <SelectContent theme="dark" className="border-[#1e293b] bg-[#0a101d]">
              <SelectItem value="all">All Dealers</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger theme="dark" className="h-8 w-[110px] border-[#1e293b] bg-[#070c14]/60 text-[11px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent theme="dark" className="border-[#1e293b] bg-[#0a101d]">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="funded">Funded</SelectItem>
              <SelectItem value="settled">Settled</SelectItem>
            </SelectContent>
          </Select>
          <Input
            theme="dark"
            placeholder="Search..."
            className="h-8 w-32 border-[#1e293b] bg-[#070c14]/60 text-[11px]"
          />
          <Button
            type="button"
            variant="outline"
            className="h-8 border-[#1e293b] bg-transparent text-[11px] text-slate-300"
          >
            Export
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={transactions}
        rowKey="id"
        addPagination
        pageSize={6}
        loading={loading}
        onRowClick={onRowClick}
        paginationSummaryLabel="transactions"
      />

      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 border-t border-[#1e293b] pt-3 text-[11px]">
        <span className="text-[#64748b]">
          Total Transactions:{" "}
          <strong className="text-white tabular-nums">
            {transactions.length}
          </strong>
        </span>
        <span className="text-[#64748b]">
          Total Sales:{" "}
          <strong className="text-white tabular-nums">
            {formatCurrencyExact(footer.totalSales)}
          </strong>
        </span>
        <span className="text-[#64748b]">
          Paid:{" "}
          <strong className="text-emerald-400 tabular-nums">
            {formatCurrencyExact(footer.paid)}
          </strong>
        </span>
        <span className="text-[#64748b]">
          Pending:{" "}
          <strong className="text-amber-400 tabular-nums">
            {formatCurrencyExact(footer.pending)}
          </strong>
        </span>
      </div>
    </CardShell>
  );
}

export { PaymentBadge };
