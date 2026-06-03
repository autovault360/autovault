"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CpaDashboardData, CpaSession, CpaViewMode } from "@/lib/cpa/types";

type CpaPortalContextValue = {
  session: CpaSession | null;
  viewMode: CpaViewMode;
  setViewMode: (mode: CpaViewMode) => void;
  month: number;
  year: number;
  setMonth: (m: number) => void;
  setYear: (y: number) => void;
  dashboard: CpaDashboardData | null;
  loading: boolean;
  refreshDashboard: () => void;
  notesOpen: boolean;
  setNotesOpen: (open: boolean) => void;
  openNotes: () => void;
};

const CpaPortalContext = createContext<CpaPortalContextValue | null>(null);

export function CpaPortalProvider({
  session,
  children,
}: {
  session: CpaSession | null;
  children: ReactNode;
}) {
  const [viewMode, setViewMode] = useState<CpaViewMode>("monthly");
  const [month, setMonth] = useState(5);
  const [year, setYear] = useState(2025);
  const [dashboard, setDashboard] = useState<CpaDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notesOpen, setNotesOpen] = useState(false);

  const refreshDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        view: viewMode,
        month: String(month),
        year: String(year),
      });
      const res = await fetch(`/api/cpa/dashboard?${params}`);
      if (res.ok) {
        const data = (await res.json()) as CpaDashboardData;
        setDashboard(data);
      }
    } finally {
      setLoading(false);
    }
  }, [viewMode, month, year]);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  const value = useMemo(
    () => ({
      session,
      viewMode,
      setViewMode,
      month,
      year,
      setMonth,
      setYear,
      dashboard,
      loading,
      refreshDashboard,
      notesOpen,
      setNotesOpen,
      openNotes: () => setNotesOpen(true),
    }),
    [
      session,
      viewMode,
      month,
      year,
      dashboard,
      loading,
      refreshDashboard,
      notesOpen,
    ],
  );

  return (
    <CpaPortalContext.Provider value={value}>{children}</CpaPortalContext.Provider>
  );
}

export function useCpaPortal() {
  const ctx = useContext(CpaPortalContext);
  if (!ctx) throw new Error("useCpaPortal must be used within CpaPortalProvider");
  return ctx;
}
