"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDealerDashboard } from "@/components/dealer/context/dealer-dashboard-context";
import DealerHeader from "@/components/dealer/layout/dealer-header";
import type { DealerTransaction } from "@/lib/dealer/dashboard/types";
import AddDealerTransactionWorkspace from "./add-dealer-transaction-workspace";
import TransactionsCenter from "./transactions-center";
import TransactionsCenterSkeleton from "./transactions-center-skeleton";

type WorkspaceMode = "closed" | "add" | "edit" | "view";

export default function DealerTransactionsPageContent() {
  const searchParams = useSearchParams();
  const {
    dashboardData,
    loading,
    isInitialLoading,
    selectedTransaction,
    setSelectedTransaction,
  } = useDealerDashboard();

  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>("closed");

  useEffect(() => {
    if (searchParams.get("add") === "true") {
      setSelectedTransaction(null);
      setWorkspaceMode("add");
    }
  }, [searchParams, setSelectedTransaction]);

  if (isInitialLoading || !dashboardData) {
    return (
      <div className="w-full min-w-0 max-w-full overflow-x-hidden bg-[#060b13] text-slate-100">
        <TransactionsCenterSkeleton />
      </div>
    );
  }

  const showWorkspace = workspaceMode !== "closed";

  const openAdd = () => {
    setSelectedTransaction(null);
    setWorkspaceMode("add");
  };

  const openView = (txn: DealerTransaction) => {
    setSelectedTransaction(txn);
    setWorkspaceMode("view");
  };

  const openEdit = (txn: DealerTransaction) => {
    setSelectedTransaction(txn);
    setWorkspaceMode("edit");
  };

  const closeWorkspace = () => {
    setWorkspaceMode("closed");
    setSelectedTransaction(null);
  };

  if (loading.transactions) {
    return (
      <div className="w-full min-w-0 max-w-full overflow-x-hidden bg-[#060b13] text-slate-100">
        <TransactionsCenterSkeleton />
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden bg-[#060b13] text-slate-100 antialiased selection:bg-blue-500/30">
      <section className="mb-3.5 flex flex-wrap items-center justify-end gap-3 border-b border-slate-800/60 px-0.5 pb-3.5">
        <DealerHeader
          profile={dashboardData.profile}
          notificationCount={dashboardData.notificationCount}
        />
      </section>

      <TransactionsCenter
        transactions={dashboardData.transactions}
        transactionKpis={dashboardData.transactionKpis}
        loading={loading.transactions}
        activeRowKey={selectedTransaction?.id ?? null}
        onAddTransaction={openAdd}
        onViewTransaction={openView}
        onRowClick={openEdit}
      />

      {showWorkspace && (
        <AddDealerTransactionWorkspace
          transaction={workspaceMode === "add" ? null : selectedTransaction}
          readOnly={workspaceMode === "view"}
          onClose={closeWorkspace}
        />
      )}
    </div>
  );
}
