"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button, ButtonIcon } from "@/components/ui/button";
import DealerPageShell from "@/components/dealer/layout/dealer-page-shell";
import type { WholesaleVehicle } from "@/lib/dealer/dashboard/types";
import InventoryCenter from "./inventory-center";

type Props = {
  vehicles: WholesaleVehicle[];
  defaultAddOpen?: boolean;
};

export default function DealerInventoryPageContent({
  vehicles,
  defaultAddOpen = false,
}: Props) {
  const [addSignal, setAddSignal] = useState(defaultAddOpen ? 1 : 0);

  return (
    <DealerPageShell
      title="Inventory Overview"
      description="Manage wholesale inventory, titles, and pipeline status."
      headerExtra={
        <Button type="button" size="action" onClick={() => setAddSignal((n) => n + 1)}>
          <ButtonIcon tone="default">
            <Plus />
          </ButtonIcon>
          Add Vehicle
        </Button>
      }
    >
      <InventoryCenter
        vehicles={vehicles}
        variant="page"
        addSignal={addSignal}
        onAddSignalConsumed={() => {}}
      />
    </DealerPageShell>
  );
}
