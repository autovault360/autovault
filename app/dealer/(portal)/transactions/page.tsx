import { Suspense } from "react";
import DealerTransactionsPageContent from "@/components/dealer/dashboard/transactions/dealer-transactions-page-content";
import TransactionsCenterSkeleton from "@/components/dealer/dashboard/transactions/transactions-center-skeleton";

export default function DealerTransactionsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-w-0 max-w-full overflow-x-hidden bg-[#060b13] text-slate-100">
          <TransactionsCenterSkeleton />
        </div>
      }
    >
      <DealerTransactionsPageContent />
    </Suspense>
  );
}
