"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CardShell } from "@/components/dashboard/card-shell";
import {
  buildSoldVehicleKpiSummary,
  filterSoldVehicles,
  getSoldVehicleTabCounts,
  getUniqueMakes,
  getUniqueModels,
  validateSearchQuery,
} from "@/lib/sales-rep/sold-vehicles/calculations";
import { exportSoldVehiclesCsv } from "@/lib/sales-rep/sold-vehicles/export";
import type {
  ISalesRepSoldVehicle,
  SoldVehicleDateRange,
  SoldVehicleFilterState,
  SoldVehicleTab,
} from "@/lib/sales-rep/sold-vehicles/types";
import SoldVehiclesCustomRangeDialog from "./sold-vehicles-custom-range-dialog";
import SoldVehiclesDetailDialog from "./sold-vehicles-detail-dialog";
import SoldVehiclesExportMenu from "./sold-vehicles-export-menu";
import SoldVehiclesHowItWorks from "./sold-vehicles-how-it-works";
import SoldVehiclesKpiStrip from "./sold-vehicles-kpi-strip";
import SoldVehiclesTable from "./sold-vehicles-table";
import SoldVehiclesTabs from "./sold-vehicles-tabs";
import SoldVehiclesToolbar from "./sold-vehicles-toolbar";

const DEFAULT_FILTERS: SoldVehicleFilterState = {
  search: "",
  make: "all",
  model: "all",
  status: "all",
};

const DEFAULT_CUSTOM_RANGE: SoldVehicleDateRange = {
  start: "2026-06-01",
  end: "2026-06-10",
};

type Props = {
  vehicles: ISalesRepSoldVehicle[];
};

export default function SalesRepSoldVehiclesContent({ vehicles }: Props) {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SoldVehicleTab>("all");
  const [filters, setFilters] = useState<SoldVehicleFilterState>(DEFAULT_FILTERS);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [customRangeOpen, setCustomRangeOpen] = useState(false);
  const [customRange, setCustomRange] =
    useState<SoldVehicleDateRange>(DEFAULT_CUSTOM_RANGE);
  const [selectedVehicle, setSelectedVehicle] =
    useState<ISalesRepSoldVehicle | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const tabCounts = useMemo(
    () => getSoldVehicleTabCounts(vehicles),
    [vehicles],
  );

  const customRangeLabel = useMemo(() => {
    if (activeTab !== "custom") return undefined;
    const start = new Date(`${customRange.start}T12:00:00`).toLocaleDateString(
      "en-US",
      { month: "short", day: "numeric" },
    );
    const end = new Date(`${customRange.end}T12:00:00`).toLocaleDateString(
      "en-US",
      { month: "short", day: "numeric", year: "numeric" },
    );
    return `${start} – ${end}`;
  }, [activeTab, customRange]);

  const filteredVehicles = useMemo(
    () =>
      filterSoldVehicles(vehicles, {
        tab: activeTab,
        customRange: activeTab === "custom" ? customRange : null,
        filters,
      }),
    [vehicles, activeTab, customRange, filters],
  );

  const kpiSummary = useMemo(
    () => buildSoldVehicleKpiSummary(filteredVehicles),
    [filteredVehicles],
  );

  const makes = useMemo(() => getUniqueMakes(vehicles), [vehicles]);
  const models = useMemo(
    () => getUniqueModels(vehicles, filters.make),
    [vehicles, filters.make],
  );

  const hasActiveFilters =
    filters.make !== "all" ||
    filters.model !== "all" ||
    filters.status !== "all" ||
    filters.search.trim() !== "";

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
    const error = validateSearchQuery(value);
    setSearchError(error);
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchError(null);
  };

  const handleTabChange = (tab: SoldVehicleTab) => {
    setActiveTab(tab);
    setSearchError(null);
  };

  const handleCustomRangeApply = (range: SoldVehicleDateRange) => {
    setCustomRange(range);
    setActiveTab("custom");
    toast.success("Custom date range applied.");
  };

  const handleExportFiltered = () => {
    if (filteredVehicles.length === 0) {
      toast.error("No records to export. Adjust your filters and try again.");
      return;
    }
    exportSoldVehiclesCsv(
      filteredVehicles,
      `my-sold-vehicles-filtered-${new Date().toISOString().split("T")[0]}.csv`,
    );
    toast.success(`Exported ${filteredVehicles.length} vehicles.`);
  };

  const handleExportAll = () => {
    if (vehicles.length === 0) {
      toast.error("No records available to export.");
      return;
    }
    exportSoldVehiclesCsv(
      vehicles,
      `my-sold-vehicles-all-${new Date().toISOString().split("T")[0]}.csv`,
    );
    toast.success(`Exported all ${vehicles.length} vehicles.`);
  };

  const handleView = (vehicle: ISalesRepSoldVehicle) => {
    setSelectedVehicle(vehicle);
    setDetailOpen(true);
  };

  return (
    <div>
      <section className="mb-3.5 flex flex-wrap items-center justify-between gap-3 px-0.5">
        <div>
          <h1 className="text-xl font-bold tracking-[0.12em] text-white">MY SOLD VEHICLES</h1>
          <p className="mt-0.5 text-[12.5px] text-slate-500">
            Track your sold inventory, gross profit, and commission earnings.
          </p>
        </div>
      </section>

      <div className="mb-3.5">
        <SoldVehiclesKpiStrip summary={kpiSummary} loading={loading} />
      </div>

      <CardShell className="border-slate-700/80 bg-card backdrop-blur-sm">
        <div className="mb-3.5 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            <SoldVehiclesTabs
              activeTab={activeTab}
              tabCounts={tabCounts}
              customRangeLabel={customRangeLabel}
              onTabChange={handleTabChange}
              onCustomRangeClick={() => setCustomRangeOpen(true)}
            />
          </div>
          <SoldVehiclesExportMenu
            disabled={loading || vehicles.length === 0}
            onExportFiltered={handleExportFiltered}
            onExportAll={handleExportAll}
          />
        </div>

        <SoldVehiclesToolbar
          filters={filters}
          makes={makes}
          models={models}
          searchError={searchError}
          showAdvancedFilters={showAdvancedFilters}
          hasActiveFilters={hasActiveFilters}
          onSearchChange={handleSearchChange}
          onMakeChange={(make) =>
            setFilters((prev) => ({ ...prev, make, model: "all" }))
          }
          onModelChange={(model) =>
            setFilters((prev) => ({ ...prev, model }))
          }
          onStatusChange={(status) =>
            setFilters((prev) => ({ ...prev, status }))
          }
          onToggleAdvancedFilters={() =>
            setShowAdvancedFilters((prev) => !prev)
          }
          onClearFilters={handleClearFilters}
        />

        <div className="mt-3">
          <SoldVehiclesTable
            records={filteredVehicles}
            loading={loading}
            onView={handleView}
          />
        </div>
      </CardShell>

      <SoldVehiclesHowItWorks />

      <SoldVehiclesDetailDialog
        vehicle={selectedVehicle}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <SoldVehiclesCustomRangeDialog
        open={customRangeOpen}
        initialRange={customRange}
        onOpenChange={setCustomRangeOpen}
        onApply={handleCustomRangeApply}
      />
    </div>
  );
}
