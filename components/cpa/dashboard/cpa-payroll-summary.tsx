"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CpaPayrollSummary } from "@/lib/cpa/types";

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function CpaPayrollSummary({ data, bare }: { data: CpaPayrollSummary; bare?: boolean }) {
  const rows = [
    { label: "Total Payroll", value: formatMoney(data.totalPayroll) },
    { label: "Employees Paid", value: String(data.employeesPaid) },
    { label: "Commissions Paid", value: formatMoney(data.commissionsPaid) },
    { label: "Bonuses Paid", value: formatMoney(data.bonusesPaid) },
    { label: "Payroll Taxes", value: formatMoney(data.payrollTaxes) },
    { label: "Next Payroll Date", value: data.nextPayrollDate },
  ];

  const content = (
    <>
      <ul className="mb-3 space-y-2 text-[11.5px]">
        {rows.map((row) => (
          <li key={row.label} className="flex justify-between">
            <span className="text-slate-500">{row.label}</span>
            <span className="text-white">{row.value}</span>
          </li>
        ))}
      </ul>
      <Button
        className="w-full bg-emerald-600 hover:bg-emerald-500"
        onClick={() => toast.success("Payroll export queued")}
      >
        <Download className="mr-2 h-4 w-4" />
        Export Payroll
      </Button>
    </>
  );

  if (bare) return content;

  return (
    <Card className="rounded-sm border border-slate-700 bg-transparent p-3.5 shadow-none">
      <h3 className="mb-3 text-[11px] font-bold tracking-[0.14em] text-slate-500">PAYROLL SUMMARY</h3>
      {content}
    </Card>
  );
}
