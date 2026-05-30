import { cn } from "@/lib/utils";
import { getSoldStatusStyle } from "@/lib/deal-jackets/types";

export default function SoldStatusBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold",
        getSoldStatusStyle(),
        className,
      )}
    >
      Sold
    </span>
  );
}
