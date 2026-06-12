"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDealerDashboard } from "@/components/dealer/context/dealer-dashboard-context";
import DealerPageShell from "@/components/dealer/layout/dealer-page-shell";
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
      <div className="w-full min-w-0 max-w-full overflow-x-hidden  text-slate-100">
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
      <div className="w-full min-w-0 max-w-full overflow-x-hidden  text-slate-100">
        <TransactionsCenterSkeleton />
      </div>
    );
  }

  return (
    <DealerPageShell
      title="Dealer Transactions"
      description="Track wholesale purchases, sales, and payment status."
    >
      <TransactionsCenter
        transactions={dashboardData.transactions}
        transactionKpis={dashboardData.transactionKpis}
        loading={loading.transactions}
        activeRowKey={selectedTransaction?.id ?? null}
        onAddTransaction={openAdd}
        onViewTransaction={openView}
        onRowClick={openEdit}
        showTitle={false}
      />

      {showWorkspace && (
        <AddDealerTransactionWorkspace
          transaction={workspaceMode === "add" ? null : selectedTransaction}
          readOnly={workspaceMode === "view"}
          onClose={closeWorkspace}
        />
      )}
    </DealerPageShell>
  );
}
