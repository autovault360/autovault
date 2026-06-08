"use client";

import { Bell, Calendar, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { DealerProfile } from "@/lib/dealer/dashboard/types";

type Props = {
  profile: DealerProfile;
  notificationCount?: number;
  dateRange?: string;
};

export default function DealerHeader({
  profile,
  notificationCount = 0,
  dateRange = "May 1 - May 24, 2024",
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <button
        type="button"
        className="flex items-center gap-1.5 rounded-md border border-[#1e293b] bg-[#070c14]/60 px-2.5 py-1.5 text-[11px] text-slate-400 transition hover:text-white"
      >
        <Calendar className="h-3.5 w-3.5" />
        <span>{dateRange}</span>
      </button>

      <button
        type="button"
        className="relative p-1.5 text-slate-400 transition hover:text-white"
        aria-label="Mail"
      >
        <Mail className="h-5 w-5" />
      </button>

      <button
        type="button"
        className="relative p-1.5 text-slate-400 transition hover:text-white"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {notificationCount > 0 && (
          <Badge className="absolute -right-1.5 -top-1 h-4 min-w-[18px] rounded-full bg-red-500 px-1 text-[10px] text-white">
            {notificationCount}
          </Badge>
        )}
      </button>

      <div className="flex items-center gap-2">
        <div className="hidden text-right sm:block">
          <div className="text-[13px] font-semibold text-white">
            {profile.dealershipName}
          </div>
        </div>
        <Avatar className="h-9 w-9 ring-2 ring-slate-700">
          <AvatarFallback className="bg-blue-600 text-xs text-white">
            {profile.initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
