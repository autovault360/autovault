"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, LogOut, MessageCircle, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import type { ISalesRepProfile } from "@/lib/sales-rep/dashboard/types";

type Props = {
  profile: ISalesRepProfile;
  notificationCount?: number;
};

export default function SalesRepHeader({
  profile,
  notificationCount = 0,
}: Props) {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [messageUnread, setMessageUnread] = useState(0);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/messages/unread-count")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.count !== undefined) setMessageUnread(data.count);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profileOpen]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/sales-rep/login");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5 border-b border-slate-800/60 pb-3.5">
      <div className="relative max-w-100 w-full">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
        <Input
          placeholder="Search VIN, Stock #, Customer, or Vehicle..."
          className="h-10 border-slate-800 bg-slate-800/50 pl-9 text-[12.5px] text-slate-200 placeholder:text-slate-500 max-w-300 w-full"
        />
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/sales-rep/messages"
          className="relative p-1.5 text-slate-400 transition hover:text-white"
          aria-label="Messages"
        >
          <MessageCircle className="h-5 w-5" />
          {messageUnread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500 px-1 text-[9px] font-bold text-white">
              {messageUnread > 99 ? "99+" : messageUnread}
            </span>
          )}
        </Link>

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

      <div ref={profileRef} className="relative">
        <button
          type="button"
          onClick={() => setProfileOpen((prev) => !prev)}
          aria-expanded={profileOpen}
          aria-haspopup="menu"
          className="flex items-center gap-2"
        >
          <div className="hidden text-right sm:block">
            <div className="text-[13px] font-semibold text-white">
              {profile.name}
            </div>
            <div className="text-[13px] text-slate-500">{profile.title}</div>
          </div>
          <Avatar className="h-9 w-9 ring-2 ring-slate-700">
            {profile.imageUrl ? (
              <AvatarImage src={profile.imageUrl} alt={profile.name} />
            ) : null}
            <AvatarFallback className="bg-blue-600 text-xs text-white">
              {profile.initials}
            </AvatarFallback>
          </Avatar>
        </button>

        {profileOpen && (
          <div
            role="menu"
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-[200px] overflow-hidden rounded-lg border border-slate-700/90 bg-card py-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
          >
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] text-red-400 transition-colors hover:bg-slate-800/70"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
