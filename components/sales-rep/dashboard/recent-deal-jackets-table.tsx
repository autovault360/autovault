"use client";

import { CardShell } from "@/components/dashboard/card-shell";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { IDealJacketLine } from "@/lib/sales-rep/dashboard/types";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-800/80", className)}
    />
  );
}

const statusStyles: Record<IDealJacketLine["status"], string> = {
  Pending: "bg-amber-500/15 text-amber-400 hover:bg-amber-500/15",
  Approved: "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15",
  "Changes Requested":
    "bg-orange-500/15 text-orange-400 hover:bg-orange-500/15",
};

type Props = {
  deals: IDealJacketLine[];
  loading?: boolean;
};

export default function RecentDealJacketsTable({ deals, loading }: Props) {
  return (
    <CardShell className="flex-1 max-h-[300px] xl:max-h-[350px] 2xl:max-h-[400px] overflow-y-auto">
      <div className="mb-2.5 text-[11px] font-bold tracking-[0.14em] text-slate-500">
        RECENT DEAL JACKETS
      </div>
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBar key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[11.5px]">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                <th className="pb-2 pr-2 text-left">ID / Vehicle / Buyer</th>
                <th className="pb-2 pr-2 text-left">Status</th>
                <th className="pb-2 text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((deal) => (
                <tr
                  key={deal.id}
                  className="border-b border-slate-800/50 last:border-0"
                >
                  <td className="py-2.5 pr-2">
                    <div className="font-medium text-slate-200">{deal.id}</div>
                    <div className="text-[13px] text-slate-500">
                      {deal.vehicleDesc} | {deal.buyerName}
                    </div>
                  </td>
                  <td className="py-2.5 pr-2">
                    <Badge
                      className={cn(
                        "border-0 text-[9.5px] font-medium",
                        statusStyles[deal.status],
                      )}
                    >
                      {deal.status}
                    </Badge>
                  </td>
                  <td className="py-2.5 text-right text-slate-400 tabular-nums">
                    {deal.dateString}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </CardShell>
  );
}
