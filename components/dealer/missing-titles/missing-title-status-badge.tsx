"use client";

import { cn } from "@/lib/utils";
import type { MissingTitleStatus } from "@/lib/dealer/missing-titles/types";
import { formatMissingTitleStatus } from "@/lib/dealer/missing-titles/types";

const STYLES: Record<MissingTitleStatus, { badge: string; dot: string }> = {
  in_progress: {
    badge: "border-orange-500/35 bg-orange-500/15 text-orange-400",
    dot: "bg-orange-400",
  },
  pending: {
    badge: "border-amber-500/35 bg-amber-500/15 text-amber-400",
    dot: "bg-amber-400",
  },
  overdue: {
    badge: "border-red-500/35 bg-red-500/15 text-red-400",
    dot: "bg-red-400",
  },
  resolved: {
    badge: "border-emerald-500/35 bg-emerald-500/15 text-emerald-400",
    dot: "bg-emerald-400",
  },
};

export default function MissingTitleStatusBadge({
  status,
  className,
}: {
  status: MissingTitleStatus;
  className?: string;
}) {
  const styles = STYLES[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap",
        styles.badge,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", styles.dot)} />
      {formatMissingTitleStatus(status)}
    </span>
  );
}
