"use client";

import { useRouter } from "next/navigation";
import InventoryMiniPanel from "@/components/dealer/dashboard/inventory-mini-panel";
import ProfitLossSummaryPanel from "@/components/dealer/dashboard/profit-loss-summary-panel";
import RecentActivityPanel from "@/components/dealer/dashboard/recent-activity-panel";
import type {
  ActivityItem,
  ProfitLossPoint,
  WholesaleVehicle,
} from "@/lib/dealer/dashboard/types";
import { ADMIN_PANEL_SHELL_CLASS } from "./admin-panel-styles";

type Props = {
  vehicles: WholesaleVehicle[];
  profitLossPoints: ProfitLossPoint[];
  profitLossSummary: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
  };
  activities: ActivityItem[];
};

export default function AnalyticsRow({
  vehicles,
  profitLossPoints,
  profitLossSummary,
  activities,
}: Props) {
  const router = useRouter();

  return (
    <section className="mb-3.5 grid grid-cols-1 gap-3 lg:grid-cols-3">
      <InventoryMiniPanel
        vehicles={vehicles}
        shellClassName={ADMIN_PANEL_SHELL_CLASS}
        onViewAll={() => router.push("/dashboard/vehicles")}
      />
      <ProfitLossSummaryPanel
        data={profitLossPoints}
        summary={profitLossSummary}
        shellClassName={ADMIN_PANEL_SHELL_CLASS}
      />
      <RecentActivityPanel
        activities={activities}
        shellClassName={ADMIN_PANEL_SHELL_CLASS}
      />
    </section>
  );
}
