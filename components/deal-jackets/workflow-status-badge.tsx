"use client";

import type { DealJacketStatus } from "@/lib/deal-jackets/types";
import {
  DEAL_JACKET_STATUS_LABELS,
  getWorkflowStatusStyle,
} from "@/lib/deal-jackets/types";
import { cn } from "@/lib/utils";

type Props = {
  status: DealJacketStatus;
  className?: string;
  size?: "sm" | "md";
};

export default function WorkflowStatusBadge({
  status,
  className,
  size = "md",
}: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-[11px]",
        getWorkflowStatusStyle(status),
        className,
      )}
    >
      {DEAL_JACKET_STATUS_LABELS[status]}
    </span>
  );
}
