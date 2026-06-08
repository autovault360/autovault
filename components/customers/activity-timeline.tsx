import {
  Calendar,
  Car,
  Mail,
  MessageSquare,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatDisplayDate,
  type ActivityTimelineItem,
} from "@/lib/customers/types";

const iconMap = {
  mail: Mail,
  phone: Phone,
  car: Car,
  note: MessageSquare,
  calendar: Calendar,
};

export default function ActivityTimeline({
  items,
  compact = false,
}: {
  items: ActivityTimelineItem[];
  compact?: boolean;
}) {
  if (items.length === 0) {
    return (
      <p className="text-[11.5px] text-slate-500">No recent activity yet.</p>
    );
  }

  return (
    <div className="space-y-0">
      {items.map((item, i) => {
        const Icon = iconMap[item.icon];
        return (
          <div key={item.id} className="relative flex gap-3 pb-4 last:pb-0">
            {i < items.length - 1 && (
              <span className="absolute left-[13px] top-7 h-[calc(100%-12px)] w-px bg-slate-700" />
            )}
            <div className="relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-slate-700 bg-[#0e1626]">
              <Icon className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="text-[12px] font-medium text-white">
                {item.title}
              </div>
              {!compact && item.description && (
                <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500">
                  {item.description}
                </p>
              )}
              <div className={cn("text-[13px] text-slate-600", compact ? "mt-0.5" : "mt-1")}>
                {formatDisplayDate(item.occurredAt)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
