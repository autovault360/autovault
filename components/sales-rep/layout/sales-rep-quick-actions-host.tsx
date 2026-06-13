"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AddVehicleModal from "@/components/vehicles/add/add-vehicle-modal";
import { useSalesRepQuickActions } from "@/lib/portal/sales-rep-quick-actions-context";

export default function SalesRepQuickActionsHost() {
  const router = useRouter();
  const { vehicleSignal, clearVehicleSignal } = useSalesRepQuickActions();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (vehicleSignal <= 0) return;
    setOpen(true);
    clearVehicleSignal();
  }, [vehicleSignal, clearVehicleSignal]);

  return (
    <AddVehicleModal
      open={open}
      onOpenChange={setOpen}
      onSuccess={() => router.refresh()}
    />
  );
}
