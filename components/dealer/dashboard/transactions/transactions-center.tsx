"use client";

import { useMemo, useState } from "react";
import { ADMIN_PANEL_SHELL_CLASS } from "@/app/dashboard/_components/admin-panel-styles";
import { cn } from "@/lib/utils";
import { exportDealerTransactionsCsv } from "@/lib/dealer/dashboard/export-dealer-transactions";
import {
  buildTransactionKpiStrip,
  computeTableFooter,
  filterTransactions,
} from "@/lib/dealer/dashboard/transaction-calculations";
import { DEFAULT_TRANSACTION_PERIOD } from "@/lib/dealer/dashboard/transaction-constants";
import type {
  DealerTransaction,
  TransactionKpiStrip as TransactionKpiStripData,
  TransactionPaymentStatus,
  TransactionType,
} from "@/lib/dealer/dashboard/types";
import TransactionKpiStripComponent from "./transaction-kpi-strip";
import TransactionsCenterHeader from "./transactions-center-header";
import TransactionsTable from "./transactions-table";
import TransactionsToolbar, {
  type TransactionFilters,
} from "./transactions-toolbar";

function getPeriodDates(preset: string) {
  if (preset === "this_month") return DEFAULT_TRANSACTION_PERIOD;
  if (preset === "last_month") {
    return {
      preset: "last_month" as const,
      start: "2024-04-01",
      end: "2024-04-30",
      label: "04/01/2024 - 04/30/2024",
    };
  }
  if (preset === "this_quarter") {
    return {
      preset: "this_quarter" as const,
      start: "2024-04-01",
      end: "2024-06-30",
      label: "04/01/2024 - 06/30/2024",
    };
  }
  return {
    preset: "ytd" as const,
    start: "2024-01-01",
    end: "2024-05-31",
    label: "01/01/2024 - 05/31/2024",
  };
}

export default function TransactionsCenter({
  transactions,
  transactionKpis,
  loading,
  activeRowKey,
  onAddTransaction,
  onViewTransaction,
  onRowClick,
  showTitle = true,
}: {
  transactions: DealerTransaction[];
  transactionKpis: TransactionKpiStripData;
  loading?: boolean;
  activeRowKey?: string | null;
  onAddTransaction: () => void;
  onViewTransaction: (transaction: DealerTransaction) => void;
  onRowClick?: (transaction: DealerTransaction) => void;
  showTitle?: boolean;
}) {
  const [periodPreset, setPeriodPreset] = useState<string>(DEFAULT_TRANSACTION_PERIOD.preset);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<TransactionPaymentStatus | "all">("all");

  const period = getPeriodDates(periodPreset);

  const filters: TransactionFilters = {
    search,
    type: typeFilter,
    status: statusFilter,
    dateLabel: period.label,
  };

  const filtered = useMemo(
    () =>
      filterTransactions(transactions, {
        search,
        type: typeFilter,
        status: statusFilter,
        dateStart: period.start,
        dateEnd: period.end,
      }),
    [transactions, search, typeFilter, statusFilter, period.start, period.end],
  );

  const dynamicKpis = useMemo(
    () => (filtered.length === transactions.length ? transactionKpis : buildTransactionKpiStrip(filtered)),
    [filtered, transactions.length, transactionKpis],
  );

  const footer = useMemo(() => computeTableFooter(filtered), [filtered]);

  const handleExport = () => {
    exportDealerTransactionsCsv(filtered);
  };

  return (
    <div className={cn("rounded-sm border p-3.5 text-slate-200 shadow-none", ADMIN_PANEL_SHELL_CLASS)}>
      <div className="space-y-3.5">
        <TransactionsCenterHeader
          periodPreset={periodPreset}
          onPeriodChange={setPeriodPreset}
          onAddTransaction={onAddTransaction}
          showTitle={showTitle}
        />

        <TransactionKpiStripComponent kpis={dynamicKpis} loading={loading} />

        <TransactionsToolbar
          filters={filters}
          onSearchChange={setSearch}
          onTypeChange={setTypeFilter}
          onStatusChange={setStatusFilter}
          onExport={handleExport}
        />

        <TransactionsTable
          transactions={filtered}
          loading={loading}
          activeRowKey={activeRowKey}
          onRowClick={onRowClick}
          onView={onViewTransaction}
        />

        <div className="flex flex-wrap gap-x-6 gap-y-1 border-t border-slate-800 pt-3 text-[11px]">
          <span className="text-[#64748b]">
            Total:{" "}
            <strong className="text-white tabular-nums">{footer.count}</strong>
          </span>
          <span className="text-[#64748b]">
            Revenue:{" "}
            <strong className="text-white tabular-nums">
              {footer.formatted.totalRevenue}
            </strong>
          </span>
          <span className="text-[#64748b]">
            Completed:{" "}
            <strong className="text-emerald-400 tabular-nums">
              {footer.formatted.completedAmount}
            </strong>
          </span>
          <span className="text-[#64748b]">
            Pending:{" "}
            <strong className="text-amber-400 tabular-nums">
              {footer.formatted.pendingAmount}
            </strong>
          </span>
          <span className="text-[#64748b]">
            Gross Profit:{" "}
            <strong className="text-emerald-400 tabular-nums">
              {footer.formatted.grossProfit}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}
