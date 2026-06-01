import {
  Briefcase,
  Car,
  FileText,
  Settings,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReminderCategory, ReminderIconColor } from "@/lib/reminders/types";

const categoryIcons: Record<ReminderCategory, LucideIcon> = {
  vehicle: Car,
  deal: Briefcase,
  accounting: FileText,
  employee: Users,
  business: Settings,
  custom: User,
};

const iconBg: Record<ReminderIconColor, string> = {
  red: "bg-red-500/15 text-red-400",
  amber: "bg-amber-500/15 text-amber-400",
  blue: "bg-blue-500/15 text-blue-400",
  purple: "bg-purple-500/15 text-purple-400",
  green: "bg-emerald-500/15 text-emerald-400",
  orange: "bg-orange-500/15 text-orange-400",
  cyan: "bg-cyan-500/15 text-cyan-400",
};

export function getCategoryIcon(category: ReminderCategory) {
  return categoryIcons[category];
}

export function ReminderIconCircle({
  category,
  iconColor,
  size = "md",
}: {
  category?: ReminderCategory;
  iconColor: ReminderIconColor;
  size?: "sm" | "md";
}) {
  const Icon = category ? categoryIcons[category] : Car;
  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center rounded-full",
        iconBg[iconColor],
        size === "sm" ? "h-7 w-7" : "h-8 w-8",
      )}
    >
      <Icon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
    </div>
  );
}
