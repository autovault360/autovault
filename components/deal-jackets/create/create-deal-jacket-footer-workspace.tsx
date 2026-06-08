"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Database,
  FileCheck,
  Send,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/sales-reps/types";
import type {
  CreateDealJacketPageData,
  DealJacketLedgerStatus,
} from "@/lib/sales-rep/deal-jacket/types";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded bg-slate-800/60", className)}
    />
  );
}

const statusStyles: Record<DealJacketLedgerStatus, string> = {
  Pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/15",
  Approved: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/15",
  Rejected: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/15",
};

const FLOW_STEPS = [
  { label: "Sales Rep Creates Deal Jacket", icon: Send },
  { label: "Deal Saved", icon: Database },
  { label: "Admin Review", icon: ClipboardCheck },
  { label: "Deal Approved", icon: CheckCircle2 },
  { label: "Data Distributed", icon: FileCheck },
] as const;

const PIPELINE_MODULES = [
  "Sales Rep Profile",
  "Deal Jackets",
  "Customer Profile",
  "Vehicle Inventory",
  "Profit and Loss",
  "Sales Tax Center",
  "CPA Dashboard",
] as const;

type FilterKey = "all" | "pending" | "approved" | "rejected";

type Props = {
  data: CreateDealJacketPageData | null;
  loading?: boolean;
};

