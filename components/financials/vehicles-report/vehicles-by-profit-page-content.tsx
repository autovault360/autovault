"use client";

import { useCallback, useState } from "react";
import AutovaultPageHead from "@/components/layout/autovault-page-head";
import FinPeriodCalendar from "@/components/ui/fin-period-calendar";
import SectionHeading from "@/components/ui/section-heading";
import CategoryPerformanceGrid from "@/components/financials/vehicles-report/category-performance-grid";
import FinancialVehiclesTable, {
  VehicleDetailModal,
} from "@/components/financials/vehicles-report/financial-vehicles-table";
import VehiclesReportKpiStrip from "@/components/financials/vehicles-report/vehicles-report-kpi-strip";
import { useVehiclesByProfitReport } from "@/components/financials/vehicles-report/use-vehicles-by-profit-report";
import type { VehiclesByProfitReportData } from "@/lib/financials/vehicles-report/types";
import type { VehiclesReportVehicleRow } from "@/lib/financials/vehicles-report/types";
import { toast } from "sonner";

type KpiPreference = {
  kpiKey: string;
  colorHex: string;
};

export default function VehiclesByProfitPageContent({
  initialData,
}: {
  initialData: VehiclesByProfitReportData;
}) {
  const { data, loading, month, year, mode, setMonth, setYear, setMode } =
    useVehiclesByProfitReport(initialData);
  const [selectedVehicle, setSelectedVehicle] =
    useState<VehiclesReportVehicleRow | null>(null);
  const [kpiPreferences, setKpiPreferences] = useState<KpiPreference[]>([]);

  const handlePreferenceUpdate = useCallback(async (entry: KpiPreference) => {
    setKpiPreferences((prev) => {
      const existing = prev.find((p) => p.kpiKey === entry.kpiKey);
      if (existing) {
        return prev.map((p) =>
          p.kpiKey === entry.kpiKey ? { ...p, colorHex: entry.colorHex } : p,
        );
      }
      return [...prev, entry];
    });
    toast.success("KPI color updated");
  }, []);

  const handlePreferenceReset = useCallback((kpiKey: string) => {
    setKpiPreferences((prev) => prev.filter((p) => p.kpiKey !== kpiKey));
    toast.success("KPI color reset");
  }, []);

  return (
    <div className={loading ? "opacity-80 transition-opacity" : ""}>
      <AutovaultPageHead
        eyebrow="Inventory"
        title="Vehicles by Profit"
        subtitle="Sold vehicles that closed profitable - ranked highest net profit first."
      />

      <FinPeriodCalendar
        year={year}
        month={month}
        mode={mode}
        onYearChange={setYear}
        onMonthChange={setMonth}
        onModeChange={setMode}
      />

      <VehiclesReportKpiStrip
        kpis={data.summaryKpis}
        preferences={kpiPreferences}
        onPreferenceUpdate={handlePreferenceUpdate}
        onPreferenceReset={handlePreferenceReset}
      />

      <SectionHeading
        title="Top Performers"
        subtitle="Which vehicle categories are generating the most profit"
      />
      <CategoryPerformanceGrid cards={data.categoryCards} />

      <SectionHeading
        title="Profitable Sales"
        subtitle={data.rowCountSubtitle}
      />
      <FinancialVehiclesTable
        mode="profit"
        vehicles={data.vehicles}
        onViewVehicle={setSelectedVehicle}
        emptyMessage="No profitable sales match the selected period."
      />

      <VehicleDetailModal
        vehicle={selectedVehicle}
        open={selectedVehicle != null}
        onClose={() => setSelectedVehicle(null)}
      />
    </div>
  );
}
