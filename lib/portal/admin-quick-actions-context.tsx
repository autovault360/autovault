"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ExpenseFormType } from "@/lib/expenses/form-types";

type AdminQuickActionsContextValue = {
  triggerAddVehicle: () => void;
  triggerAddCustomer: () => void;
  triggerAddExpense: (type: ExpenseFormType) => void;
  vehicleSignal: number;
  customerSignal: number;
  expenseSignal: number;
  expenseType: ExpenseFormType;
  clearVehicleSignal: () => void;
  clearCustomerSignal: () => void;
  clearExpenseSignal: () => void;
};

const AdminQuickActionsContext =
  createContext<AdminQuickActionsContextValue | null>(null);

export function AdminQuickActionsProvider({ children }: { children: ReactNode }) {
  const [vehicleSignal, setVehicleSignal] = useState(0);
  const [customerSignal, setCustomerSignal] = useState(0);
  const [expenseSignal, setExpenseSignal] = useState(0);
  const [expenseType, setExpenseType] = useState<ExpenseFormType>("general");

  const triggerAddVehicle = useCallback(() => {
    setVehicleSignal((n) => n + 1);
  }, []);

  const triggerAddCustomer = useCallback(() => {
    setCustomerSignal((n) => n + 1);
  }, []);

  const triggerAddExpense = useCallback((type: ExpenseFormType) => {
    setExpenseType(type);
    setExpenseSignal((n) => n + 1);
  }, []);

  const clearVehicleSignal = useCallback(() => setVehicleSignal(0), []);
  const clearCustomerSignal = useCallback(() => setCustomerSignal(0), []);
  const clearExpenseSignal = useCallback(() => setExpenseSignal(0), []);

  const value = useMemo(
    () => ({
      triggerAddVehicle,
      triggerAddCustomer,
      triggerAddExpense,
      vehicleSignal,
      customerSignal,
      expenseSignal,
      expenseType,
      clearVehicleSignal,
      clearCustomerSignal,
      clearExpenseSignal,
    }),
    [
      triggerAddVehicle,
      triggerAddCustomer,
      triggerAddExpense,
      vehicleSignal,
      customerSignal,
      expenseSignal,
      expenseType,
      clearVehicleSignal,
      clearCustomerSignal,
      clearExpenseSignal,
    ],
  );

  return (
    <AdminQuickActionsContext.Provider value={value}>
      {children}
    </AdminQuickActionsContext.Provider>
  );
}

export function useAdminQuickActions() {
  const ctx = useContext(AdminQuickActionsContext);
  if (!ctx) {
    throw new Error(
      "useAdminQuickActions must be used within AdminQuickActionsProvider",
    );
  }
  return ctx;
}

export function useAdminQuickActionsOptional() {
  return useContext(AdminQuickActionsContext);
}
