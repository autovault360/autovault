"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FinPeriodMode } from "@/components/ui/fin-period-calendar";
import type { VehiclesByLossReportData } from "@/lib/financials/vehicles-report/types";

export function useVehiclesByLossReport(initialData: VehiclesByLossReportData) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [mode, setMode] = useState<FinPeriodMode>("monthly");
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const skipInitialFetch = useRef(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        month: String(month),
        year: String(year),
        view: mode,
      });
      const res = await fetch(`/api/dashboard/financials/vehicle-losses?${params}`);
      if (res.ok) {
        setData((await res.json()) as VehiclesByLossReportData);
      }
    } finally {
      setLoading(false);
    }
  }, [month, year, mode]);

  useEffect(() => {
    if (skipInitialFetch.current) {
      skipInitialFetch.current = false;
      return;
    }
    refresh();
  }, [refresh]);

  return {
    data,
    loading,
    month,
    year,
    mode,
    setMonth,
    setYear,
    setMode,
  };
}
