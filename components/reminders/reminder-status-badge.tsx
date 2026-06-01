import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Payment } from "@/lib/reminders/types";

const toneStyles: Record<Payment["statusTone"], string> = {
  orange: "text-amber-400",
  yellow: "text-yellow-400",
  green: "text-emerald-400",
  red: "text-red-400",
};

export default function ReminderStatusBadge({
  label,
  tone,
  className,
}: {
  label: string;
  tone: Payment["statusTone"];
  className?: string;
}) {
  return (
    <Badge
      variant="ghost"
      className={cn("text-[11px] font-medium", toneStyles[tone], className)}
    >
      {label}
    </Badge>
  );
}
