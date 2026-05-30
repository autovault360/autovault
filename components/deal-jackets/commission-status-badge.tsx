import { cn } from "@/lib/utils";
import {
  formatCommissionStatus,
  getCommissionStatusStyle,
  type CommissionStatus,
} from "@/lib/deal-jackets/types";

export default function CommissionStatusBadge({
  status,
  className,
}: {
  status: CommissionStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold",
        getCommissionStatusStyle(status),
        className,
      )}
    >
      {formatCommissionStatus(status)}
    </span>
  );
}
