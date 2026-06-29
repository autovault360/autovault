"use client";

import { useCallback, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeaderTitle } from "@/components/layout/page-header-title";
import CpaPayrollCommissionsKpiStrip from "@/components/cpa/payroll-commissions/cpa-payroll-commissions-kpi-strip";
import CpaPayrollCommissionsChartsRow from "@/components/cpa/payroll-commissions/cpa-payroll-commissions-charts-row";
import CpaPayrollCommissionsTableSection from "@/components/cpa/payroll-commissions/cpa-payroll-commissions-table-section";
import CpaPayrollCommissionsSkeleton from "@/components/cpa/payroll-commissions/cpa-payroll-commissions-skeleton";
import type { CpaPayrollCommissionsPageData } from "@/lib/cpa/payroll-commissions/types";

export default function PayrollCommissionsPage({
  data,
}: {
  data: CpaPayrollCommissionsPageData | null;
}) {
  const [exportLoading, setExportLoading] = useState<string | null>(null);

  const runExport = useCallback(async (format: "PDF" | "Excel") => {
    setExportLoading(format);
    await new Promise((resolve) => setTimeout(resolve, 700));
    toast.success(`${format} export queued`);
    setExportLoading(null);
  }, []);

  if (!data) {
    return <CpaPayrollCommissionsSkeleton />;
  }

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
    <div className="space-y-4">
      <section className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-4">
        <PageHeaderTitle
          title="Payroll & Commissions"
          subtitle="Track payroll expenses and sales commissions for your team."
        />
        {headerActions}
      </section>

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
    </div>
  );
}
