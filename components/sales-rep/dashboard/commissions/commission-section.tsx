"use client";

import { useState } from "react";
import { ChevronUp, Download } from "lucide-react";
import { CardShell } from "@/components/dashboard/card-shell";
import { Button } from "@/components/ui/button";
import CommissionKpiStrip from "./commission-kpi-strip";
import CommissionDealsTable from "./commission-deals-table";
import type { ISalesRepCommissionsData } from "@/lib/sales-rep/commissions/types";

type Props = {
  data: ISalesRepCommissionsData;
  loading?: boolean;
};

export default function CommissionSection({ data, loading }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <CardShell className="border-slate-700/80 bg-card backdrop-blur-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-bold tracking-[0.14em] text-white">
          MY COMMISSIONS
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="flex items-center gap-1 text-[11px] text-slate-400 transition hover:text-white"
          >
            {collapsed ? "Expand" : "Collapse"}
            <ChevronUp
              className={`h-3.5 w-3.5 transition-transform ${collapsed ? "rotate-180" : ""}`}
            />
          </button>
          <Button
            type="button"
            className="h-8 gap-1.5 bg-blue-600 px-3 text-[11px] font-medium text-white hover:bg-blue-500"
          >
            <Download className="h-3.5 w-3.5" />
            Export Report
          </Button>
        </div>
      </div>

      {!collapsed && (
        <>
          <div className="mb-2.5">
            <span className="text-[11px] font-bold tracking-[0.14em] text-slate-500">
              OVERVIEW
            </span>
          </div>

          <div className="mb-3.5">
            <CommissionKpiStrip summary={data.summary} loading={loading} />
          </div>

          <CommissionDealsTable
            entries={data.entries}
            periodLabel={data.summary.periodLabel}
            totalCommission={data.summary.totalCommission}
            loading={loading}
          />
        </>
      )}
    </CardShell>
  );
}
