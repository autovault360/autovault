"use client";

import { Calendar, DollarSign } from "lucide-react";
import { CardShell } from "@/components/dashboard/card-shell";
import { cn } from "@/lib/utils";
import { formatPayrollCurrency, type UpcomingPayment } from "@/lib/payroll/types";

export default function PayrollUpcomingPayments({
  payments,
}: {
  payments: UpcomingPayment[];
}) {
  const total = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <CardShell className="mb-3.5">
      <div className="mb-3 text-[11px] font-bold tracking-[0.14em] text-slate-500">
        UPCOMING PAYROLL &amp; PAYMENTS
      </div>
      <ul className="space-y-2.5">
        {payments.map((payment) => (
          <li
            key={payment.id}
            className="flex items-start gap-2.5 border-b border-slate-800/50 pb-2.5 last:border-0 last:pb-0"
          >
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-800/80">
              <DollarSign className={cn("h-3.5 w-3.5", payment.iconColor)} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold text-slate-200">
                {payment.label}
              </div>
              <div className="mt-0.5 flex items-center gap-1 text-[9.5px] text-slate-500">
                <Calendar className="h-3 w-3" />
                Due {payment.dueDate}
              </div>
            </div>
            <span className="shrink-0 font-mono text-[11px] tabular-nums text-white">
              {formatPayrollCurrency(payment.amount)}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-3">
        <span className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">
          Total Upcoming
        </span>
        <span className="font-mono text-[13px] font-bold tabular-nums text-emerald-400">
          {formatPayrollCurrency(total)}
        </span>
      </div>
    </CardShell>
  );
}
