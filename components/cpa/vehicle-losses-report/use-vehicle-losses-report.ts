"use client";

import { useCallback, useEffect, useState } from "react";
import type { CpaVehicleLossesReportData } from "@/lib/cpa/vehicle-losses-report/types";
import { useCpaPortal } from "../context/cpa-portal-context";

export function useVehicleLossesReport() {
  const { month, year, viewMode } = useCpaPortal();
  const [data, setData] = useState<CpaVehicleLossesReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        month: String(month),
        year: String(year),
        view: viewMode,
      });
      const res = await fetch(`/api/cpa/vehicle-losses?${params}`);
      if (res.ok) {
        setData((await res.json()) as CpaVehicleLossesReportData);
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
