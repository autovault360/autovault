"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type CpaPanelShellProps = {
  icon: LucideIcon;
  iconClassName: string;
  iconBgClassName: string;
  title: string;
  subtitle: string;
  viewDetailsHref?: string;
  viewDetailsDisabled?: boolean;
  accentClassName?: string;
  children: React.ReactNode;
  className?: string;
  viewDetailsLinkClass?: string
};

export default function CpaPanelShell({
  icon: Icon,
  iconClassName,
  iconBgClassName,
  viewDetailsLinkClass,
  title,
  subtitle,
  viewDetailsHref = "#",
  viewDetailsDisabled = false,
  accentClassName,
  children,
  className,
}: CpaPanelShellProps) {
  const viewDetailsButton = (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-md border px-3 py-1.5 text-[11px] font-medium transition-colors",
        viewDetailsDisabled
          ? "cursor-not-allowed border-slate-700 text-slate-600"
          : "border-current hover:bg-white/5",
        iconClassName,
        viewDetailsLinkClass
      )}
    >
      View Details
    </span>
  );

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-lg border border-slate-800/60 bg-card p-4",
        accentClassName,
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-full",
              iconBgClassName,
            )}
          >
            <Icon className={cn("h-5 w-5", iconClassName)} strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h3 className="text-[14px] font-bold tracking-wide text-white">
              {title}
            </h3>
            <p className="mt-0.5 text-[11px] text-slate-500">{subtitle}</p>
          </div>
        </div>
        {viewDetailsDisabled ? (
          viewDetailsButton
        ) : (
          <Link className={cn(
            viewDetailsLinkClass
          )} href={viewDetailsHref}>{viewDetailsButton}</Link>
        )}
      </div>

      <div className="flex-1">{children}</div>

      <p className="mt-4 text-[10px] text-slate-600">All amounts are in USD</p>
    </div>
  );
}

type StatCellProps = {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
  className?: string;
};

export function CpaPanelStatCell({
  label,
  value,
  valueClassName,
  className,
}: StatCellProps) {
  return (
    <div className={cn("border-r border-b border-slate-700 p-4 flex text-center flex-col gap-4", className)}>
      <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <span
        className={cn(
          "text-[24px] font-medium tabular-nums leading-tight text-white",
          valueClassName,
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function CpaPanelStatGrid({
  children,
  gridClass,
}: {
  children: React.ReactNode;
  gridClass?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-4 border-t border-l border-slate-700",
        gridClass
      )}
    >
      {children}
    </div>
  );
}