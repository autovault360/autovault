"use client";

import { useDealerDashboard } from "@/components/dealer/context/dealer-dashboard-context";
import { DEALER_SECTION_IDS } from "@/lib/dealer/dashboard/navigation";
import DealerTransactionsTable from "./dealer-transactions-table";
import TransactionExpandedWorkspace from "./transaction-expanded-workspace";

export default function DealerTransactionsSection() {
  const {
    dashboardData,
    loading,
    transactionsRef,
    expandedSection,
    selectedTransaction,
    expandTransaction,
    collapseExpanded,
    setSelectedTransaction,
  } = useDealerDashboard();

  if (!dashboardData) return null;

  const isExpanded = expandedSection === "transaction";

  return (
    <section
      id={DEALER_SECTION_IDS.transactions}
      ref={transactionsRef}
      className="scroll-mt-4"
    >
      <DealerTransactionsTable
        transactions={dashboardData.transactions}
        loading={loading.transactions}
        onRowClick={(txn) => {
          setSelectedTransaction(txn);
          expandTransaction(txn);
        }}
      />

      {isExpanded && (
        <TransactionExpandedWorkspace
          transaction={selectedTransaction}
          onClose={collapseExpanded}
        />
      )}
    </section>
  );
}
