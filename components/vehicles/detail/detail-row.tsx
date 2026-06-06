import { cn } from "@/lib/utils";

function displayValue(value: React.ReactNode): React.ReactNode {
  if (value === "" || value === null || value === undefined || value === 0)
    return "...";
  return value;
}

export function DetailRow({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 py-1.5",
        className,
      )}
    >
      <span className="shrink-0 text-[10.5px] text-slate-500">{label}</span>
      <span className="text-right text-[11px] font-medium text-white">
        {displayValue(value)}
      </span>
    </div>
  );
}

export function DetailGridRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="py-1">
      <div className="text-[10.5px] text-slate-500">{label}</div>
      <div className="mt-0.5 text-[11.5px] text-white">{value}</div>
    </div>
  );
}
