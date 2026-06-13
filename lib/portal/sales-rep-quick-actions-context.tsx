"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type SalesRepQuickActionsContextValue = {
  triggerAddVehicle: () => void;
  vehicleSignal: number;
  clearVehicleSignal: () => void;
};

const SalesRepQuickActionsContext =
  createContext<SalesRepQuickActionsContextValue | null>(null);

export function SalesRepQuickActionsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [vehicleSignal, setVehicleSignal] = useState(0);

  const triggerAddVehicle = useCallback(() => {
    setVehicleSignal((n) => n + 1);
  }, []);

  const clearVehicleSignal = useCallback(() => setVehicleSignal(0), []);

  const value = useMemo(
    () => ({
      triggerAddVehicle,
      vehicleSignal,
      clearVehicleSignal,
    }),
    [triggerAddVehicle, vehicleSignal, clearVehicleSignal],
  );

  return (
    <SalesRepQuickActionsContext.Provider value={value}>
      {children}
    </SalesRepQuickActionsContext.Provider>
  );
}

export function useSalesRepQuickActions() {
  const ctx = useContext(SalesRepQuickActionsContext);
  if (!ctx) {
    throw new Error(
      "useSalesRepQuickActions must be used within SalesRepQuickActionsProvider",
    );
  }
  return ctx;
}

export function useSalesRepQuickActionsOptional() {
  return useContext(SalesRepQuickActionsContext);
}
