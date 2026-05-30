"use client";

import { formatDisplayDate } from "@/lib/deal-jackets/types";
import type { DealJacketDetail } from "@/lib/deal-jackets/detail-types";
import { DetailTabPanel } from "../detail-primitives";

export default function HistoryTab({ detail }: { detail: DealJacketDetail }) {
  const items = [
    ...detail.activities,
    ...Array.from(
      {
        length: Math.max(
          0,
          detail.tabCounts.history - detail.activities.length,
        ),
      },
      (_, i) => ({
        id: `hist-${i}`,
        label: "Deal jacket updated",
        detail: "Record synchronized",
        occurredAt: detail.sale.dateSold,
        actor: "System",
      }),
    ),
  ];

  return (
    <DetailTabPanel>
      <ul className="relative space-y-0">
        {items.map((item, index) => (
          <li key={item.id} className="relative flex gap-3 pb-6 last:pb-0">
            {index < items.length - 1 && (
              <span
                className="absolute left-[7px] top-4 h-full w-px bg-slate-700"
                aria-hidden
              />
            )}
            <span className="relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-[var(--accent)] bg-[var(--bg-primary)]" />
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-medium text-white">
                {item.label}
              </div>
              <div className="text-[11px] text-slate-400">{item.detail}</div>
              <div className="mt-1 text-[10px] text-[var(--text-muted)]">
                {item.actor} ·{" "}
                {formatDisplayDate(item.occurredAt.split("T")[0])}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </DetailTabPanel>
  );
}
