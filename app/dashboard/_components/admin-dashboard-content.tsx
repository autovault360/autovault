"use client";

import AdminHeader from "@/components/layout/AdminHeader";
import StickyNotesCard from "@/components/reports-reminders/sticky-notes-card";
import type { AdminDashboardContentProps } from "@/lib/dashboard/admin/types";
import AnalyticsRow from "./analytics-row";
import CalendarSection from "./calendar-section";
import GrossProfitSection from "./gross-profit-section";
import KPISection from "./kpi-section";
import PerformanceRow from "./performance-row";
import SalesRepSection from "./sales-rep-section";

export default function AdminDashboardContent(props: AdminDashboardContentProps) {
  return (
    <div>
      <AdminHeader />

      <section className="mb-3.5 flex flex-wrap items-center justify-between gap-3 px-0.5">
        <div>
          <h1 className="text-xl font-bold tracking-[0.12em] text-white">
            RETAIL DASHBOARD OVERVIEW
          </h1>
          <p className="mt-0.5 text-[12px] text-slate-500">{props.periodLabel}</p>
        </div>
      </section>

      <KPISection kpis={props.kpiCards} />
      <CalendarSection calendarReport={props.calendarReport} />
      <AnalyticsRow
        vehicles={props.inventoryVehicles}
        profitLossPoints={props.profitLossPoints}
        profitLossSummary={props.profitLossSummary}
        activities={props.activities}
      />
      <PerformanceRow
        topVehicle={props.topVehicle}
        topVehicleUnitsSold={props.topVehicleUnitsSold}
        topSalesRep={props.topSalesRep}
        todayEvents={props.todayEvents}
      />
      <div className="flex">
        <div className="w-full">
          <SalesRepSection
            periodLabel={props.periodLabel}
            kpiCards={props.salesRepKpis}
            tableRows={props.salesRepTableRows}
          />
          <GrossProfitSection
            periodLabel={props.grossProfitPeriodLabel}
            rows={props.grossProfitRows}
          />
        </div>
        <div className="ml-3.5 max-w-[360px] relative">
          <div className="sticky top-0 z-10">
            <StickyNotesCard notes={props.stickyNotes} />
          </div>
        </div>
      </div>
    </div>
  );
}
