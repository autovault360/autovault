"use client";

import { Card } from "@/components/ui/card";
import { formatStorageGb } from "@/lib/files-storage/format-utils";
import type { FilesStorageReport } from "@/lib/files-storage/types";

type Props = {
  report: FilesStorageReport;
};

export default function StorageUsageCard({ report }: Props) {
  return (
    <Card className="mb-3.5 rounded-sm border border-slate-700 bg-transparent p-4 shadow-none">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
          Storage Overview
        </h2>
        <span className="text-[11.5px] text-slate-400">
          {formatStorageGb(report.usedStorageGb)} of{" "}
          {formatStorageGb(report.totalStorageGb)} Used
        </span>
      </div>

      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-800/90">
        {report.breakdown.map((segment) => (
          <div
            key={segment.id}
            className="h-full transition-all first:rounded-l-full last:rounded-r-full"
            style={{
              width: `${segment.percent}%`,
              backgroundColor: segment.color,
            }}
            title={`${segment.label}: ${segment.percent}%`}
          />
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        {report.breakdown.map((segment) => (
          <div
            key={segment.id}
            className="flex items-center gap-2 text-[10.5px]"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-slate-400">{segment.label}</span>
            <span className="font-semibold text-slate-200">
              {formatStorageGb(segment.sizeGb)}
            </span>
            <span className="text-slate-500">{segment.percent}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
