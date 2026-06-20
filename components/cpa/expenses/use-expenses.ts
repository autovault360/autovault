"use client";

import { useCallback, useEffect, useState } from "react";
import type { CpaExpensesPageData } from "@/lib/cpa/expenses/types";
import { useCpaPortal } from "../context/cpa-portal-context";

export function useExpenses() {
  const { month, year, viewMode } = useCpaPortal();
  const [data, setData] = useState<CpaExpensesPageData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        month: String(month),
        year: String(year),
        view: viewMode,
      });
      const res = await fetch(`/api/cpa/expenses?${params}`);
      if (res.ok) {
        setData((await res.json()) as CpaExpensesPageData);
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
