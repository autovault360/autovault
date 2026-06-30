import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FileText, ShoppingCart, UserRound } from "lucide-react";
import { KPI_CARD_SHELL_CLASS } from "@/lib/ui/kpi-grid";

const SHELL_CLASS = cn(
  "flex min-h-[128px] min-w-0 max-w-full flex-col rounded-lg border border-slate-700/70 bg-[#0a101c] p-3 text-slate-200 shadow-none",
  KPI_CARD_SHELL_CLASS,
);

function KpiHeader({
  icon,
  iconWrapClassName,
  title,
}: {
  icon: ReactNode;
  iconWrapClassName: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center rounded-full shadow-[0_0_18px_-4px] ring-1 ring-inset ring-white/5",
          iconWrapClassName,
        )}
      >
        {icon}
      </div>
      <span className="text-[13px] font-semibold leading-snug text-slate-200">
        {title}
      </span>
    </div>
  );
}

function MetricBlock({
  label,
  value,
  labelClassName,
  valueClassName,
}: {
  label: string;
  value: string;
  labelClassName?: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <span
        className={cn(
          "text-[11px] font-medium leading-none text-slate-400",
          labelClassName,
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "mt-1 text-[15px] font-bold leading-none tabular-nums tracking-tight",
          valueClassName,
        )}
      >
        {value}
      </span>
    </div>
  );
}

/** Commission Overview ? centered stacked metrics */
export function CommissionOverviewKpiCard({
  avgRate,
  totalCommissions,
  className,
}: {
  avgRate: number;
  totalCommissions: string;
  className?: string;
}) {
  return (
    <Card className={cn(SHELL_CLASS, className)}>
      <KpiHeader
        title="Commission Overview"
        iconWrapClassName="bg-violet-500/15 text-violet-300 shadow-violet-500/30"
        icon={<UserRound className="h-5 w-5" strokeWidth={2} />}
      />
      <div className="mt-2 flex flex-1 flex-col justify-center gap-2">
        <MetricBlock
          label="Avg. Commission Rate"
          value={`${avgRate.toFixed(1)}%`}
          valueClassName="text-white"
        />
        <MetricBlock
          label="Total Commissions"
          value={totalCommissions}
          valueClassName="text-red-400"
        />
      </div>
    </Card>
  );
}

/** Titles ? two-column split with divider */
export function TitlesKpiCard({
  missing,
  titlesIn,
  className,
}: {
  missing: number;
  titlesIn: number;
  className?: string;
}) {
  return (
    <Card className={cn(SHELL_CLASS, className)}>
      <KpiHeader
        title="Titles"
        iconWrapClassName="bg-emerald-500/15 text-emerald-400 shadow-emerald-500/30"
        icon={<FileText className="h-5 w-5" strokeWidth={2} />}
      />
      <div className="relative mt-2 grid grid-cols-2 border-t border-slate-800/70 pt-2.5">
        <div className="absolute inset-y-2 left-1/2 w-px -translate-x-1/2 bg-slate-800/80" />
        <MetricBlock
          label="Missing"
          value={String(missing)}
          labelClassName="text-red-400/90"
          valueClassName="text-red-400"
        />
        <MetricBlock
          label="Titles In"
          value={String(titlesIn)}
          valueClassName="text-emerald-400"
        />
      </div>
    </Card>
  );
}

/** Vehicles Sold This Month ? three-column split */
export function SoldThisMonthKpiCard({
  soldCount,
  profit,
  roi,
  className,
}: {
  soldCount: number;
  profit: string;
  roi: string;
  className?: string;
}) {
  return (
    <Card className={cn(SHELL_CLASS, className)}>
      <KpiHeader
        title="Vehicles Sold This Month"
        iconWrapClassName="bg-blue-500/15 text-blue-400 shadow-blue-500/30"
        icon={<ShoppingCart className="h-5 w-5" strokeWidth={2} />}
      />
      <div className="relative mt-2 grid grid-cols-3 border-t border-slate-800/70 pt-2.5">
        <div className="absolute inset-y-2 left-1/3 w-px bg-slate-800/80" />
        <div className="absolute inset-y-2 left-2/3 w-px bg-slate-800/80" />
        <MetricBlock
          label="Sold"
          value={String(soldCount)}
          valueClassName="text-white"
        />
        <MetricBlock
          label="Gross"
          value={profit}
          valueClassName="text-amber-400"
        />
        <MetricBlock
          label="ROI"
          value={roi}
          valueClassName="text-amber-400"
        />
      </div>
    </Card>
  );
}
