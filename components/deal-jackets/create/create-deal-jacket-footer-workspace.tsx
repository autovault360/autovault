"use client";

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
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/sales-reps/types";
import type { IRecentlyApprovedDeal } from "@/lib/sales-rep/deal-jacket/types";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded bg-slate-800/60", className)}
    />
  );
}

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

type Props = {
  recentlyApproved: IRecentlyApprovedDeal;
  loading?: boolean;
};

export default function CreateDealJacketFooterWorkspace({
  recentlyApproved,
  loading,
}: Props) {
  if (loading) {
    return (
      <div className="mt-4 space-y-3">
        <SkeletonBar className="h-24 w-full" />
        <SkeletonBar className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3 select-none text-[#94a3b8]">
      {/* PIPELINE FLOW */}
      <section className="rounded-lg border border-slate-800/80 bg-card/40 p-4 backdrop-blur-md">
        <div className="mb-3.5 text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">
          Pipeline Flow Architecture
        </div>

        <div className="flex flex-wrap items-center justify-start gap-2">
          {FLOW_STEPS.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded border border-slate-800 bg-card/90 px-3 py-1.5 shadow-sm">
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

      {/* RECENTLY APPROVED */}
      <section className="rounded-lg border border-slate-800/80 bg-card/40 p-3.5 backdrop-blur-md">
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
              {recentlyApproved.id}
            </span>
            <div className="text-[12px] font-bold text-slate-200 mt-0.5 truncate">
              {recentlyApproved.vehicleDesc}
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase block tracking-wide">Customer</span>
            <div className="text-[11px] font-medium text-slate-300 mt-0.5">
              {recentlyApproved.buyerName}
            </div>
          </div>

          <div className="space-y-1.5 border-t border-slate-900/60 pt-2.5 text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-[10px] uppercase">Sale Price</span>
              <span className="font-mono text-slate-300">
                {formatCurrency(recentlyApproved.salePrice)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-[10px] uppercase">Gross Profit</span>
              <span className="font-mono font-semibold text-emerald-400">
                {formatCurrency(recentlyApproved.grossProfit)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-slate-900/60 pt-2.5 text-[10px] text-slate-500 flex justify-between items-center">
          <span>Settled On:</span>
          <span className="text-emerald-400/80 font-mono font-medium">{recentlyApproved.approvedOn}</span>
        </div>
      </section>
    </div>
  );
}