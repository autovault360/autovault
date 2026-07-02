"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FinPeriodMode } from "@/components/ui/fin-period-calendar";
import type { ProfitLossReport } from "@/lib/profit-loss/types";
import { fetchProfitLossReportForPeriod } from "@/lib/profit-loss/server/actions";

type Props = {
  initialReport: ProfitLossReport;
};

export function useProfitLossReport({ initialReport }: Props) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [mode, setMode] = useState<FinPeriodMode>("monthly");
  const [report, setReport] = useState<ProfitLossReport>(initialReport);
  const [loading, setLoading] = useState(false);
  const skipInitial = useRef(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProfitLossReportForPeriod(month, year, mode);
      setReport(data);
    } finally {
      setLoading(false);
    }
  }, [month, year, mode]);

  useEffect(() => {
    if (skipInitial.current) {
      skipInitial.current = false;
      return;
    }
    refresh();
  }, [refresh]);

  return {
    report,
    loading,
    month,
    year,
    mode,
    setMonth,
    setYear,
    setMode,
  };
}
