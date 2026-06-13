import { getAdminDashboardData } from "@/lib/dashboard/server/get-admin-dashboard-data";
import StickyNotesSection from "./sticky-notes-section";
import CalendarSection from "./calendar-section";
import AnalyticsRow from "./analytics-row";
import PerformanceRow from "./performance-row";
import SalesRepSection from "./sales-rep-section";
import GrossProfitSection from "./gross-profit-section";

type Props = {
  dealStatusFilter?: string;
};

export default async function ExtendedDashboardContent({
  dealStatusFilter,
}: Props) {
  const data = await getAdminDashboardData(dealStatusFilter);

  return (
    <>
      <StickyNotesSection notes={data.stickyNotes} />
      <CalendarSection calendarReport={data.calendarReport} />
      <AnalyticsRow
        vehicles={data.inventoryVehicles}
        profitLossPoints={data.profitLossPoints}
        profitLossSummary={data.profitLossSummary}
        activities={data.activities}
      />
      <PerformanceRow
        topVehicle={data.topVehicle}
        topVehicleUnitsSold={data.topVehicleUnitsSold}
        topSalesRep={data.topSalesRep}
        todayEvents={data.todayEvents}
      />
      <SalesRepSection />
      <GrossProfitSection
        periodLabel={data.grossProfitPeriodLabel}
        rows={data.grossProfitRows}
      />
    </>
  );
}
