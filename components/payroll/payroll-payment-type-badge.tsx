import { cn } from "@/lib/utils";
import { formatPaymentType, type PaymentType } from "@/lib/payroll/types";

const styles: Record<PaymentType, string> = {
  direct_deposit: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  check: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  paper_check: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

export default function PayrollPaymentTypeBadge({ type }: { type: PaymentType }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium whitespace-nowrap",
        styles[type],
      )}
    >
      {formatPaymentType(type)}
    </span>
  );
}
