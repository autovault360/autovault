"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AddVehicleModal from "@/components/vehicles/add/add-vehicle-modal";
import AddCustomerModal from "@/components/customers/add/add-customer-modal";
import AddExpenseModal from "@/components/expenses/add/add-expense-modal";
import type { SalesRepOption } from "@/lib/customers/types";
import { useAdminQuickActions } from "@/lib/portal/admin-quick-actions-context";

export default function AdminQuickActionsHost() {
  const router = useRouter();
  const {
    vehicleSignal,
    customerSignal,
    expenseSignal,
    expenseType,
    clearVehicleSignal,
    clearCustomerSignal,
    clearExpenseSignal,
  } = useAdminQuickActions();

  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [salesReps, setSalesReps] = useState<SalesRepOption[]>([]);

  useEffect(() => {
    if (vehicleSignal <= 0) return;
    setVehicleOpen(true);
    clearVehicleSignal();
  }, [vehicleSignal, clearVehicleSignal]);

  useEffect(() => {
    if (customerSignal <= 0) return;
    setCustomerOpen(true);
    clearCustomerSignal();
  }, [customerSignal, clearCustomerSignal]);

  useEffect(() => {
    if (expenseSignal <= 0) return;
    setExpenseOpen(true);
    clearExpenseSignal();
  }, [expenseSignal, clearExpenseSignal]);

  useEffect(() => {
    if (!customerOpen || salesReps.length > 0) return;
    fetch("/api/customers/sales-reps")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: SalesRepOption[]) => setSalesReps(data))
      .catch(() => setSalesReps([]));
  }, [customerOpen, salesReps.length]);

  const refresh = () => router.refresh();

  return (
    <>
      <AddVehicleModal
        open={vehicleOpen}
        onOpenChange={setVehicleOpen}
        onSuccess={refresh}
      />
      <AddCustomerModal
        open={customerOpen}
        onOpenChange={setCustomerOpen}
        salesReps={salesReps}
        onSaved={refresh}
      />
      <AddExpenseModal
        open={expenseOpen}
        onOpenChange={setExpenseOpen}
        expenseType={expenseType}
      />
    </>
  );
}
