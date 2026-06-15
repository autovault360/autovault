"use client";

import { KPICard } from "@/components/ui/kpi-card";
import { cn } from "@/lib/utils";
import {
  KPI_CARD_DEFAULT_PROPS,
  KPI_CARD_SHELL_CLASS,
  kpiGridClass,
} from "@/lib/ui/kpi-grid";
import KpiGridSkeleton from "@/components/ui/kpi-grid-skeleton";
import type {
  InventoryKpiFilterKey,
  InventoryKpiStrip,
} from "@/lib/dealer/dashboard/types";

type KpiCardConfig = {
  key: Exclude<InventoryKpiFilterKey, "all"> | "total_in_inventory";
  data: InventoryKpiStrip[keyof InventoryKpiStrip];
  clickable?: boolean;
};

const CARD_COUNT = 6;

export default function InventoryKpiStrip({
  kpis,
  loading,
  activeKpiFilter,
  onKpiClick,
}: {
  kpis: InventoryKpiStrip;
  loading?: boolean;
  activeKpiFilter: InventoryKpiFilterKey;
  onKpiClick: (filter: InventoryKpiFilterKey) => void;
}) {
  if (loading) {
    return <KpiGridSkeleton count={CARD_COUNT} />;
  }

  const orderedCards: KpiCardConfig[] = [
    { key: "total_in_inventory", data: kpis.totalInInventory, clickable: false },
    { key: "total_in_inventory", data: kpis.totalInventoryValue, clickable: false },
    { key: "total_in_inventory", data: kpis.avgDaysInInventory, clickable: false },
    { key: "missing_titles", data: kpis.missingTitles, clickable: true },
    { key: "pending_sale", data: kpis.pendingSale, clickable: true },
    { key: "sold_this_month", data: kpis.soldThisMonth, clickable: true },
  ];

  return (
    <div className={kpiGridClass(CARD_COUNT)}>
      {orderedCards.map(({ key, data, clickable }, index) => {
        const filterKey =
          key === "total_in_inventory" ? "all" : (key as InventoryKpiFilterKey);
        const isActive =
          clickable && activeKpiFilter === filterKey && activeKpiFilter !== "all";

        return (
          <button
            key={`${data.label}-${index}`}
            type="button"
            disabled={!clickable}
            onClick={() => {
              if (!clickable) return;
              onKpiClick(filterKey);
            }}
            className={cn(
              "text-left transition",
              clickable && "cursor-pointer hover:opacity-90",
              !clickable && "cursor-default",
              isActive && "rounded-sm ring-2 ring-violet-500/60",
            )}
          >
            <KPICard
              data={data}
              {...KPI_CARD_DEFAULT_PROPS}
              className={KPI_CARD_SHELL_CLASS}
            />
          </button>
        );
      })}
    </div>
  );
}
