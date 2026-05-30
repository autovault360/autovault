import { cn } from "@/lib/utils";

export default function ActiveCustomerBadge({
  className,
}: {
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 text-[10.5px] font-semibold text-emerald-400",
        className,
      )}
    >
      Active Customer
    </span>
  );
}
