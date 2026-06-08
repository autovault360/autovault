import { cn } from "@/lib/utils";
import type { PayrollStatus } from "@/lib/payroll/types";

const styles: Record<PayrollStatus, string> = {
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  paid: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  overdue: "bg-red-500/15 text-red-400 border-red-500/30",
};

const labels: Record<PayrollStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  overdue: "Overdue",
};

export default function PayrollStatusBadge({ status }: { status: PayrollStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide border",
        styles[status],
      )}
    >
      {labels[status]}
    </span>
  );
}
