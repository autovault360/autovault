"use client";

import { Calendar, ChevronDown, Download } from "lucide-react";
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

type Props = {
  period: DealerPlPeriod;
  timeframeOptions: { value: DealerPlTimeframe; label: string }[];
  timeframe: DealerPlTimeframe;
  onTimeframeChange: (value: DealerPlTimeframe) => void;
};

export default function ProfitLossHeaderToolbar({
  period,
  timeframeOptions,
  timeframe,
  onTimeframeChange,
}: Props) {
  const handleExport = (format: string) => {
    toast.info(`${format} export will connect to the service layer.`);
  };

  return (
    <section className="mb-3.5 flex flex-wrap items-center justify-between gap-3 px-0.5">
      <h1 className="text-xl font-bold text-white sm:text-2xl">Profit & Loss</h1>

      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
        <Select value={timeframe} onValueChange={(v) => onTimeframeChange(v as DealerPlTimeframe)}>
          <SelectTrigger
            theme="dark"
            className="h-9 min-w-[130px] gap-1.5 border-slate-800 bg-[#0e1626] text-[11.5px] text-slate-300"
          >
            <SelectValue placeholder="This Month" />
          </SelectTrigger>
          <SelectContent theme="dark">
            {timeframeOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-[11.5px]">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div
          className={cn(
            "flex h-9 min-w-0 flex-1 items-center gap-2 rounded-md border border-slate-800 bg-[#0e1626] px-3",
            "text-[11.5px] text-slate-300 sm:min-w-[210px] sm:flex-none",
          )}
        >
          <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-500" />
          <span className="truncate tabular-nums">
            {formatDateRange(period.start, period.end)}
          </span>
        </div>

        <Select onValueChange={handleExport}>
          <SelectTrigger
            theme="dark"
            className="h-9 min-w-[110px] gap-1.5 border-slate-800 bg-[#0e1626] text-[11.5px] text-slate-300"
          >
            <Download className="h-3.5 w-3.5 shrink-0 text-slate-500" />
            <span>Export</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-500" />
          </SelectTrigger>
          <SelectContent theme="dark">
            <SelectItem value="PDF" className="text-[11.5px]">
              Export PDF
            </SelectItem>
            <SelectItem value="Excel" className="text-[11.5px]">
              Export Excel
            </SelectItem>
            <SelectItem value="CSV" className="text-[11.5px]">
              Export CSV
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </section>
  );
}
