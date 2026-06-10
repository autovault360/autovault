import { cn } from "@/lib/utils";
import type { PayrollPaymentStatus } from "@/lib/sales-rep/payroll-earnings/types";

const STATUS_CONFIG: Record<
  PayrollPaymentStatus,
  { label: string; className: string; title: string }
> = {
  paid: {
    label: "Paid",
    className:
      "rounded-full border-0 bg-emerald-500 px-3 py-0.5 text-[10px] font-semibold text-white",
    title: "Commission has been paid for this vehicle.",
  },
  pending: {
    label: "Pending",
    className:
      "rounded-full border border-amber-500/70 bg-amber-500/10 px-3 py-0.5 text-[10px] font-semibold text-amber-400",
    title: "Awaiting deal approval and funding.",
  },
  processing: {
    label: "Processing",
    className:
      "rounded-full border border-blue-500/40 bg-blue-500/15 px-3 py-0.5 text-[10px] font-semibold text-blue-400",
    title: "Payment is being processed.",
  },
  failed: {
    label: "Failed",
    className:
      "rounded-full border border-red-500/40 bg-red-500/15 px-3 py-0.5 text-[10px] font-semibold text-red-400",
    title: "Payment failed. Contact payroll admin.",
  },
  on_hold: {
    label: "On Hold",
    className:
      "rounded-full border border-slate-500/40 bg-slate-500/15 px-3 py-0.5 text-[10px] font-semibold text-slate-400",
    title: "Payment is on hold pending review.",
  },
};

export default function PayrollPaymentStatusBadge({
  status,
}: {
  status: PayrollPaymentStatus;
}) {
  const config = STATUS_CONFIG[status];
  return (
    <span title={config.title} className={cn("inline-flex items-center", config.className)}>
      {config.label}
    </span>
  );
}
