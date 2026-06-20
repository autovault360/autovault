"use client";

import { useCallback, useEffect, useState } from "react";
import type { CpaProfitVehiclesReportData } from "@/lib/cpa/profit-vehicles-report/types";
import { useCpaPortal } from "../context/cpa-portal-context";

export function useProfitVehiclesReport() {
  const { month, year, viewMode } = useCpaPortal();
  const [data, setData] = useState<CpaProfitVehiclesReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        month: String(month),
        year: String(year),
        view: viewMode,
      });
      const res = await fetch(`/api/cpa/profit-vehicles?${params}`);
      if (res.ok) {
        setData((await res.json()) as CpaProfitVehiclesReportData);
      } else {
        setData(null);
      }
    } finally {
      setLoading(false);
    }
  }, [month, year, viewMode]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, refresh, month, year, viewMode };
}
