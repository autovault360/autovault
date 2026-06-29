"use client";

import { useCallback, useEffect, useState } from "react";
import type { CpaSalesTaxPageData } from "@/lib/cpa/sales-tax/types";
import { useCpaPortal } from "../context/cpa-portal-context";

export function useSalesTax() {
  const { month, year, viewMode } = useCpaPortal();
  const [data, setData] = useState<CpaSalesTaxPageData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        month: String(month),
        year: String(year),
        view: viewMode,
      });
      const res = await fetch(`/api/cpa/sales-tax?${params}`);
      if (res.ok) {
        setData((await res.json()) as CpaSalesTaxPageData);
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
