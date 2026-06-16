"use client";

import { useState } from "react";
import { Calendar, Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  formatDateRange,
  type DealerPlPeriod,
  type DealerPlTimeframe,
} from "@/lib/dealer/profit-loss/types";
import { toast } from "sonner";

type ExportFormat = "CSV" | "PDF" | "Excel";

type Props = {
  period: DealerPlPeriod;
  timeframeOptions: { value: DealerPlTimeframe; label: string }[];
  timeframe: DealerPlTimeframe;
  onTimeframeChange: (value: DealerPlTimeframe) => void;
};

const CONTROL_LABEL_CLASS = "text-[10px] font-medium text-slate-500";
const CONTROL_FIELD_CLASS =
  "flex h-9 w-full items-center gap-2 rounded-md border border-slate-800/80 bg-[#0e1626] px-3 text-[11.5px] text-slate-300";

export default function ProfitLossHeaderToolbar({
  period,
  timeframeOptions,
  timeframe,
  onTimeframeChange,
}: Props) {
  const [exportFormat, setExportFormat] = useState<ExportFormat>("CSV");

  const handleExport = (format: ExportFormat = exportFormat) => {
    toast.info(`${format} export will connect to the service layer.`);
  };

  return (
    <div className="flex w-full flex-col gap-2 lg:w-[300px] lg:shrink-0">
      <div className="flex flex-col gap-1">
        <span className={CONTROL_LABEL_CLASS}>Period</span>
        <Select
          value={timeframe}
          onValueChange={(value) => onTimeframeChange(value as DealerPlTimeframe)}
        >
          <SelectTrigger theme="dark" className={cn(CONTROL_FIELD_CLASS, "justify-between")}>
            <span className="flex min-w-0 items-center gap-2">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-500" />
              <SelectValue placeholder="This Month" />
            </span>
          </SelectTrigger>
          <SelectContent theme="dark">
            {timeframeOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-[11.5px]">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <span className={CONTROL_LABEL_CLASS}>Date Range</span>
        <div className={CONTROL_FIELD_CLASS}>
          <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-500" />
          <span className="truncate tabular-nums">
            {formatDateRange(period.start, period.end)}
          </span>
        </div>
      </div>

      <div className="flex h-9 w-full overflow-hidden rounded-md border border-emerald-500/35 bg-[#0e1626]">
        <button
          type="button"
          onClick={() => handleExport(exportFormat)}
          className="flex min-w-0 flex-1 items-center gap-1.5 px-3 text-[11.5px] font-medium text-slate-300 transition-colors hover:bg-slate-800/50"
        >
          <Download className="h-3.5 w-3.5 shrink-0 text-slate-500" />
          <span className="truncate">Export Report</span>
        </button>

        <div className="w-px shrink-0 bg-slate-700/80" aria-hidden />

        <Select
          value={exportFormat}
          onValueChange={(value) => {
            const format = value as ExportFormat;
            setExportFormat(format);
            handleExport(format);
          }}
        >
          <SelectTrigger
            theme="dark"
            className="h-full w-[88px] gap-1 rounded-none border-0 bg-transparent px-2.5 text-[11.5px] font-semibold text-emerald-400 shadow-none hover:bg-slate-800/50 focus:ring-0 [&_svg]:text-emerald-400"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent theme="dark" align="end">
            <SelectItem value="CSV" className="text-[11.5px]">
              CSV
            </SelectItem>
            <SelectItem value="PDF" className="text-[11.5px]">
              PDF
            </SelectItem>
            <SelectItem value="Excel" className="text-[11.5px]">
              Excel
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
