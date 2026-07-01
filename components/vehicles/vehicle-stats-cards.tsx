"use client";

import { useMemo, useState } from "react";
import {
  buildInventoryKpiCards,
  computeInventoryStats,
  type InventoryKpiCard,
  type InventoryVehicle,
} from "@/lib/vehicles/inventory-calculations";
import {
  resetInventoryKpiPreference,
  upsertInventoryKpiPreference,
  type KpiPreference,
} from "@/lib/vehicles/server/kpi-preferences";
import { toast } from "sonner";
import KpiColorPickerPopup from "@/components/vehicles/kpi-color-picker-popup";

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
  const [picker, setPicker] = useState<{
    kpiKey: string;
    anchorRect: DOMRect;
  } | null>(null);

  const cardColorByKey = useMemo(() => {
    return (preferences ?? []).reduce<Record<string, string>>((acc, preference) => {
      acc[preference.kpiKey] = preference.colorHex;
      return acc;
    }, {});
  }, [preferences]);

  const activeCard = picker
    ? cards.find((card) => card.kpiKey === picker.kpiKey)
    : null;

  const getCardColor = (card: InventoryKpiCard) =>
    cardColorByKey[card.kpiKey] ?? card.defaultColorHex;

  const handleColorChange = async (card: InventoryKpiCard, colorHex: string) => {
    onPreferenceUpdate?.({
      id: card.kpiKey,
      kpiKey: card.kpiKey,
      colorHex,
      columnKey: card.columnKey ?? null,
      sortOrder: 0,
    });

    const result = await upsertInventoryKpiPreference({
      kpiKey: card.kpiKey,
      colorHex,
      columnKey: card.columnKey,
      sortOrder: 0,
    });
    if (!result.success) {
      toast.error(result.error || "Failed to save KPI color");
    }
  };

  const handleReset = async (card: InventoryKpiCard) => {
    onPreferenceReset?.(card.kpiKey);
    const result = await resetInventoryKpiPreference(card.kpiKey);
    if (!result.success) {
      toast.error(result.error || "Failed to reset KPI color");
      return;
    }
    setPicker(null);
  };

  return (
    <>
      <section className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2.5">
        {cards.map((card) => {
          const accent = getCardColor(card);
          return (
            <article
              key={card.kpiKey}
              className="group relative min-w-[140px] overflow-hidden rounded-xl border border-slate-700/80 bg-[#101826] px-5 py-[18px] transition hover:border-white/10 hover:bg-white/2.5"
            >
              <div
                className="pointer-events-none absolute bottom-0 left-5 right-5 h-0.5 origin-left scale-x-0 rounded-sm transition-transform duration-200 group-hover:scale-x-100"
                style={{ backgroundColor: accent }}
              />
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 whitespace-nowrap">
                {card.label}
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setPicker({
                    kpiKey: card.kpiKey,
                    anchorRect: event.currentTarget.getBoundingClientRect(),
                  });
                }}
                className="mt-1.5 cursor-pointer text-left font-mono text-[19px] leading-tight font-extrabold transition-opacity hover:opacity-85"
                style={{ color: accent }}
              >
                {card.value}
              </button>
              <div className="mt-1 text-[10.5px] text-slate-400">{card.footer}</div>
            </article>
          );
        })}
      </section>

      {activeCard && picker && (
        <KpiColorPickerPopup
          open
          anchorRect={picker.anchorRect}
          currentColor={getCardColor(activeCard)}
          onPickColor={(colorHex) => handleColorChange(activeCard, colorHex)}
          onReset={() => handleReset(activeCard)}
          onClose={() => setPicker(null)}
        />
      )}
    </>
  );
}
