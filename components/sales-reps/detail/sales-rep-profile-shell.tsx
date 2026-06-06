"use client";

import { useCallback, useEffect, useState } from "react";
import AdminHeader from "@/components/layout/AdminHeader";
import type {
  SalesRepProfileDateRange,
  SalesRepProfileDetail,
} from "@/lib/sales-reps/profile-types";
import SalesRepBottomCards from "./sales-rep-bottom-cards";
import SalesRepCommissionHistoryTable from "./sales-rep-commission-history-table";
import SalesRepMessageBar from "./sales-rep-message-bar";
import SalesRepProfileBreadcrumb from "./sales-rep-profile-breadcrumb";
import SalesRepProfileToolbar from "./sales-rep-profile-toolbar";
import SalesRepProfileKpiRow from "./sales-rep-profile-kpi-row";
import SalesRepProfileSummaryCard from "./sales-rep-profile-summary-card";
import SalesRepReportsBar from "./sales-rep-reports-bar";
import SalesRepSalesTrendChart from "./sales-rep-sales-trend-chart";
import SalesRepVehiclesSoldTable from "./sales-rep-vehicles-sold-table";

type Props = {
  profile: SalesRepProfileDetail;
};

export default function SalesRepProfileShell({ profile: initialProfile }: Props) {
  const [profile, setProfile] = useState(initialProfile);
  const [dateRange, setDateRange] = useState(initialProfile.dateRange);

  useEffect(() => {
    setProfile(initialProfile);
    setDateRange(initialProfile.dateRange);
  }, [initialProfile]);

  const handleDateRangeChange = useCallback(
    (next: SalesRepProfileDateRange) => {
      setDateRange(next);
      // TODO(backend): refetch profile metrics for the selected date range
    },
    [],
  );

  return (
    <div className="relative pb-8">
      <AdminHeader />

      <SalesRepProfileBreadcrumb repName={profile.summary.fullName} />

      <section className="mb-3.5 flex flex-col gap-3.5 xl:flex-row xl:items-start xl:gap-4">
        <div className="min-w-0 flex-1">
          <SalesRepProfileSummaryCard summary={profile.summary} />
        </div>
        <SalesRepProfileToolbar
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
        />
      </section>

      <SalesRepProfileKpiRow kpis={profile.kpis} />

      <section className="mb-3.5 grid grid-cols-1 gap-3.5 xl:grid-cols-12">
        <div className="xl:col-span-5">
          <SalesRepVehiclesSoldTable
            sales={profile.vehicleSales}
            summary={profile.vehicleSalesSummary}
          />
        </div>
        <div className="xl:col-span-4">
          <SalesRepCommissionHistoryTable
            entries={profile.commissionHistory}
            summary={profile.commissionSummary}
          />
        </div>
        <div className="xl:col-span-3">
          <SalesRepSalesTrendChart
            data={profile.salesTrend}
            summary={profile.salesTrendSummary}
          />
        </div>
      </section>

      <SalesRepBottomCards
        followUps={profile.followUps}
        appointments={profile.appointments}
        notes={profile.notes}
        documents={profile.documents}
        dealJackets={profile.dealJackets}
      />

      <section className="grid grid-cols-1 items-stretch gap-3.5 xl:grid-cols-12">
        <div className="flex xl:col-span-5">
          <SalesRepMessageBar repName={profile.summary.fullName} />
        </div>
        <div className="flex xl:col-span-7">
          <SalesRepReportsBar actions={profile.reportActions} />
        </div>
      </section>
    </div>
  );
}