export default function CreateDealJacketFooterWorkspace({
  data,
  loading,
}: Props) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const filteredLedger = useMemo(() => {
    if (!data) return [];
    const items = data.ledgerItems.slice(0, 5);
    if (filter === "all") return items;
    const statusMap: Record<FilterKey, DealJacketLedgerStatus | null> = {
      all: null,
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
    };
    const target = statusMap[filter];
    return items.filter((item) => item.status === target);
  }, [data, filter]);

  if (loading || !data) {
    return (
      <div className="mt-4 space-y-3">
        <SkeletonBar className="h-24 w-full" />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          <SkeletonBar className="h-64 lg:col-span-5 w-full" />
          <SkeletonBar className="h-64 lg:col-span-4 w-full" />
          <SkeletonBar className="h-64 lg:col-span-3 w-full" />
        </div>
      </div>
    );
  }

  const tabs: { key: FilterKey; label: string; count: number }[] = [
    { key: "all", label: "All", count: data.ledgerCounts.all },
    { key: "pending", label: "Pending", count: data.ledgerCounts.pending },
    { key: "approved", label: "Approved", count: data.ledgerCounts.approved },
    { key: "rejected", label: "Rejected", count: data.ledgerCounts.rejected },
  ];

  return (
    <div className="mt-4 space-y-3 select-none text-[#94a3b8]">
      {/* HOW IT WORKS PIPELINE */}
      <section className="rounded-lg border border-slate-800/80 bg-[#050708]/40 p-4 backdrop-blur-md">
        <div className="mb-3.5 text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">
          Pipeline Flow Architecture
        </div>
        
        <div className="flex flex-wrap items-center justify-start gap-2">
          {FLOW_STEPS.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded border border-slate-800 bg-[#0c1017]/90 px-3 py-1.5 shadow-sm">
                <step.icon className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-[11px] font-medium text-slate-300">{step.label}</span>
              </div>
              {i < FLOW_STEPS.length - 1 && (
                <ArrowRight className="h-3 w-3 text-slate-600" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-start gap-1.5 border-t border-slate-800/60 pt-3.5">
          <span className="text-[9px] font-bold tracking-wider text-slate-500 uppercase mr-1">Sync Nodes:</span>
          {PIPELINE_MODULES.map((mod, i) => (
            <div key={mod} className="flex items-center gap-1.5">
              <span className="rounded bg-slate-900/80 border border-slate-800/80 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                {mod}
              </span>
              {i < PIPELINE_MODULES.length - 1 && (
                <span className="text-[10px] text-slate-700 font-bold">·</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* DASHBOARD SECTIONS GRID */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        
        {/* MY DEAL JACKETS */}
        <section className="rounded-lg border border-slate-800/80 bg-[#050708]/40 p-3.5 backdrop-blur-md lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">
                My Deal Jackets
              </span>
              <a
                href="/dashboard/deal-jackets"
                className="text-[11px] font-medium text-blue-500 hover:text-blue-400 transition-colors"
              >
                View Ledger
              </a>
            </div>

            <div className="mb-3 flex flex-wrap gap-1 border-b border-slate-800/40 pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilter(tab.key)}
                  className={cn(
                    "rounded px-2.5 py-0.5 text-[10px] font-medium transition-all duration-150",
                    filter === tab.key
                      ? "bg-blue-500/10 border border-blue-500/30 text-blue-400"
                      : "border border-transparent text-slate-400 hover:text-slate-200"
                  )}
                >
                  {tab.label} <span className="opacity-60 text-[9px] ml-0.5">({tab.count})</span>
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-semibold text-slate-500 tracking-wide">
                    <th className="pb-2 text-left font-medium">Vehicle / Customer</th>
                    <th className="pb-2 text-left font-medium px-2">Sale Date</th>
                    <th className="pb-2 text-right font-medium pr-3">Gross Profit</th>
                    <th className="pb-2 text-left font-medium w-[70px]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/50">
                  {filteredLedger.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-900/20 transition-colors group"
                    >
                      <td className="py-2.5 pr-2">
                        <div className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                          {item.vehicleDesc}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {item.buyerName}
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-slate-400 font-mono">
                        {item.saleDate}
                      </td>
                      <td className="py-2.5 text-right font-mono font-semibold text-emerald-400 pr-3">
                        {formatCurrency(item.grossProfit)}
                      </td>
                      <td className="py-2.5">
                        <Badge
                          className={cn(
                            "shadow-none px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider",
                            statusStyles[item.status]
                          )}
                        >
                          {item.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {filteredLedger.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-500 italic">
                        No matches found for this status.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ADMIN REVIEW QUEUE */}
        <section className="rounded-lg border border-slate-800/80 bg-[#050708]/40 p-3.5 backdrop-blur-md lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">
                Admin Review Queue
              </span>
              <Badge className="shadow-none border border-amber-500/20 bg-amber-500/10 text-[9px] font-medium text-amber-400 uppercase tracking-wider rounded">
                Pending Review
              </Badge>
            </div>

            <div className="space-y-3 rounded-lg border border-slate-800/60 bg-[#070c14]/40 p-3.5">
              <div>
                <div className="text-[11px] font-mono text-slate-500 uppercase font-semibold tracking-wider">
                  {data.adminReviewDeal.id}
                </div>
                <div className="text-[13px] font-bold text-white mt-0.5 leading-snug">
                  {data.adminReviewDeal.vehicleDesc}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Buyer: <span className="font-medium text-slate-300">{data.adminReviewDeal.buyerName}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-b border-slate-900/60 py-2.5 text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-medium tracking-wide">Sale Price</span>
                  <div className="font-mono font-semibold text-slate-200 mt-0.5">
                    {formatCurrency(data.adminReviewDeal.salePrice)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-medium tracking-wide">Gross Profit</span>
                  <div className="font-mono font-semibold text-emerald-400 mt-0.5">
                    {formatCurrency(data.adminReviewDeal.grossProfit)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-medium tracking-wide">Commission</span>
                  <div className="font-mono font-semibold text-blue-400 mt-0.5">
                    {formatCurrency(data.adminReviewDeal.commissionEarned)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-medium tracking-wide">Submitted By</span>
                  <div className="text-slate-300 font-medium truncate mt-0.5">
                    {data.adminReviewDeal.submittedBy}
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 flex items-center justify-between">
                <span>Timestamp:</span>
                <span className="text-slate-400 font-mono">
                  {data.adminReviewDeal.submittedOn}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <Button
              type="button"
              size="sm"
              className="h-8 flex-1 bg-emerald-600 text-[11px] font-medium hover:bg-emerald-500 transition-colors shadow-none text-white rounded"
            >
              Approve
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8 flex-1 bg-slate-800 text-[11px] font-medium hover:bg-slate-700 text-slate-200 border border-slate-700/50 transition-colors shadow-none rounded"
            >
              Changes
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8 flex-1 bg-red-950/40 hover:bg-red-900/30 border border-red-900/30 text-red-400 text-[11px] font-medium transition-colors shadow-none rounded"
            >
              Reject
            </Button>
          </div>
        </section>

        {/* RECENTLY APPROVED */}
        <section className="rounded-lg border border-slate-800/80 bg-[#050708]/40 p-3.5 backdrop-blur-md lg:col-span-3 flex flex-col justify-between">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">
                Recently Approved
              </span>
              <Badge className="shadow-none border border-emerald-500/20 bg-emerald-500/10 text-[9px] font-medium text-emerald-400 uppercase tracking-wider rounded">
                <UserCheck className="mr-1 h-2.5 w-2.5 stroke-[2.5]" />
                Cleared
              </Badge>
            </div>

            <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/[0.02] p-3.5 space-y-3">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                  {data.recentlyApproved.id}
                </span>
                <div className="text-[12px] font-bold text-slate-200 mt-0.5 truncate">
                  {data.recentlyApproved.vehicleDesc}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase block tracking-wide">Customer</span>
                <div className="text-[11px] font-medium text-slate-300 mt-0.5">
                  {data.recentlyApproved.buyerName}
                </div>
              </div>

              <div className="space-y-1.5 border-t border-slate-900/60 pt-2.5 text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-[10px] uppercase">Sale Price</span>
                  <span className="font-mono text-slate-300">
                    {formatCurrency(data.recentlyApproved.salePrice)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-[10px] uppercase">Gross Profit</span>
                  <span className="font-mono font-semibold text-emerald-400">
                    {formatCurrency(data.recentlyApproved.grossProfit)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-slate-900/60 pt-2.5 text-[10px] text-slate-500 flex justify-between items-center">
            <span>Settled On:</span>
            <span className="text-emerald-400/80 font-mono font-medium">{data.recentlyApproved.approvedOn}</span>
          </div>
        </section>
      </div>
    </div>
  );
}