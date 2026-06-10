"use client";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export function DealStatusFilter({
  current,
  onChange,
}: {
  current?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] text-slate-500">Status:</span>
      <Select value={current ?? "all"} onValueChange={onChange}>
        <SelectTrigger className="h-9 gap-1.5 border-slate-800 bg-slate-800/50 px-3.5 py-2 text-[12.5px] text-slate-300">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="border-slate-800 bg-card text-slate-300">
          <SelectItem value="all">All Deal Jackets</SelectItem>
          <SelectItem value="pending_review">Pending Reviews</SelectItem>
          <SelectItem value="accepted">Accepted</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
