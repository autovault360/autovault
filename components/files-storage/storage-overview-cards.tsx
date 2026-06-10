"use client";

import {
  CloudUpload,
  FileText,
  Folder,
  ImageIcon,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  formatFileCount,
  formatStorageGb,
} from "@/lib/files-storage/format-utils";
import type { FilesStorageReport } from "@/lib/files-storage/types";

type Props = {
  report: FilesStorageReport;
};

type KpiCard = {
  id: string;
  label: string;
  value: string;
  subtext: string;
  icon: LucideIcon;
  iconBg: string;
  showProgress?: boolean;
  progressPercent?: number;
};

export default function StorageOverviewCards({ report }: Props) {
  const cards: KpiCard[] = [
    {
      id: "storage-used",
      label: "Total Storage Used",
      value: formatStorageGb(report.usedStorageGb),
      subtext: `of ${formatStorageGb(report.totalStorageGb)}`,
      icon: Folder,
      iconBg: "bg-yellow-500/15 text-yellow-400",
      showProgress: true,
      progressPercent: report.usagePercent,
    },
    {
      id: "total-files",
      label: "Total Files",
      value: formatFileCount(report.totalFiles),
      subtext: "Across all folders",
      icon: FileText,
      iconBg: "bg-purple-500/15 text-purple-400",
    },
    {
      id: "total-images",
      label: "Total Images",
      value: formatFileCount(report.totalImages),
      subtext: "Vehicle & Document Photos",
      icon: ImageIcon,
      iconBg: "bg-emerald-500/15 text-emerald-400",
    },
    {
      id: "last-upload",
      label: "Last Upload",
      value: "Today, 10:24 AM",
      subtext: `By ${report.lastUpload.by}`,
      icon: CloudUpload,
      iconBg: "bg-blue-500/15 text-blue-400",
    },
  ];

  return (
    <section className="mb-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card
            key={kpi.id}
            className="flex h-full flex-col gap-1 rounded-sm border border-slate-700 bg-card p-3 text-slate-200 shadow-none"
          >
            <div className="flex items-start gap-2.5">
              <div
                className={cn(
                  "grid h-10 w-10 shrink-0 place-items-center rounded-full",
                  kpi.iconBg,
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] leading-tight text-slate-500">
                  {kpi.label}
                </div>
                <div className="mt-0.5 text-[18px] font-bold leading-tight text-white">
                  {kpi.value}
                </div>
                {kpi.showProgress && kpi.progressPercent != null && (
                  <div className="mt-1.5">
                    <div className="mb-1 text-[10px] font-medium text-slate-500">
                      {kpi.progressPercent}% Used
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800/90">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all"
                        style={{ width: `${kpi.progressPercent}%` }}
                        role="progressbar"
                        aria-valuenow={kpi.progressPercent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            {!kpi.showProgress && (
              <div className="mt-1 text-[10px] text-slate-500">{kpi.subtext}</div>
            )}
            {kpi.showProgress && (
              <div className="mt-0.5 text-[10px] text-slate-500">{kpi.subtext}</div>
            )}
          </Card>
        );
      })}
    </section>
  );
}
