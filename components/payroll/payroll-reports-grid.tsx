"use client";

import {
  BarChart3,
  FileText,
  Handshake,
  Landmark,
  Table2,
  TrendingDown,
  TrendingUp,
  File,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { CardShell } from "@/components/dashboard/card-shell";
import { cn } from "@/lib/utils";
import type { PayrollReport } from "@/lib/payroll/types";

const iconMap: Record<string, LucideIcon> = {
  "file-text": FileText,
  handshake: Handshake,
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  landmark: Landmark,
  "bar-chart-3": BarChart3,
  file: File,
  table: Table2,
};

// Precise color variants extracted directly from image_d0dbc1.png
const colorMap: Record<string, { bg: string; icon: string }> = {
  blue: { bg: "bg-[#0f62fe]", icon: "text-white" },
  green: { bg: "bg-green-500", icon: "text-white" },
  amber: { bg: "bg-[#b76100]", icon: "text-white" },
  purple: { bg: "bg-[#6929c4]", icon: "text-white" },
  red: { bg: "bg-[#da1e28]", icon: "text-white" },
  teal: { bg: "bg-[#007d79]", icon: "text-white" },
};

export default function PayrollReportsGrid({ reports }: { reports: PayrollReport[] }) {
  return (
    <CardShell className="mb-3.5 p-4 backdrop-blur-md select-none">
      <div className="mb-3.5 text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">
        PAYROLL REPORTS
      </div>
      
      {/* 2-row layout grid scaling from mobile sizes upwards */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {reports.map((report) => {
          const Icon = iconMap[report.icon] ?? FileText;
          // Graceful fallback to slate if matching dynamic variant color key isn't provided
          const theme = colorMap[report.color || "blue"] || colorMap.blue;

          return (
            <div
              key={report.id}
              className="flex flex-row items-start gap-3 rounded-lg border border-slate-800/60 bg-[#070c14]/50 p-3 transition-colors duration-150 hover:border-slate-700"
            >
              {/* Solid-fill high-contrast colored icon block */}
              <div className={cn("h-9 w-9 shrink-0 rounded-md flex items-center justify-center shadow-inner", theme.bg)}>
                <Icon className={cn("h-4 w-4 stroke-[2.2]", theme.icon)} />
              </div>

              {/* Text content segment aligned on the right hand side */}
              <div className="flex flex-col justify-between flex-1 min-w-0">
                <div className="text-[13px] font-bold leading-tight text-slate-200 tracking-wide line-clamp-2">
                  {report.title}
                </div>
                <button
                  type="button"
                  className="mt-1.5 text-left text-[10.5px] font-medium text-[#4589ff] hover:text-blue-400 transition-colors cursor-pointer w-fit"
                  onClick={() =>
                    toast.success(`Report queued: ${report.title}`)
                  }
                >
                  {report.actionLabel}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </CardShell>
  );
}