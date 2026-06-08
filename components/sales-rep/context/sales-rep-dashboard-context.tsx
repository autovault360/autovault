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
import { fetchSalesRepDashboardMock } from "@/mock-data/sales-rep-dashboard.mock";
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
  const dealJacketRef = useRef<HTMLDivElement | null>(null);

  const loadDashboard = useCallback(async () => {
    const data = await fetchSalesRepDashboardMock(800);
    setDashboardData(data);
    setSelectedVehicle(data.inventory[0] ?? null);
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
      await fetchSalesRepDashboardMock(400);
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
    }),
    [
      dashboardData,
      loading,
      selectedVehicle,
      isDealJacketExpanded,
      refreshSection,
      isInitialLoading,
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
