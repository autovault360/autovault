"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function ProfileSection({
  title,
  description,
  icon,
  children,
  className,
}: Props) {
  return (
    <section
      className={cn(
        "rounded-lg border border-slate-700/80 bg-[#0b1322]/60 p-4 shadow-none",
        className,
      )}
    >
      <div className="mb-4 flex items-start gap-3 border-b border-slate-800/60 pb-3">
        {icon ? (
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-500/15 text-blue-400">
            {icon}
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <h2 className="text-[13px] font-bold tracking-wide text-white">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

type ReadOnlyFieldProps = {
  label: string;
  value: string;
};

export function ProfileReadOnlyField({ label, value }: ReadOnlyFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <span className="rounded-[4px] border border-slate-700/60 bg-slate-900/40 px-3 py-2 text-[13px] text-slate-300">
        {value || "�€”"}
      </span>
    </div>
  );
}
