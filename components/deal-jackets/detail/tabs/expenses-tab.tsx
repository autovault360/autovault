"use client";

import DataTable, { type Column } from "@/components/reusable/DataTable";
import { formatCurrency, formatDisplayDate } from "@/lib/deal-jackets/types";
import type { DealJacketDetail } from "@/lib/deal-jackets/detail-types";
import { DetailTabPanel } from "../detail-primitives";

export default function ExpensesTab({ detail }: { detail: DealJacketDetail }) {
  const columns: Column<DealJacketDetail["expenses"][number]>[] = [
    {
      key: "name",
      header: "Expense Name",
      sortable: true,
      accessor: (row) => row.name,
      cell: (row) => (
        <span className="font-medium text-white">{row.name}</span>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      accessor: (row) => row.category,
    },
    {
      key: "date",
      header: "Date",
      sortable: true,
      accessor: (row) => row.date,
      cell: (row) => formatDisplayDate(row.date),
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      accessor: (row) => row.amount,
      cell: (row) => (
        <span className="font-medium text-white">
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      key: "notes",
      header: "Notes",
      cell: (row) => (
        <span className="text-slate-500">{row.notes ?? "..."}</span>
      ),
    },
  ];

  return (
    <DetailTabPanel>
      <DataTable
        columns={columns}
        data={detail.expenses}
        rowKey="id"
        pageSize={10}
        addPagination
        paginationSummaryLabel="expenses"
        emptyMessage="No vehicle expenses recorded."
      />
    </DetailTabPanel>
  );
}
