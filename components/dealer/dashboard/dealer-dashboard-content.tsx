"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useDealerDashboard } from "../context/dealer-dashboard-context";
import { DEALER_SECTION_IDS } from "@/lib/dealer/dashboard/navigation";
import { PageHeaderTitle } from "@/components/layout/page-header-title";
import DealerKpiStrip from "./dealer-kpi-strip";
import InventoryMiniPanel from "./inventory-mini-panel";
import ProfitLossSummaryPanel from "./profit-loss-summary-panel";
import RecentActivityPanel from "./recent-activity-panel";
import TopPerformersRow from "./top-performers-row";
import InventoryOverviewSection from "./inventory/inventory-overview-section";
import ExpenseHubSection from "./expenses/expense-hub-section";
import DocumentVaultSection from "./documents/document-vault-section";
import DealerDashboardSkeleton from "./dealer-dashboard-skeleton";

export default function DealerDashboardContent() {
  const searchParams = useSearchParams();
  const {
    dashboardData,
    loading,
    isInitialLoading,
    expandInventory,
    navigateToSection,
  } = useDealerDashboard();

  useEffect(() => {
    if (searchParams.get("addExpense") !== "true") return;
    navigateToSection(DEALER_SECTION_IDS.expenses, "expense-add");
    const url = new URL(window.location.href);
    url.searchParams.delete("addExpense");
    window.history.replaceState(null, "", `${url.pathname}${url.hash}`);
  }, [searchParams, navigateToSection]);

  if (isInitialLoading || !dashboardData) {
    return <DealerDashboardSkeleton />;
  }

  return (
    <div
      id={DEALER_SECTION_IDS.dashboard}
      className="w-full min-w-0 max-w-full overflow-x-hidden  text-slate-100 antialiased selection:bg-blue-500/30"
    >
      <section className="mb-3.5 border-b border-slate-800/60 px-0.5 pb-3.5">
        <PageHeaderTitle
          title="Wholesale Dealer Dashboard"
          subtitle={`Welcome back, ${dashboardData.profile.dealershipName}`}
        />
      </section>

      <section className="mb-3.5">
        <DealerKpiStrip kpis={dashboardData.kpis} loading={loading.kpis} />
      </section>

      <section className="mb-3.5 grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-3">
        <InventoryMiniPanel
          vehicles={dashboardData.vehicles}
          loading={loading.inventory}
          onViewAll={() =>
            navigateToSection(DEALER_SECTION_IDS.inventory)
          }
        />
        <ProfitLossSummaryPanel
          data={dashboardData.profitLoss}
          summary={dashboardData.profitLossSummary}
          loading={loading.profitLoss}
        />
        <RecentActivityPanel
          activities={dashboardData.activity}
          loading={loading.activity}
        />
      </section>

      <section className="mb-3.5">
        <TopPerformersRow
          data={dashboardData.topPerformers}
          onAddVehicle={() => expandInventory(null)}
        />
      </section>

      <div className="flex flex-col gap-3.5">
        <InventoryOverviewSection />
        <ExpenseHubSection />
        <DocumentVaultSection />
      </div>
    </div>
  );
}
