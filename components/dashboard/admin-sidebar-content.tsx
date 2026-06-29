"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import UnifiedSidebar from "@/components/layout/unified-sidebar";
import { ADMIN_NAV_GROUPS } from "@/components/layout/admin-nav";

const profiles = [
  {
    name: "John Dealer",
    role: "MAIN ADMIN",
    img: "https://i.pravatar.cc/64?img=12",
  },
  {
    name: "Sarah Williams",
    role: "ADMIN #2 .. EDITOR",
    img: "https://i.pravatar.cc/64?img=47",
  },
  {
    name: "Mike Thompson",
    role: "SALES REP",
    img: "https://i.pravatar.cc/64?img=33",
  },
];

export default function AdminSidebarContent() {
  const [activeProfile, setActiveProfile] = useState(0);

  const profileSection = (
    <div>
      <div className="px-1.5 pb-1.5 pt-2 text-[10px] font-semibold tracking-[0.12em] text-slate-500">
        USER PROFILES
      </div>
      <div className="space-y-1">
        {profiles.map((p, i) => (
          <button
            key={p.name}
            onClick={() => setActiveProfile(i)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg border border-transparent p-2 text-left transition hover:bg-slate-800/60",
              activeProfile === i && "border-slate-700 bg-slate-800/70",
            )}
          >
            <Avatar className="h-9 w-9">
              <AvatarImage src={p.img} />
              <AvatarFallback>{p.name[0]}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold text-white">{p.name}</div>
              <div className="truncate text-[9.5px] tracking-wider text-slate-500">{p.role}</div>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
          </button>
        ))}
      </div>
    </div>
  );

  return <UnifiedSidebar groups={ADMIN_NAV_GROUPS} profile={profileSection} />;
}
