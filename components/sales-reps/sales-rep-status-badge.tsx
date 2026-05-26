import { cn } from "@/lib/utils";
import {
  formatSalesRepStatus,
  getSalesRepStatusStyle,
  type SalesRepPerformanceStatus,
} from "@/lib/sales-reps/types";

export default function SalesRepStatusBadge({
  status,
  className,
}: {
  status: SalesRepPerformanceStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wide",
        getSalesRepStatusStyle(status),
        className,
      )}
    >
      {formatSalesRepStatus(status)}
    </span>
  );
}
