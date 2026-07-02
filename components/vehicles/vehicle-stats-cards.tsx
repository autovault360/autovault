"use client";

import { useCallback, useMemo } from "react";
import {
  buildInventoryKpiCards,
  computeInventoryStats,
  type InventoryVehicle,
} from "@/lib/vehicles/inventory-calculations";
import {
  resetInventoryKpiPreference,
  upsertInventoryKpiPreference,
  type KpiPreference,
} from "@/lib/vehicles/server/kpi-preferences";
import { toast } from "sonner";
import StatKpiCard from "@/components/ui/stat-kpi-card";

export default function VehicleStatsCards({
  vehicles,
  preferences,
  onPreferenceUpdate,
  onPreferenceReset,
}: {
  vehicles: InventoryVehicle[];
  preferences?: KpiPreference[];
  onPreferenceUpdate?: (entry: KpiPreference) => void;
  onPreferenceReset?: (kpiKey: string) => void;
}) {
  const stats = computeInventoryStats(vehicles);
  const cards = buildInventoryKpiCards(stats);

  const cardColorByKey = useMemo(() => {
    return (preferences ?? []).reduce<Record<string, string>>((acc, preference) => {
      acc[preference.kpiKey] = preference.colorHex;
      return acc;
    }, {});
  }, [preferences]);

  const getCardColor = (kpiKey: string, defaultColor: string) =>
    cardColorByKey[kpiKey] ?? defaultColor;

  const handleColorChange = useCallback(
    async (kpiKey: string, colorHex: string) => {
      const card = cards.find((c) => c.kpiKey === kpiKey);
      if (!card) return;

      onPreferenceUpdate?.({
        id: kpiKey,
        kpiKey,
        colorHex,
        columnKey: card.columnKey ?? null,
        sortOrder: 0,
      });

      const result = await upsertInventoryKpiPreference({
        kpiKey,
        colorHex,
        columnKey: card.columnKey,
        sortOrder: 0,
      });
      if (!result.success) {
        toast.error(result.error || "Failed to save KPI color");
      }
    },
    [cards, onPreferenceUpdate],
  );

  const handleColorReset = useCallback(
    async (kpiKey: string) => {
      onPreferenceReset?.(kpiKey);
      const result = await resetInventoryKpiPreference(kpiKey);
      if (!result.success) {
        toast.error(result.error || "Failed to reset KPI color");
      }
    },
    [onPreferenceReset],
  );

  return (
    <section className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2.5">
      {cards.map((card) => {
        const accent = getCardColor(card.kpiKey, card.defaultColorHex);
        return (
          <StatKpiCard
            key={card.kpiKey}
            kpiKey={card.kpiKey}
            accent={accent}
            defaultAccent={card.defaultColorHex}
            label={card.label}
            value={card.value}
            footer={card.footer}
            onColorChange={handleColorChange}
            onColorReset={handleColorReset}
          />
        );
      })}
    </section>
  );
}
