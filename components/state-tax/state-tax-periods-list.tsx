"use client";

import Link from "next/link";
import DataTable, { type Column } from "@/components/reusable/DataTable";
import type { PeriodSummary } from "@/lib/state-tax/types";

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

type PeriodRow = {
  id: string;
  name: string;
  dateRange: string;
  dueDate: string;
  status: string;
  vehicleCount: number;
  totalTaxEntered: string;
};

const statusBadge: Record<string, string> = {
  open: "bg-slate-600 text-slate-200",
  due: "bg-amber-500/20 text-amber-300",
  paid: "bg-blue-500/20 text-blue-300",
  filed: "bg-emerald-500/20 text-emerald-300",
  closed: "bg-slate-500/20 text-slate-400",
};

const columns: Column<PeriodRow>[] = [
  {
    key: "name",
    header: "Period",
    sortable: true,
    cell: (row) => <span className="text-[12px] font-medium text-white">{row.name}</span>,
  },
  {
    key: "dateRange",
    header: "Start \u2014 End",
    sortable: true,
    cell: (row) => <span className="text-[11.5px] text-slate-300">{row.dateRange}</span>,
  },
  {
    key: "dueDate",
    header: "Due Date",
    sortable: true,
    cell: (row) => <span className="text-[11.5px] text-slate-300">{row.dueDate}</span>,
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    cell: (row) => (
      <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${statusBadge[row.status] ?? "bg-slate-600 text-slate-200"}`}>
        {row.status}
      </span>
    ),
    headerClassName: "text-center",
  },
  {
    key: "vehicleCount",
    header: "Vehicles",
    sortable: true,
    cell: (row) => <span className="text-[11.5px] text-slate-300">{row.vehicleCount}</span>,
  },
  {
    key: "totalTaxEntered",
    header: "Tax Entered",
    sortable: false,
    cell: (row) => <span className="text-right text-[11.5px] font-medium text-slate-200">{row.totalTaxEntered}</span>,
  },
  {
    key: "actions" as string,
    header: "",
    sortable: false,
    cell: (row) => (
      <Link
        href={`/dashboard/state-tax/${row.id}`}
        className="text-[11px] font-medium text-blue-400 hover:text-blue-300"
      >
        View Details
      </Link>
    ),
  },
];

function padRows(periods: PeriodSummary[]): PeriodRow[] {
  return periods.map((p) => ({
    id: p.id,
    name: p.name,
    dateRange: `${new Date(p.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} \u2014 ${new Date(p.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
    dueDate: new Date(p.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    status: p.status,
    vehicleCount: p.vehicleCount,
    totalTaxEntered: fmt(p.totalTaxEntered),
  }));
}

type Props = {
  periods: PeriodSummary[];
};

export default function StateTaxPeriodsList({ periods }: Props) {
  const rows = padRows(periods);

  return (
    <DataTable<PeriodRow>
      columns={columns}
      data={rows}
      rowKey="id"
      pageSize={10}
      addPagination
      paginationSummaryLabel="periods"
      emptyMessage="No filing periods yet. Configure your tax settings to generate periods."
    />
  );
}
