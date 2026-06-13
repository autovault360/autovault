"use client";

import { useEffect } from "react";
import { Plus } from "lucide-react";
import { Button, ButtonIcon } from "@/components/ui/button";
import DealerPageShell from "@/components/dealer/layout/dealer-page-shell";
import { useDealerDashboard } from "@/components/dealer/context/dealer-dashboard-context";
import InventoryCenter from "./inventory-center";

type Props = {
  defaultAddOpen?: boolean;
};

export default function DealerInventoryPageContent({
  defaultAddOpen = false,
}: Props) {
  const { dashboardData, loading, triggerAddVehicle } = useDealerDashboard();

  useEffect(() => {
    if (defaultAddOpen) triggerAddVehicle();
  }, [defaultAddOpen, triggerAddVehicle]);

  if (!dashboardData) return null;

  return (
    <DealerPageShell
      title="Inventory Overview"
      description="Manage wholesale inventory, titles, and pipeline status."
      headerExtra={
        <Button type="button" size="action" onClick={triggerAddVehicle}>
          <ButtonIcon tone="default">
            <Plus />
          </ButtonIcon>
          Add Vehicle
        </Button>
      }
    >
      <InventoryCenter
        vehicles={dashboardData.vehicles}
        loading={loading.inventory}
        variant="page"
      />
    </DealerPageShell>
  );
}
