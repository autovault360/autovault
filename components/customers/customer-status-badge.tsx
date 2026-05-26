import { cn } from "@/lib/utils";
import {
  formatCustomerStatus,
  getCustomerStatusStyle,
  type CustomerStatus,
} from "@/lib/customers/types";

export default function CustomerStatusBadge({
  status,
  className,
}: {
  status: CustomerStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10.5px] font-medium",
        getCustomerStatusStyle(status),
        className,
      )}
    >
      {formatCustomerStatus(status)}
    </span>
  );
}
