"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PAYMENT_STATUS_OPTIONS } from "@/lib/dealer/dashboard/transaction-constants";
import type { TransactionPaymentStatus } from "@/lib/dealer/dashboard/types";

export default function TransactionPaymentBadge({
  status,
}: {
  status: TransactionPaymentStatus;
}) {
  const config = PAYMENT_STATUS_OPTIONS.find((o) => o.value === status);
  return (
    <Badge className={cn("pointer-events-none text-[10px]", config?.className)}>
      {config?.label ?? status}
    </Badge>
  );
}
