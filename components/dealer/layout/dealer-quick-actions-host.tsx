"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AddVehicleModal from "@/components/vehicles/add/add-vehicle-modal";
import AddWholesaleExpenseModal from "@/components/dealer/dashboard/expenses/add-wholesale-expense-modal";
import AddSoldVehicleWorkspace from "@/components/dealer/dashboard/sold-vehicles/add-sold-vehicle-workspace";
import AddDealerTransactionWorkspace from "@/components/dealer/dashboard/transactions/add-dealer-transaction-workspace";
import { useDealerDashboard } from "../context/dealer-dashboard-context";

/**
 * Global quick-action overlays for the wholesale dealer portal.
 * Opens add flows instantly from header/sidebar without page navigation.
 */
export default function DealerQuickActionsHost() {
  const router = useRouter();
  const {
    inventoryAddSignal,
    clearInventoryAddSignal,
    refreshInventory,
    isExpenseModalOpen,
    setExpenseModalOpen,
    simulateSave,
    workspaceSaving,
    soldVehicleAddSignal,
    clearSoldVehicleAddSignal,
    transactionAddSignal,
    clearTransactionAddSignal,
  } = useDealerDashboard();

  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [soldOpen, setSoldOpen] = useState(false);
  const [transactionOpen, setTransactionOpen] = useState(false);

  useEffect(() => {
    if (inventoryAddSignal <= 0) return;
    setVehicleOpen(true);
    clearInventoryAddSignal();
  }, [inventoryAddSignal, clearInventoryAddSignal]);

  useEffect(() => {
    if (soldVehicleAddSignal <= 0) return;
    setSoldOpen(true);
    clearSoldVehicleAddSignal();
  }, [soldVehicleAddSignal, clearSoldVehicleAddSignal]);

  useEffect(() => {
    if (transactionAddSignal <= 0) return;
    setTransactionOpen(true);
    clearTransactionAddSignal();
  }, [transactionAddSignal, clearTransactionAddSignal]);

  return (
    <>
      <AddVehicleModal
        open={vehicleOpen}
        onOpenChange={setVehicleOpen}
        onSuccess={refreshInventory}
      />

      <AddWholesaleExpenseModal
        open={isExpenseModalOpen}
        onOpenChange={setExpenseModalOpen}
        onSave={simulateSave}
        saving={workspaceSaving}
      />

      {soldOpen && (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-[#070c14]/95 p-4 backdrop-blur-sm">
          <AddSoldVehicleWorkspace
            record={null}
            onClose={() => setSoldOpen(false)}
          />
        </div>
      )}

      {transactionOpen && (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-[#070c14]/95 p-4 backdrop-blur-sm">
          <AddDealerTransactionWorkspace
            transaction={null}
            onClose={() => setTransactionOpen(false)}
          />
        </div>
      )}
    </>
  );
}
