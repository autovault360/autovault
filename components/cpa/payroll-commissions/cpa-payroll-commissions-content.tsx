"use client";

import { useCallback, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import CpaHeader from "@/components/cpa/layout/cpa-header";
import type { CpaPayrollCommissionsPageData } from "@/lib/cpa/payroll-commissions/types";
import CpaPayrollCommissionsChartsRow from "./cpa-payroll-commissions-charts-row";
import CpaPayrollCommissionsKpiStrip from "./cpa-payroll-commissions-kpi-strip";
import CpaPayrollCommissionsTableSection from "./cpa-payroll-commissions-table-section";

export default function CpaPayrollCommissionsContent({
  data,
}: {
  data: CpaPayrollCommissionsPageData;
}) {
  const [exportLoading, setExportLoading] = useState<string | null>(null);

  const runExport = useCallback(async (format: "PDF" | "Excel") => {
    setExportLoading(format);
    await new Promise((resolve) => setTimeout(resolve, 700));
    toast.success(`${format} export queued`);
    setExportLoading(null);
  }, []);

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={exportLoading === "PDF"}
        onClick={() => runExport("PDF")}
        className="border-slate-700 bg-[#0b1322] text-[11px] text-slate-300 hover:border-blue-500/50 hover:text-blue-400"
      >
        {exportLoading === "PDF" ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className="mr-1.5 h-3.5 w-3.5" />
        )}
        Export PDF
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={exportLoading === "Excel"}
        onClick={() => runExport("Excel")}
        className="border-slate-700 bg-[#0b1322] text-[11px] text-slate-300 hover:border-emerald-500/50 hover:text-emerald-400"
      >
        {exportLoading === "Excel" ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className="mr-1.5 h-3.5 w-3.5" />
        )}
        Export Excel
      </Button>
    </div>
  );

  return (
    <>
      <CpaHeader
        title="Payroll & Commissions"
        subtitle="Track payroll expenses and sales commissions for your team."
        showViewMode
        showMonthNav
        actions={headerActions}
      />

      <CpaPayrollCommissionsKpiStrip kpis={data.kpis} />

      <CpaPayrollCommissionsChartsRow
        payrollBreakdown={data.payrollBreakdown}
        payrollBreakdownTotal={data.payrollBreakdownTotal}
        trend={data.trend}
        departmentCompensation={data.departmentCompensation}
      />

      <CpaPayrollCommissionsTableSection
        employees={data.employees}
        departmentOptions={data.departmentOptions}
        positionOptions={data.positionOptions}
      />
    </>
  );
}
