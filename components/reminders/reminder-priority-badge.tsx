import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ReminderPriority } from "@/lib/reminders/types";

const styles: Record<ReminderPriority, string> = {
  high: "bg-red-500/15 text-red-400",
  medium: "bg-amber-500/15 text-amber-400",
  low: "bg-emerald-500/15 text-emerald-400",
};

const labels: Record<ReminderPriority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export default function ReminderPriorityBadge({
  priority,
  className,
}: {
  priority: ReminderPriority;
  className?: string;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn("px-1.5 py-0.5 text-[9.5px] font-semibold capitalize", styles[priority], className)}
    >
      {labels[priority]}
    </Badge>
  );
}
