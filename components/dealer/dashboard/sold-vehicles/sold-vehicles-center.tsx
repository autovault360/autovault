"use client";

import { useMemo, useState } from "react";
import { CardShell } from "@/components/dashboard/card-shell";
import { exportSoldVehiclesCsv } from "@/lib/dealer/dashboard/export-sold-vehicles";
import {
  buildSoldVehicleKpiStrip,
  computeSoldVehicleTableFooter,
  filterSoldVehicles,
} from "@/lib/dealer/dashboard/sold-vehicle-calculations";
import { DEFAULT_SOLD_VEHICLE_PERIOD } from "@/lib/dealer/dashboard/sold-vehicle-constants";
import type {
  SaleType,
  SoldVehicleKpiStrip as SoldVehicleKpiStripData,
  SoldVehicleRecord,
  TransactionPaymentStatus,
} from "@/lib/dealer/dashboard/types";
import SoldVehicleKpiStripComponent from "./sold-vehicle-kpi-strip";
import SoldVehiclesCenterHeader from "./sold-vehicles-center-header";
import SoldVehiclesTable from "./sold-vehicles-table";
import SoldVehiclesToolbar, {
  type SoldVehicleFilters,
} from "./sold-vehicles-toolbar";

function getPeriodDates(preset: string) {
  if (preset === "this_month") return DEFAULT_SOLD_VEHICLE_PERIOD;
  if (preset === "last_month") {
    return {
      preset: "last_month" as const,
      start: "2024-04-01",
      end: "2024-04-30",
      label: "04/01/2024 - 04/30/2024",
    };
  }
  if (preset === "this_quarter") {
    return {
      preset: "this_quarter" as const,
      start: "2024-04-01",
      end: "2024-06-30",
      label: "04/01/2024 - 06/30/2024",
    };
  }
  return {
    preset: "ytd" as const,
    start: "2024-01-01",
    end: "2024-05-31",
    label: "01/01/2024 - 05/31/2024",
  };
}

export default function SoldVehiclesCenter({
  soldVehicles,
  soldVehicleKpis,
  loading,
  activeRowKey,
  onAddSoldVehicle,
  onViewSale,
  onRowClick,
}: {
  soldVehicles: SoldVehicleRecord[];
  soldVehicleKpis: SoldVehicleKpiStripData;
  loading?: boolean;
  activeRowKey?: string | null;
  onAddSoldVehicle: () => void;
  onViewSale: (record: SoldVehicleRecord) => void;
  onRowClick?: (record: SoldVehicleRecord) => void;
}) {
  const [periodPreset, setPeriodPreset] = useState<string>(
    DEFAULT_SOLD_VEHICLE_PERIOD.preset,
  );
  const [search, setSearch] = useState("");
  const [saleTypeFilter, setSaleTypeFilter] = useState<SaleType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<
    TransactionPaymentStatus | "all"
  >("all");

  const period = getPeriodDates(periodPreset);

  const filters: SoldVehicleFilters = {
    search,
    saleType: saleTypeFilter,
    status: statusFilter,
    dateLabel: period.label,
  };

  const filtered = useMemo(
    () =>
      filterSoldVehicles(soldVehicles, {
        search,
        saleType: saleTypeFilter,
        status: statusFilter,
        dateStart: period.start,
        dateEnd: period.end,
      }),
    [soldVehicles, search, saleTypeFilter, statusFilter, period.start, period.end],
  );

  const dynamicKpis = useMemo(
    () =>
      filtered.length === soldVehicles.length
        ? soldVehicleKpis
        : buildSoldVehicleKpiStrip(filtered),
    [filtered, soldVehicles.length, soldVehicleKpis],
  );

  const footer = useMemo(() => computeSoldVehicleTableFooter(filtered), [filtered]);

  const handleExport = () => {
    exportSoldVehiclesCsv(filtered);
  };

  return (
    <CardShell className="min-w-0 max-w-full overflow-hidden border-[#1e293b] bg-[#0a101d]/60 backdrop-blur-sm">
      <div className="space-y-3.5">
        <SoldVehiclesCenterHeader
          periodPreset={periodPreset}
          onPeriodChange={setPeriodPreset}
          onAddSoldVehicle={onAddSoldVehicle}
        />

        <SoldVehicleKpiStripComponent kpis={dynamicKpis} loading={loading} />

        <SoldVehiclesToolbar
          filters={filters}
          onSearchChange={setSearch}
          onSaleTypeChange={setSaleTypeFilter}
          onStatusChange={setStatusFilter}
          onExport={handleExport}
        />

        <SoldVehiclesTable
          records={filtered}
          loading={loading}
          activeRowKey={activeRowKey}
          onRowClick={onRowClick}
          onView={onViewSale}
        />

        <div className="flex flex-wrap gap-x-6 gap-y-1 border-t border-[#1e293b] pt-3 text-[11px]">
          <span className="text-[#64748b]">
            Showing{" "}
            <strong className="text-white tabular-nums">{footer.count}</strong>{" "}
            sold vehicles
          </span>
          <span className="text-[#64748b]">
            Total Sales:{" "}
            <strong className="text-white tabular-nums">
              {footer.formatted.totalSales}
            </strong>
          </span>
          <span className="text-[#64748b]">
            Gross Profit:{" "}
            <strong className="text-emerald-400 tabular-nums">
              {footer.formatted.totalGrossProfit}
            </strong>
          </span>
          <span className="text-[#64748b]">
            Pending:{" "}
            <strong className="text-amber-400 tabular-nums">
              {footer.formatted.pendingAmount}
            </strong>
          </span>
        </div>
      </div>
    </CardShell>
  );
}
