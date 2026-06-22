"use client";

import CpaDashboardHeader from "./cpa-dashboard-header";
import CpaMonthSelector from "./cpa-month-selector";
import CpaDashboardSkeleton from "./cpa-dashboard-skeleton";
import CpaVehiclesByProfitPanel from "./cpa-vehicles-by-profit-panel";
import CpaVehiclesByLossPanel from "./cpa-vehicles-by-loss-panel";
import CpaSalesTaxPanel from "./cpa-sales-tax-panel";
import CpaPayrollCommissionPanel from "./cpa-payroll-commission-panel";
import CpaExpensesPanel from "./cpa-expenses-panel";
import { useCpaPortal } from "../context/cpa-portal-context";
import { KPICard } from "@/components/ui/kpi-card";
import { ADMIN_PANEL_SHELL_CLASS } from "@/app/dashboard/_components/admin-panel-styles";
import { kpiGridClass } from "@/lib/ui/kpi-grid";
import { toKpiCardData } from "./cpa-dashboard-utils";
import { Loader2 } from "lucide-react";

export default function CpaDashboardContent() {
  const { dashboard, loading } = useCpaPortal();

  if (!dashboard && loading) {
    return <CpaDashboardSkeleton />;
  }

  if (!dashboard) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-red-400">
        Unable to load dashboard data.
      </div>
    );
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 z-50 flex items-start justify-center bg-background/60 pt-32 backdrop-blur-[1px]">
          <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-background px-5 py-3 shadow-2xl">
            <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
            <span className="text-sm text-white">Updating data...</span>
          </div>
        </div>
      )}

      <CpaDashboardHeader />
      <CpaMonthSelector />

      <div className={kpiGridClass(dashboard.kpis.length, "mb-4")}>
        {dashboard.kpis.map((kpi) => (
          <KPICard
            key={kpi.label}
            data={toKpiCardData(kpi, dashboard.prevPeriodLabel)}
            layout="accent-top"
            showSparkline={false}
            showLink={false}
            className={ADMIN_PANEL_SHELL_CLASS}
          />
        ))}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <CpaVehiclesByProfitPanel stats={dashboard.vehicleProfitStats} />
        <CpaVehiclesByLossPanel stats={dashboard.vehicleLossStats} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
        <CpaExpensesPanel panel={dashboard.expensePanel} />
        <CpaPayrollCommissionPanel panel={dashboard.payrollPanel} />
        <CpaSalesTaxPanel className="col-span-2 2xl:col-span-1" panel={dashboard.salesTaxPanel} />
      </div>

      <p className="mt-6 text-center text-[11px] text-slate-600">
        All financial data is based on the selected time period. Switch between
        Monthly and Yearly views to analyze performance.
      </p>
    </div>
  );
}
