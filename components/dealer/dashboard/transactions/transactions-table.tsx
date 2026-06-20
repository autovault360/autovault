"use client";

import { Eye, FileText, MoreVertical } from "lucide-react";
import DataTable, { type Column } from "@/components/reusable/DataTable";
import { formatCurrencyExact } from "@/lib/dealer/dashboard/calculations";
import { formatTransactionDate } from "@/lib/dealer/dashboard/transaction-calculations";
import type { DealerTransaction } from "@/lib/dealer/dashboard/types";
import TransactionPaymentBadge from "./transaction-payment-badge";
import TransactionTypeBadge from "./transaction-type-badge";

const TABLE_WRAPPER_CLASS =
  "[&>div]:min-w-0 [&>div]:max-w-full [&>div]:overflow-x-auto [&>div]:rounded-sm [&>div]:border [&>div]:border-slate-800/60 " +
  "[&_table]:min-w-[1200px] [&_table]:w-full [&_table]:text-[11px] " +
  "[&_thead]:  [&_thead_tr]:border-b [&_thead_tr]:border-slate-800 " +
  "[&_th]:px-2.5 [&_th]:py-2.5 [&_th]:text-[9.5px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[0.08em] [&_th]:text-slate-500 " +
  "[&_td]:px-2.5 [&_td]:py-2.5 [&_td]:align-middle " +
  "[&_tbody_tr]:border-b [&_tbody_tr]:border-slate-800/50 [&_tbody_tr]:transition-colors [&_tbody_tr:last-child]:border-0 " +
  "[&_tbody_tr:hover]:bg-slate-800/25 " +
  "[&>div>div:last-child]:border-t [&>div>div:last-child]:border-slate-800";

export default function TransactionsTable({
  transactions,
  loading,
  activeRowKey,
  onRowClick,
  onView,
}: {
  transactions: DealerTransaction[];
  loading?: boolean;
  activeRowKey?: string | null;
  onRowClick?: (transaction: DealerTransaction) => void;
  onView: (transaction: DealerTransaction) => void;
}) {
  const columns: Column<DealerTransaction>[] = [
    {
      key: "transactionDate",
      header: "Date",
      sortable: true,
      accessor: (row) => row.transactionDate,
      cell: (row) => (
        <span className="whitespace-nowrap text-slate-400">
          {formatTransactionDate(row.transactionDate)}
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      accessor: (row) => row.type,
      cell: (row) => <TransactionTypeBadge type={row.type} />,
    },
    {
      key: "vehicleLabel",
      header: "Vehicle",
      cell: (row) => (
        <div className="flex min-w-[160px] items-center gap-2">
          {row.vehicleImageUrl ? (
            <img
              src={row.vehicleImageUrl}
              alt=""
              className="h-8 w-10 shrink-0 rounded border border-slate-800 object-cover"
            />
          ) : (
            <div className="flex h-8 w-10 shrink-0 items-center justify-center rounded border border-slate-800 bg-slate-800 text-[8px] text-slate-500">
              No Photo
            </div>
          )}
          <span className="truncate text-[11px] font-medium text-slate-200">
            {row.vehicleLabel}
          </span>
        </div>
      ),
    },
    {
      key: "stockNumber",
      header: "Stock #",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-[11px] text-slate-300">{row.stockNumber}</span>
      ),
    },
    {
      key: "vin",
      header: "VIN",
      cell: (row) => (
        <span className="max-w-[120px] truncate font-mono text-[10px] text-slate-500">
          {row.vin}
        </span>
      ),
    },
    {
      key: "buyerSeller",
      header: "Buyer / Seller",
      sortable: true,
      cell: (row) => (
        <span className="text-[11px] font-medium text-white">{row.buyerSeller}</span>
      ),
    },
    {
      key: "auction",
      header: "Auction",
      cell: (row) => (
        <span className="text-[11px] text-slate-400">{row.auction ?? "�€”"}</span>
      ),
    },
    {
      key: "salePurchasePrice",
      header: "Sale / Purchase Price",
      sortable: true,
      accessor: (row) => row.salePurchasePrice,
      cell: (row) => (
        <span className="tabular-nums text-[11px] font-semibold text-white">
          {formatCurrencyExact(row.salePurchasePrice)}
        </span>
      ),
    },
    {
      key: "grossProfit",
      header: "Gross Profit",
      sortable: true,
      accessor: (row) => row.grossProfit ?? -1,
      cell: (row) =>
        row.grossProfit != null ? (
          <span className="tabular-nums text-[11px] font-semibold text-emerald-400">
            {formatCurrencyExact(row.grossProfit)}
          </span>
        ) : (
          <span className="text-slate-600">�€”</span>
        ),
    },
    {
      key: "paymentStatus",
      header: "Payment Status",
      cell: (row) => <TransactionPaymentBadge status={row.paymentStatus} />,
    },
    {
      key: "documents",
      header: "Documents",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-blue-400">
            <FileText className="h-3.5 w-3.5" />
            <span className="text-[10px]">{row.documents.length}</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onView(row);
            }}
            className="rounded p-0.5 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
            aria-label="View transaction"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="rounded p-0.5 text-slate-600 transition hover:bg-slate-800 hover:text-slate-400"
            aria-label="More actions"
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={`min-w-0 max-w-full py-1 ${TABLE_WRAPPER_CLASS}`}>
      <DataTable
        columns={columns}
        data={transactions}
        rowKey="id"
        addPagination
        pageSize={5}
        loading={loading}
        onRowClick={onRowClick}
        activeRowKey={activeRowKey}
        paginationSummaryLabel="transactions"
        emptyMessage="No transactions match your filters."
      />
    </div>
  );
}
