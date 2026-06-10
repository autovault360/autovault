import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info } from "lucide-react";

export function CardShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "flex min-w-0 max-w-full flex-col rounded-sm border border-slate-700 bg-card p-3.5 text-slate-200 shadow-none",
        className,
      )}
    >
      {children}
    </Card>
  );
}

export function CardHead({
  title,
  pill,
  info,
}: {
  title: string;
  pill?: string;
  info?: boolean;
}) {
  return (
    <div className="mb-2.5 flex items-center justify-between">
      <div className="flex items-center gap-1 text-[11px] font-bold tracking-[0.14em] text-slate-500">
        {title}
        {info && <Info className="h-3 w-3" />}
      </div>
      {pill && (
        <Select defaultValue={pill}>
          <SelectTrigger className="max-w-32 h-7 border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] text-slate-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-slate-800 bg-card text-slate-300 text-[11px]">
            <SelectItem value="This Month">This Month</SelectItem>
            <SelectItem value="Last Month">Last Month</SelectItem>
            <SelectItem value="This Quarter">This Quarter</SelectItem>
            <SelectItem value="This Year">This Year</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
