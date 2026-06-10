"use client";

import DataTable, { type Column } from "@/components/reusable/DataTable";
import {
  formatCommissionCurrency,
  formatCommissionPrice,
} from "@/lib/sales-rep/commissions/format";
import {
  formatSoldDate,
  getVehicleLabel,
} from "@/lib/sales-rep/payroll-earnings/calculations";
import type { IEarningsByVehicle } from "@/lib/sales-rep/payroll-earnings/types";
import { cn } from "@/lib/utils";
import PayrollPaymentStatusBadge from "./payroll-payment-status-badge";

const TABLE_WRAPPER_CLASS =
  "[&>div]:overflow-x-auto [&>div]:rounded-sm [&>div]:border-0 [&>div]:bg-transparent " +
  "[&_table]:min-w-[1000px] [&_table]:w-full [&_table]:text-[11px] " +
  "[&_thead]:bg-transparent [&_thead_tr]:border-b [&_thead_tr]:border-slate-800/80 " +
  "[&_th]:px-3 [&_th]:py-3 [&_th]:text-[9.5px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[0.1em] [&_th]:text-slate-500 " +
  "[&_td]:px-3 [&_td]:py-3 [&_td]:align-middle " +
  "[&_tbody_tr]:border-b [&_tbody_tr]:border-slate-800/40 [&_tbody_tr]:transition-colors [&_tbody_tr:last-child]:border-0 " +
  "[&_tbody_tr:hover]:bg-slate-800/20 " +
  "[&>div>div:last-child]:border-t [&>div>div:last-child]:border-slate-800/80 [&>div>div:last-child]:px-1 [&>div>div:last-child]:py-3";

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=80&h=60&fit=crop";

type Props = {
  rows: IEarningsByVehicle[];
  loading?: boolean;
  pageSize?: number;
  onRowClick?: (row: IEarningsByVehicle) => void;
};

export default function PayrollEarningsTable({
  rows,
  loading,
  pageSize = 6,
  onRowClick,
}: Props) {
  const columns: Column<IEarningsByVehicle>[] = [
    {
      key: "vehicle",
      header: "Vehicle",
      sortable: true,
      accessor: (row) => getVehicleLabel(row),
      cell: (row) => (
        <div className="flex min-w-[190px] items-center gap-3">
          <img
            src={row.vehicleImageUrl || PLACEHOLDER_IMG}
            alt={getVehicleLabel(row)}
            className="h-10 w-[60px] shrink-0 rounded object-cover"
            loading="lazy"
          />
          <div className="min-w-0">
            <div className="truncate text-[12px] font-semibold text-white">
              {getVehicleLabel(row)}
            </div>
            <div className="truncate text-[10px] text-slate-500">
              Stock # {row.stockNumber}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      sortable: true,
      accessor: (row) => row.customerName,
      cell: (row) => (
        <div className="min-w-[130px]">
          <div className="text-[12px] font-medium text-white">
            {row.customerName}
          </div>
          <div className="text-[10px] text-slate-500">{row.customerPhone}</div>
        </div>
      ),
    },
    {
      key: "soldDate",
      header: "Sold Date",
      sortable: true,
      accessor: (row) => row.soldDate,
      cell: (row) => (
        <span className="whitespace-nowrap text-[12px] text-slate-300">
          {formatSoldDate(row.soldDate)}
        </span>
      ),
    },
    {
      key: "soldPrice",
      header: "Sold Price",
      sortable: true,
      accessor: (row) => row.soldPrice,
      cell: (row) => (
        <span className="text-[12px] font-medium tabular-nums text-white">
          {formatCommissionPrice(row.soldPrice)}
        </span>
      ),
    },
    {
      key: "grossProfit",
      header: "Gross Profit",
      sortable: true,
      accessor: (row) => row.grossProfit,
      cell: (row) => (
        <span className="text-[12px] font-semibold tabular-nums text-emerald-400">
          {formatCommissionPrice(row.grossProfit)}
        </span>
      ),
    },
    {
      key: "commissionRate",
      header: "Commission Rate",
      sortable: true,
      accessor: (row) => row.commissionRate,
      cell: (row) => (
        <span className="text-[12px] tabular-nums text-slate-300">
          {row.commissionRate}%
        </span>
      ),
    },
    {
      key: "commissionEarned",
      header: "Commission Earned",
      sortable: true,
      accessor: (row) => row.commissionEarned,
      cell: (row) => (
        <span className="text-[12px] font-semibold tabular-nums text-emerald-400">
          {formatCommissionCurrency(row.commissionEarned)}
        </span>
      ),
    },
    {
      key: "paymentStatus",
      header: "Payment Status",
      sortable: true,
      accessor: (row) => row.paymentStatus,
      cell: (row) => <PayrollPaymentStatusBadge status={row.paymentStatus} />,
    },
  ];

  return (
    <div className={cn(TABLE_WRAPPER_CLASS)}>
      <DataTable
        columns={columns}
        data={rows}
        rowKey="id"
        addPagination
        pageSize={pageSize}
        loading={loading}
        paginationSummaryLabel="vehicles"
        emptyMessage="No earnings records match your filters."
        onRowClick={onRowClick}
      />
    </div>
  );
}
