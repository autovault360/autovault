import { Info } from "lucide-react";
import { DetailCard, DetailCardHead } from "@/components/vehicles/detail/detail-card";
import { formatPayrollCurrency, type PaymentSummary } from "@/lib/payroll/types";
import PayrollPaymentTypeBadge from "../payroll-payment-type-badge";
import PayrollStatusBadge from "../payroll-status-badge";

export default function EmployeePaymentSummaryCard({
  payment,
}: {
  payment: PaymentSummary;
}) {
  return (
    <DetailCard className="mb-2 border-slate-800/80 h-auto">
      <DetailCardHead title="PAYMENT SUMMARY" action={<PayrollStatusBadge status={payment.status} />} />
      <div className="space-y-1.5 text-[13px]">
        <div className="flex justify-between">
          <span className="text-slate-500">Payment Type</span>
          <PayrollPaymentTypeBadge type={payment.paymentType} />
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Bank</span>
          <span className="text-slate-300">{payment.bank}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Account</span>
          <span className="font-mono tabular-nums tracking-wide text-slate-300">{payment.accountMasked}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Estimated Deposit</span>
          <span className="font-mono tabular-nums text-slate-300">{payment.estimatedDeposit}</span>
        </div>
      </div>
      <div className="my-1.5 flex justify-between items-center">
        <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">Net Pay</div>
        <div className="font-mono text-2xl font-bold tabular-nums tracking-wide text-emerald-400">
          {formatPayrollCurrency(payment.netPay)}
        </div>
      </div>
      <div className="flex gap-2 rounded-md border border-blue-500/30 bg-blue-500/10 p-2">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-400" />
        <p className="text-[13px] leading-relaxed text-blue-300">{payment.infoNote}</p>
      </div>
    </DetailCard>
  );
}
