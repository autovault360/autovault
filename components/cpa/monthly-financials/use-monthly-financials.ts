"use client";

import { useCallback, useEffect, useState } from "react";
import type { CpaMonthlyFinancialsData } from "@/lib/cpa/types";
import { useCpaPortal } from "../context/cpa-portal-context";

export function useMonthlyFinancials() {
  const { month, year, refreshDashboard } = useCpaPortal();
  const [data, setData] = useState<CpaMonthlyFinancialsData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        month: String(month),
        year: String(year),
      });
      const res = await fetch(`/api/cpa/monthly-financials?${params}`);
      if (res.ok) {
        setData((await res.json()) as CpaMonthlyFinancialsData);
      }
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, refresh, month, year, refreshDashboard };
}
