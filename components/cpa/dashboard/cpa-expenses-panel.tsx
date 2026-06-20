"use client";

import { Wallet } from "lucide-react";
import type { CpaExpensePanel } from "@/lib/cpa/types";
import DataTable, { type Column } from "@/components/reusable/DataTable";
import CpaPanelShell, { CpaPanelStatCell } from "./cpa-panel-shell";
import { formatMoney, formatPercent } from "./cpa-dashboard-utils";
import { cn } from "@/lib/utils";

type ExpenseRow = {
  id: string;
  category: string;
  amount: number;
  pct: number;
};

const TABLE_WRAPPER_CLASS =
  "[&_table]:min-w-0 [&_table]:text-[11px] [&_thead_th]:border-slate-800 [&_thead_th]:bg-transparent [&_thead_th]:px-2 [&_thead_th]:py-2 [&_thead_th]:text-[9.5px] [&_thead_th]:font-semibold [&_thead_th]:uppercase [&_thead_th]:tracking-[0.08em] [&_thead_th]:text-slate-500 [&_tbody_td]:border-slate-800/50 [&_tbody_td]:px-2 [&_tbody_td]:py-2.5 [&_tbody_tr:hover]:bg-slate-800/25";

const columns: Column<ExpenseRow>[] = [
  {
    key: "category",
    header: "Category",
    cell: (row) => <span className="text-slate-300">{row.category}</span>,
  },
  {
    key: "amount",
    header: "Amount",
    headerClassName: "text-right",
    cellClassName: "text-right",
    cell: (row) => (
      <span className="font-medium tabular-nums text-white">
        {formatMoney(row.amount)}
      </span>
    ),
  },
  {
    key: "pct",
    header: "% of Expenses",
    headerClassName: "text-right",
    cellClassName: "text-right",
    cell: (row) => (
      <span className="tabular-nums text-slate-400">
        {formatPercent(row.pct, 1)}
      </span>
    ),
  },
];

export default function CpaExpensesPanel({
  panel,
  className,
}: {
  panel: CpaExpensePanel;
  className?: string;
}) {
  const rows: ExpenseRow[] = panel.categories.map((c, i) => ({
    id: `${c.label}-${i}`,
    category: c.label,
    amount: c.amount,
    pct: c.pct,
  }));

  return (
    <CpaPanelShell
      icon={Wallet}
      iconClassName="text-white"
      iconBgClassName="bg-orange-500"
      title="Expenses"
      subtitle="Operating expense breakdown"
      viewDetailsLinkClass="border border-orange-500 text-orange-500"
      viewDetailsHref="/cpa/expenses"
      className={className}
    >
      <div className="grid grid-cols-2 border-t border-l border-slate-700 lg:grid-cols-5">
        <CpaPanelStatCell
          label="Total Expenses"
          value={formatMoney(panel.totalExpenses)}
          valueClassName="text-orange-500 text-[16px]"
        />
        <CpaPanelStatCell
          label="Expense Ratio"
          value={formatPercent(panel.expenseRatio)}
          valueClassName="text-[16px]"
        />
        <CpaPanelStatCell
          label="Daily Average"
          value={formatMoney(panel.dailyAverage)}
          valueClassName="text-[16px]"
        />
        <CpaPanelStatCell
          label="Monthly Budget"
          value={formatMoney(panel.monthlyBudget)}
          valueClassName="text-[16px]"
        />
        <CpaPanelStatCell
          label="Vs Budget"
          value={formatPercent(panel.vsBudgetPct, 2)}
          valueClassName={cn(
            panel.vsBudgetPct <= 0 ? "text-emerald-500" : "text-red-500",
            "text-[16px]",
          )}
        />
      </div>

      <div className="mt-5">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Expense Breakdown
        </div>
        <div
          className={cn(
            "overflow-hidden rounded-md border border-slate-700/80 bg-[#0e1626]/40",
            TABLE_WRAPPER_CLASS,
          )}
        >
          <DataTable
            columns={columns}
            data={rows}
            rowKey="id"
            addPagination={false}
            emptyMessage="No expenses recorded for this period."
          />
        </div>
      </div>
    </CpaPanelShell>
  );
}
