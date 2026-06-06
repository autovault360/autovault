import { cn } from "@/lib/utils";

export default function SalesRepActiveBadge({
  className,
}: {
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-emerald-600/40 bg-emerald-950/60 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400",
        className,
      )}
    >
      Active
    </span>
  );
}
