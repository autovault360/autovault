"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";
import { CardShell } from "@/components/dashboard/card-shell";
import { cn } from "@/lib/utils";
import { formatPayrollCurrency, type PayrollRun } from "@/lib/payroll/types";

export default function PayrollRunHistory({ runs }: { runs: PayrollRun[] }) {
  return (
    <CardShell className="mb-3.5">
      <div className="mb-3 text-[11px] font-bold tracking-[0.14em] text-slate-500">
        PAYROLL RUN HISTORY
      </div>
      <ul className="space-y-2">
        {runs.map((run) => (
          <li
            key={run.id}
            className="flex items-center gap-2 rounded-md border border-slate-800/60 bg-[#0e1626]/40 px-2.5 py-2"
          >
            <div className="min-w-0 flex-1">
              <div className="text-[10.5px] font-medium text-slate-300">
                {run.period}
              </div>
              <div className="mt-0.5 font-mono text-[11px] tabular-nums text-white">
                {formatPayrollCurrency(run.amount)}
              </div>
            </div>
            <span
              className={cn(
                "shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase border",
                run.status === "paid"
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : "bg-amber-500/15 text-amber-400 border-amber-500/30",
              )}
            >
              {run.status === "paid" ? "Paid" : "Pending"}
            </span>
            <button
              type="button"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-slate-800 text-slate-400 transition hover:border-slate-600 hover:text-white"
              onClick={() => toast.success("Download started")}
              aria-label={`Download payroll run ${run.period}`}
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </CardShell>
  );
}
