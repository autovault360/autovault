"use client";

import { Bell, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ISalesRepProfile } from "@/lib/sales-rep/dashboard/types";

type Props = {
  profile: ISalesRepProfile;
  notificationCount?: number;
};

export default function SalesRepHeader({
  profile,
  notificationCount = 0,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <button
        type="button"
        className="relative p-1.5 text-slate-400 transition hover:text-white"
        aria-label="Team chat"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
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
            {profile.name}
          </div>
          <div className="text-[10.5px] text-slate-500">{profile.title}</div>
        </div>
        <Avatar className="h-9 w-9 ring-2 ring-slate-700">
          {profile.imageUrl ? (
            <AvatarImage src={profile.imageUrl} alt={profile.name} />
          ) : null}
          <AvatarFallback className="bg-blue-600 text-xs text-white">
            {profile.initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
