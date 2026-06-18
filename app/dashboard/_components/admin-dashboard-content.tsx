import type { AdminDashboardContentProps } from "@/lib/dashboard/admin/types";
import StickyNotesSection from "./sticky-notes-section";
import AnalyticsRow from "./analytics-row";
import CalendarSection from "@/components/dashboard/calendar-section";
import GrossProfitSection from "./gross-profit-section";
import KPISection from "./kpi-section";
import PerformanceRow from "./performance-row";
import SalesRepSection from "./sales-rep-section";

import { PageHeaderTitle } from "@/components/layout/page-header-title";

export default function AdminDashboardContent(props: AdminDashboardContentProps) {
  return (
    <div>
      <section className="mb-3.5 flex flex-wrap items-center justify-between gap-3 px-0.5">
        <PageHeaderTitle
          title="Retail Dashboard Overview"
          subtitle={props.periodLabel}
        />
      </section>

      <KPISection kpis={props.kpiCards} />
      <StickyNotesSection notes={props.stickyNotes} />
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
      <SalesRepSection />
      <GrossProfitSection
        periodLabel={props.grossProfitPeriodLabel}
        rows={props.grossProfitRows}
      />
    </div>
  );
}
