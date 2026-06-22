"use client";

import { FileText } from "lucide-react";
import { CardShell } from "@/components/dashboard/card-shell";
import { cn } from "@/lib/utils";
import type { IDealJacketLine } from "@/lib/sales-rep/dashboard/types";

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex-1 space-y-2">
        <div className="h-3 w-2/5 animate-pulse rounded bg-slate-800/80" />
        <div className="h-2.5 w-3/4 animate-pulse rounded bg-slate-800/60" />
      </div>
      <div className="h-5 w-20 animate-pulse rounded-full bg-slate-800/80" />
      <div className="h-3 w-14 animate-pulse rounded bg-slate-800/60" />
    </div>
  );
}

const statusStyles: Record<IDealJacketLine["status"], string> = {
  Pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Changes Requested": "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

type Props = {
  deals: IDealJacketLine[];
  loading?: boolean;
};

export default function RecentDealJacketsTable({ deals, loading }: Props) {
  return (
    <CardShell className="flex max-h-[300px] flex-col border border-slate-700/60 p-0 xl:max-h-[350px] 2xl:max-h-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/50 px-4 py-3">
        <span className="text-[11px] font-bold tracking-[0.18em] text-slate-500">
          RECENT DEAL JACKETS
        </span>
        <FileText className="h-3.5 w-3.5 text-slate-600" />
      </div>

      {/* Deal List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
        {loading ? (
          <div className="divide-y divide-slate-800/30">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : deals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="mb-2 h-8 w-8 text-slate-700" />
            <p className="text-sm text-slate-500">No deal jackets</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/30">
            {deals.map((deal) => (
              <div
                key={deal.id}
                className="flex items-center gap-3 px-4 py-3 transition hover:bg-slate-800/20"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-[12px] font-medium text-slate-200">
                    {deal.id}
                  </span>
                  <span className="truncate text-[11px] text-slate-500">
                    {deal.vehicleDesc} &middot; {deal.buyerName}
                  </span>
                </div>
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider",
                    statusStyles[deal.status],
                  )}
                >
                  {deal.status === "Approved" && (
                    <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  )}
                  {deal.status === "Pending" && (
                    <span className="mr-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
                  )}
                  {deal.status}
                </span>
                <span className="shrink-0 text-[11px] tabular-nums text-slate-500">
                  {deal.dateString}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </CardShell>
  );
}
