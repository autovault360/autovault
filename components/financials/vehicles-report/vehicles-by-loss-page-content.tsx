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
import { useVehiclesByLossReport } from "@/components/financials/vehicles-report/use-vehicles-by-loss-report";
import type {
  VehiclesByLossReportData,
  VehiclesReportVehicleRow,
} from "@/lib/financials/vehicles-report/types";
import { toast } from "sonner";

type KpiPreference = {
  kpiKey: string;
  colorHex: string;
};

export default function VehiclesByLossPageContent({
  initialData,
}: {
  initialData: VehiclesByLossReportData;
}) {
  const { data, loading, month, year, mode, setMonth, setYear, setMode } =
    useVehiclesByLossReport(initialData);
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
        title="Vehicles by Loss"
        subtitle="Vehicles closing below cost (or projected to) - ranked by biggest loss first."
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
        title="Where You're Losing"
        subtitle="Which vehicle categories are costing you the most"
      />
      <CategoryPerformanceGrid cards={data.categoryCards} />

      <SectionHeading
        title="Underwater Vehicles"
        subtitle={data.rowCountSubtitle}
      />
      <FinancialVehiclesTable
        mode="loss"
        vehicles={data.vehicles}
        onViewVehicle={setSelectedVehicle}
        emptyMessage="No vehicles are at a loss right now - every unit is sold or projected profitably."
      />

      <VehicleDetailModal
        vehicle={selectedVehicle}
        open={selectedVehicle != null}
        onClose={() => setSelectedVehicle(null)}
      />
    </div>
  );
}
