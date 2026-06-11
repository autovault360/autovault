import { cn } from "@/lib/utils";
import {
  COMMISSION_STATUS_LABELS,
  getCommissionStatusStyle,
  type SalesRepCommissionStatus,
} from "@/lib/sales-rep/commissions/types";

export default function CommissionStatusBadge({
  status,
}: {
  status: SalesRepCommissionStatus;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold",
        getCommissionStatusStyle(status),
      )}
    >
      {COMMISSION_STATUS_LABELS[status]}
    </span>
  );
}
