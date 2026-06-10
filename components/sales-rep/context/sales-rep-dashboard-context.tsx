"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getSalesRepDashboardData } from "@/lib/sales-rep/server/get-dashboard-data";
import type {
  DashboardLoadingState,
  DashboardSectionKey,
  IVehicleCard,
  SalesRepDashboardData,
} from "@/lib/sales-rep/dashboard/types";

type SalesRepDashboardContextValue = {
  dashboardData: SalesRepDashboardData | null;
  loading: DashboardLoadingState;
  selectedVehicle: IVehicleCard | null;
  setSelectedVehicle: (vehicle: IVehicleCard | null) => void;
  isDealJacketExpanded: boolean;
  setIsDealJacketExpanded: (expanded: boolean) => void;
  dealJacketRef: React.RefObject<HTMLDivElement | null>;
  refreshSection: (section: DashboardSectionKey) => Promise<void>;
  isInitialLoading: boolean;
  error: string | null;
};

const defaultLoading: DashboardLoadingState = {
  inventory: true,
  deals: true,
  messages: true,
  activity: true,
  topPerformer: true,
  leaderboard: true,
  commissions: true,
};

const SalesRepDashboardContext =
  createContext<SalesRepDashboardContextValue | null>(null);

export function SalesRepDashboardProvider({ children }: { children: ReactNode }) {
  const [dashboardData, setDashboardData] =
    useState<SalesRepDashboardData | null>(null);
  const [loading, setLoading] = useState<DashboardLoadingState>(defaultLoading);
  const [selectedVehicle, setSelectedVehicle] = useState<IVehicleCard | null>(
    null,
  );
  const [isDealJacketExpanded, setIsDealJacketExpanded] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dealJacketRef = useRef<HTMLDivElement | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      const result = await getSalesRepDashboardData();
      if ("data" in result) {
        setDashboardData(result.data);
        setSelectedVehicle(result.data.inventory[0] ?? null);
        setError(null);
      } else {
        setError(result.error ?? "Failed to load dashboard data");
        console.error("Dashboard data error:", result.error);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      console.error("Dashboard data exception:", err);
    }
    setIsInitialLoading(false);

    const sections: DashboardSectionKey[] = [
      "topPerformer",
      "leaderboard",
      "inventory",
      "deals",
      "messages",
      "activity",
      "commissions",
    ];
    for (let i = 0; i < sections.length; i++) {
      await new Promise((r) => setTimeout(r, 120));
      const section = sections[i];
      setLoading((prev) => ({ ...prev, [section]: false }));
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const refreshSection = useCallback(
    async (section: DashboardSectionKey) => {
      setLoading((prev) => ({ ...prev, [section]: true }));
      try {
        const result = await getSalesRepDashboardData();
        if ("data" in result) {
          setDashboardData(result.data);
          setError(null);
        }
      } catch (err) {
        console.error("Dashboard refresh error:", err);
      }
      setLoading((prev) => ({ ...prev, [section]: false }));
    },
    [],
  );

  const value = useMemo(
    () => ({
      dashboardData,
      loading,
      selectedVehicle,
      setSelectedVehicle,
      isDealJacketExpanded,
      setIsDealJacketExpanded,
      dealJacketRef,
      refreshSection,
      isInitialLoading,
      error,
    }),
    [
      dashboardData,
      loading,
      selectedVehicle,
      isDealJacketExpanded,
      refreshSection,
      isInitialLoading,
      error,
    ],
  );

  return (
    <SalesRepDashboardContext.Provider value={value}>
      {children}
    </SalesRepDashboardContext.Provider>
  );
}

export function useSalesRepDashboard() {
  const ctx = useContext(SalesRepDashboardContext);
  if (!ctx) {
    throw new Error(
      "useSalesRepDashboard must be used within SalesRepDashboardProvider",
    );
  }
  return ctx;
}
