"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDealerDashboard } from "../context/dealer-dashboard-context";
import { DEALER_SECTION_IDS } from "@/lib/dealer/dashboard/navigation";
import { PageHeaderTitle } from "@/components/layout/page-header-title";
import CalendarSection from "@/components/dashboard/calendar-section";
import DealerKpiStrip from "./dealer-kpi-strip";
import SoldVehiclesMiniPanel from "./sold-vehicles-mini-panel";
import ProfitLossSummaryPanel from "./profit-loss-summary-panel";
import RecentActivityPanel from "./recent-activity-panel";
import TopPerformersRow from "./top-performers-row";
import InventoryOverviewSection from "./inventory/inventory-overview-section";
import ExpenseHubSection from "./expenses/expense-hub-section";
import DocumentVaultSection from "./documents/document-vault-section";
import DealerDashboardSkeleton from "./dealer-dashboard-skeleton";
import { fetchCalendarReportAction } from "@/lib/calendar/server/actions";
import type { CalendarReport } from "@/lib/calendar/types";

export default function DealerDashboardContent() {
  const searchParams = useSearchParams();
  const {
    dashboardData,
    loading,
    isInitialLoading,
    expandInventory,
    navigateToSection,
  } = useDealerDashboard();
  const [liveCalendarReport, setLiveCalendarReport] =
    useState<CalendarReport | null>(null);

  useEffect(() => {
    fetchCalendarReportAction(new Date().getFullYear())
      .then(setLiveCalendarReport)
      .catch(() => {});
  }, []);

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

      <CalendarSection
        calendarReport={liveCalendarReport ?? dashboardData.calendarReport}
      />

      <section className="mb-3.5 grid min-w-0 gap-3 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-1">
          <SoldVehiclesMiniPanel
            records={dashboardData.soldVehicles}
            loading={loading.soldVehicles}
          />
        </div>

        {/* Right side */}
        <div className="lg:col-span-2 grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <ProfitLossSummaryPanel
              data={dashboardData.profitLoss}
              summary={dashboardData.profitLossSummary}
              loading={loading.profitLoss}
            />

            <RecentActivityPanel
              activities={dashboardData.activity}
              loading={loading.activity}
            />
          </div>

          <TopPerformersRow
            data={dashboardData.topPerformers}
          />
        </div>
      </section>

      <div className="flex flex-col gap-3.5">
        <InventoryOverviewSection />
        <ExpenseHubSection />
        <DocumentVaultSection />
      </div>
    </div>
  );
}
