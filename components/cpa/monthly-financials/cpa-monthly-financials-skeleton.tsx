"use client";

import { cn } from "@/lib/utils";

function Block({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-800/80", className)}
    />
  );
}

export default function CpaMonthlyFinancialsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2 border-b border-slate-800 pb-4">
        <Block className="h-8 w-72" />
        <Block className="h-4 w-96" />
        <Block className="h-4 w-40" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-slate-800 bg-[#0e1626] p-3">
            <Block className="mb-2 h-8 w-8 rounded-full" />
            <Block className="mb-1 h-3 w-20" />
            <Block className="mb-1 h-6 w-24" />
            <Block className="h-3 w-28" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-slate-700 bg-[#0e1626] p-4">
            <Block className="mb-3 h-4 w-32" />
            {Array.from({ length: 5 }).map((__, j) => (
              <Block key={j} className="mb-2 h-8 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
