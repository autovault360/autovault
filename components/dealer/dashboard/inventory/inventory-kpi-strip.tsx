"use client";

import { KPICard } from "@/components/ui/kpi-card";
import { ADMIN_PANEL_SHELL_CLASS } from "@/app/dashboard/_components/admin-panel-styles";
import { cn } from "@/lib/utils";
import type {
  InventoryKpiFilterKey,
  InventoryKpiStrip,
} from "@/lib/dealer/dashboard/types";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-800/80", className)}
    />
  );
}

const CARD_CLASS = ADMIN_PANEL_SHELL_CLASS;

type KpiCardConfig = {
  key: Exclude<InventoryKpiFilterKey, "all"> | "total_in_inventory";
  data: InventoryKpiStrip[keyof InventoryKpiStrip];
  clickable?: boolean;
};

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
    return (
      <div className="grid min-w-0 grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={cn("rounded-sm border p-3", CARD_CLASS)}>
            <SkeletonBar className="mb-2 h-10 w-10 rounded-full" />
            <SkeletonBar className="h-4 w-24" />
          </div>
        ))}
      </div>
    );
  }

  const cards: KpiCardConfig[] = [
    { key: "total_in_inventory", data: kpis.totalInInventory, clickable: false },
    { key: "missing_titles", data: kpis.missingTitles, clickable: true },
    { key: "pending_sale", data: kpis.pendingSale, clickable: true },
    { key: "sold_this_month", data: kpis.soldThisMonth, clickable: true },
    { key: "total_in_inventory", data: kpis.totalInventoryValue, clickable: false },
    { key: "total_in_inventory", data: kpis.avgDaysInInventory, clickable: false },
  ];

  const orderedCards: KpiCardConfig[] = [
    { key: "total_in_inventory", data: kpis.totalInInventory, clickable: false },
    { key: "total_in_inventory", data: kpis.totalInventoryValue, clickable: false },
    { key: "total_in_inventory", data: kpis.avgDaysInInventory, clickable: false },
    { key: "missing_titles", data: kpis.missingTitles, clickable: true },
    { key: "pending_sale", data: kpis.pendingSale, clickable: true },
    { key: "sold_this_month", data: kpis.soldThisMonth, clickable: true },
  ];

  return (
    <div className="grid min-w-0 grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
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
              isActive && "ring-2 ring-violet-500/60 rounded-sm",
            )}
          >
            <KPICard
              data={data}
              layout="default"
              showSparkline={false}
              showLink={false}
              className={CARD_CLASS}
            />
          </button>
        );
      })}
    </div>
  );
}
