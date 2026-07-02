"use client";

import { useMemo, useCallback } from "react";
import { AV } from "@/lib/ui/autovault-design-tokens";
import StatKpiCard from "@/components/ui/stat-kpi-card";
import type { StatKpiData } from "@/components/ui/kpi-card";

type KpiPreference = {
  kpiKey: string;
  colorHex: string;
};

type Props = {
  kpis: StatKpiData[];
  preferences?: KpiPreference[];
  onPreferenceUpdate?: (entry: KpiPreference) => void;
  onPreferenceReset?: (kpiKey: string) => void;
};

const AV_ACCENT: Record<string, string> = {
  green: AV.green,
  blue: AV.blue,
  orange: AV.orange,
  purple: AV.purple,
  red: AV.red,
};

export default function VehiclesReportKpiStrip({
  kpis,
  preferences,
  onPreferenceUpdate,
  onPreferenceReset,
}: Props) {
  const cardColorByKey = useMemo(() => {
    return (preferences ?? []).reduce<Record<string, string>>((acc, pref) => {
      acc[pref.kpiKey] = pref.colorHex;
      return acc;
    }, {});
  }, [preferences]);

  const getCardColor = (label: string) => cardColorByKey[label] ?? undefined;

  const handleColorChange = useCallback(
    (kpiKey: string, colorHex: string) => {
      onPreferenceUpdate?.({ kpiKey, colorHex });
    },
    [onPreferenceUpdate],
  );

  const handleColorReset = useCallback(
    (kpiKey: string) => {
      onPreferenceReset?.(kpiKey);
    },
    [onPreferenceReset],
  );

  return (
    <section className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2.5">
      {kpis.map((kpi) => {
        const customColor = getCardColor(kpi.label);
        const accent = customColor ?? AV_ACCENT[kpi.accent];
        return (
          <StatKpiCard
            key={kpi.label}
            kpiKey={kpi.label}
            accent={accent}
            defaultAccent={AV_ACCENT[kpi.accent]}
            label={kpi.label}
            value={kpi.value}
            footer={kpi.foot}
            onColorChange={handleColorChange}
            onColorReset={handleColorReset}
          />
        );
      })}
    </section>
  );
}
