"use client";

import { useEffect } from "react";
import { useDealerDashboard } from "@/components/dealer/context/dealer-dashboard-context";
import { DEALER_SECTION_IDS } from "@/lib/dealer/dashboard/navigation";
import InventoryCenter from "./inventory-center";

export default function InventoryOverviewSection() {
  const {
    dashboardData,
    loading,
    inventoryRef,
    inventoryAddSignal,
    clearInventoryAddSignal,
  } = useDealerDashboard();

  if (!dashboardData) return null;

  return (
    <section
      id={DEALER_SECTION_IDS.inventory}
      ref={inventoryRef}
      className="scroll-mt-4"
    >
      <InventoryCenter
        vehicles={dashboardData.vehicles}
        loading={loading.inventory}
        addSignal={inventoryAddSignal}
        onAddSignalConsumed={clearInventoryAddSignal}
      />
    </section>
  );
}
