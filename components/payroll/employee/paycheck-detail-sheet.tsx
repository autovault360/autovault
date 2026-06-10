"use client";

import { Download, Send } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { formatPayrollCurrency, type PaycheckDetail } from "@/lib/payroll/types";
import { logPayrollAudit } from "@/lib/payroll/audit";
import PayrollPaymentTypeBadge from "../payroll-payment-type-badge";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paycheck: PaycheckDetail | null;
  employeeId: string;
  selectedDate: string;
};

export default function PaycheckDetailSheet({
  open,
  onOpenChange,
  paycheck,
  employeeId,
  selectedDate,
}: Props) {
  if (!paycheck) return null;

  const statusStyles = {
    verified: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    review: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto border-slate-800 bg-card sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-white">Paycheck Details</SheetTitle>
          <p className="font-mono text-[11px] tabular-nums text-slate-400">{selectedDate}</p>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wide text-slate-500">Verification</span>
            <span className={cn("rounded border px-2 py-0.5 text-[9px] font-semibold uppercase", statusStyles[paycheck.verificationStatus])}>
              {paycheck.verificationStatus}
            </span>
          </div>

          <div className="rounded-md border border-slate-800 bg-card/60 p-3 text-[11px]">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">Pay Period</div>
            <p className="text-slate-300">{paycheck.period}</p>
            <p className="mt-1 font-mono tabular-nums text-slate-400">Pay Date: {paycheck.payDate}</p>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between"><span className="text-slate-500">Base Pay</span><span className="font-mono tabular-nums">{formatPayrollCurrency(paycheck.basePay)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Commission</span><span className="font-mono tabular-nums text-emerald-400">{formatPayrollCurrency(paycheck.commission)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Bonus</span><span className="font-mono tabular-nums text-purple-400">{formatPayrollCurrency(paycheck.bonus)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Deductions</span><span className="font-mono tabular-nums text-red-400">-{formatPayrollCurrency(paycheck.deductions)}</span></div>
            <div className="flex justify-between border-t border-slate-800 pt-2">
              <span className="font-bold text-slate-400">Net Pay</span>
              <span className="font-mono text-lg font-bold tabular-nums text-emerald-400">{formatPayrollCurrency(paycheck.netPay)}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-500">Payment Type</span>
              <PayrollPaymentTypeBadge type={paycheck.paymentType} />
            </div>
          </div>

          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">Admin Note</div>
            <p className="rounded-md border border-slate-800 bg-card p-2.5 text-[13px] text-slate-300">{paycheck.adminNote}</p>
          </div>

          {paycheck.documents.length > 0 && (
            <div>
              <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">Attached Documents</div>
              <ul className="space-y-1.5">
                {paycheck.documents.map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between rounded border border-slate-800 px-2 py-1.5 text-[13px]">
                    <span className="text-slate-300">{doc.name}</span>
                    <button type="button" onClick={() => toast.success("Download started")} className="text-slate-400 hover:text-white">
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-500"
            onClick={() => {
              logPayrollAudit({ entity: "employee_payroll", employeeId, action: "sync_cpa", timestamp: new Date().toISOString(), metadata: { payDate: selectedDate } });
              toast.success("Payroll data queued for CPA Dashboard sync");
            }}
          >
            <Send className="mr-2 h-4 w-4" />
            Sync to CPA Dashboard
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
