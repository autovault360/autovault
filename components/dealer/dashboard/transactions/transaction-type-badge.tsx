"use client";

import { cn } from "@/lib/utils";
import { TRANSACTION_TYPE_BADGE_CLASS, TRANSACTION_TYPE_LABELS } from "@/lib/dealer/dashboard/transaction-constants";
import type { TransactionType } from "@/lib/dealer/dashboard/types";

export default function TransactionTypeBadge({ type }: { type: TransactionType }) {
  return (
    <span
      className={cn(
        "text-[11px] font-semibold whitespace-nowrap",
        TRANSACTION_TYPE_BADGE_CLASS[type],
      )}
    >
      {TRANSACTION_TYPE_LABELS[type]}
    </span>
  );
}
