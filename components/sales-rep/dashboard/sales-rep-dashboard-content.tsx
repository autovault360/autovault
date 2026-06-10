"use client";

import {
  SalesRepDashboardProvider,
  useSalesRepDashboard,
} from "../context/sales-rep-dashboard-context";
import SalesRepHeader from "../layout/sales-rep-header";
import TopPerformerCard from "./top-performer-card";
import PersonalMetricsStrip from "./personal-metrics-strip";
import AvailableInventoryPanel from "./available-inventory-panel";
import QuickActionCard from "./quick-action-card";
import RecentDealJacketsTable from "./recent-deal-jackets-table";
import TeamMessagesCard from "./team-messages-card";
import RecentActivityCard from "./recent-activity-card";
import SalesRepDealJacketWorkspace from "./sales-rep-deal-jacket-workspace";
import CommissionSection from "./commissions/commission-section";
import SalesRepDashboardSkeleton from "./sales-rep-dashboard-skeleton";

function DashboardInner() {
  const {
    dashboardData,
    loading,
    selectedVehicle,
    setSelectedVehicle,
    isDealJacketExpanded,
    setIsDealJacketExpanded,
    dealJacketRef,
    isInitialLoading,
    error,
  } = useSalesRepDashboard();

  if (isInitialLoading) {
    return <SalesRepDashboardSkeleton />;
  }

  if (error && !dashboardData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-center">
        <div className="max-w-md">
          <p className="text-lg text-red-400">Failed to load dashboard</p>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return <SalesRepDashboardSkeleton />;
  }

  const handleDeskDeal = async () => {
    await new Promise((r) => setTimeout(r, 600));
    setIsDealJacketExpanded(true);
    requestAnimationFrame(() => {
      dealJacketRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  return (
    <div className="min-h-screen bg-[#060b13] text-slate-100 antialiased selection:bg-blue-500/30">
      {/* GLOBAL TOP MARGIN BANNER CONTROL HEADER */}
      <section className="mb-3.5 flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/60 px-0.5 pb-3.5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome back, {dashboardData.profile.name}
          </h1>
          <p className="mt-0.5 text-[12.5px] text-slate-500">
            Here&apos;s what&apos;s happening with your sales today.
          </p>
        </div>
        <SalesRepHeader
          profile={dashboardData.profile}
          notificationCount={dashboardData.notificationCount}
        />
      </section>

      {/* MASTER TWO-COLUMN GRID SYSTEM */}
      <section className="grid grid-cols-1 xl:grid-cols-[1fr_360px] 2xl:grid-cols-[1fr_400px] gap-3.5 items-start">
        
        {/* LEFT WORKSPACE FLOW BLOCK COLUMN CONTAINER */}
        <div className="flex flex-col gap-3.5 min-w-0">
          
          {/* ZONE 1: UNIFIED TOP PERFORMER HERO MODULE CARD */}
          <TopPerformerCard
            performerData={dashboardData.topPerformer}
            leaderboardEntries={dashboardData.leaderboard}
            loading={loading.topPerformer || loading.leaderboard}
          />

          {/* ZONE 2: FOUR-BLOCK INDEPENDENT PERSONAL METRICS STRIP */}
          <PersonalMetricsStrip metrics={dashboardData.myMetrics} />

          {/* ZONE 3: OPERATIONAL LEDGER SPLIT ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-start">
            {/* LEFT CONTAINER: HIGH-DENSITY INVENTORY DIRECTORY PANEL */}
            <AvailableInventoryPanel
              inventory={dashboardData.inventory}
              selectedVehicle={selectedVehicle}
              onSelect={setSelectedVehicle}
              loading={loading.inventory}
            />

            {/* RIGHT CONTAINER: ACTION DESK CONTROL CARD & TRANSACTION SUMMARY ROWS */}
            <div className="flex flex-col gap-3.5">
              <QuickActionCard onDeskDeal={handleDeskDeal} />
              <RecentDealJacketsTable
                deals={dashboardData.recentDealJackets}
                loading={loading.deals}
              />
            </div>
          </div>

          {/* ZONE 4: COMMISSIONS SECTION */}
          <CommissionSection
            data={dashboardData.commissions}
            loading={loading.commissions}
          />

          {/* ZONE 5: DEAL JACKET WORKSPACE */}
          <SalesRepDealJacketWorkspace
            expanded={isDealJacketExpanded}
            onCollapse={() => setIsDealJacketExpanded(false)}
            selectedVehicle={selectedVehicle}
            inventory={dashboardData.inventory}
            pricing={dashboardData.pricing}
            panelRef={dealJacketRef}
          />

        </div>

        {/* RIGHT STANDALONE COMMUNICATIONS COLUMN - STICKY */}
        <div className="flex flex-col gap-3.5 w-full xl:w-[360px] 2xl:w-[400px] shrink-0 sticky top-3.5">
          {/* STANDALONE ROW BLOCK A: MESSAGE CELL TILES */}
          <TeamMessagesCard
            messages={dashboardData.teamMessages}
            loading={loading.messages}
          />
          
          {/* STANDALONE ROW BLOCK B: RECENT SYSTEM ACTIVITY ACTIONS */}
          <RecentActivityCard
            activities={dashboardData.recentActivity}
            loading={loading.activity}
          />
        </div>

      </section>
    </div>
  );
}

export default function SalesRepDashboardContent() {
  return (
    <SalesRepDashboardProvider>
      <DashboardInner />
    </SalesRepDashboardProvider>
  );
}