"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import VehicleStatsCards from "@/components/vehicles/vehicle-stats-cards";
import FlooringCostBanner from "@/components/vehicles/flooring/flooring-cost-banner";
import type { InventoryVehicle } from "@/lib/vehicles/inventory-calculations";
import type { KpiPreference } from "@/lib/vehicles/server/kpi-preferences";
import type { FlooringSummary } from "@/lib/vehicles/flooring/types";

const VehiclesInventory = dynamic(
  () => import("@/components/vehicles/vehicles-inventory"),
  { ssr: false },
);

type VehiclesInventoryShellProps = {
  vehicles: InventoryVehicle[];
  defaultEditId?: string;
  initialKpiPreferences: KpiPreference[];
  flooringSummary: FlooringSummary | null;
};

export default function VehiclesInventoryShell({
  vehicles,
  defaultEditId,
  initialKpiPreferences,
  flooringSummary,
}: VehiclesInventoryShellProps) {
  const [kpiPreferences, setKpiPreferences] = useState(initialKpiPreferences);

  return (
    <>
      {/* Flooring banner — above KPI cards, below page header */}
      {flooringSummary && (
        <div className="mb-4">
          <FlooringCostBanner summary={flooringSummary} />
        </div>
      )}

      <VehicleStatsCards
        vehicles={vehicles}
        preferences={kpiPreferences}
        onPreferenceUpdate={(nextPreference) => {
          setKpiPreferences((prev) => {
            const existing = prev.find((entry) => entry.kpiKey === nextPreference.kpiKey);
            if (existing) {
              return prev.map((entry) =>
                entry.kpiKey === nextPreference.kpiKey
                  ? { ...entry, ...nextPreference }
                  : entry,
              );
            }
            return [...prev, nextPreference];
          });
        }}
        onPreferenceReset={(kpiKey) => {
          setKpiPreferences((prev) => prev.filter((entry) => entry.kpiKey !== kpiKey));
        }}
      />
      <VehiclesInventory
        vehicles={vehicles}
        defaultEditId={defaultEditId}
        initialKpiPreferences={kpiPreferences}
      />
    </>
  );
}
