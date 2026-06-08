"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronRight, Headphones, Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { DEALER_SECTION_IDS } from "@/lib/dealer/dashboard/navigation";
import { useDealerNavigation } from "../context/dealer-dashboard-context";
import {
  DEALER_NAV_GROUPS,
  type DealerNavItem,
} from "./dealer-nav";

function renderNavActive(activeSection: string, item: DealerNavItem) {
  if (!item.sectionId) return false;
  if (item.sectionId === DEALER_SECTION_IDS.dashboard) {
    return activeSection === DEALER_SECTION_IDS.dashboard;
  }
  return activeSection === item.sectionId;
}

export default function DealerSidebar({
  dealershipName,
  initials,
}: {
  dealershipName: string;
  initials: string;
}) {
  const { navigateToSection, activeSection } = useDealerNavigation();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const renderNavItem = (item: DealerNavItem) => {
    const active = renderNavActive(activeSection, item);
    const className = cn(
      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-slate-300 transition hover:bg-slate-800/60",
      active &&
        "border border-slate-700 bg-slate-800/80 font-semibold text-white",
    );

    if (item.comingSoon) {
      return (
        <div
          key={item.label}
          className={cn(className, "cursor-default opacity-70")}
        >
          <item.icon className={cn("h-4 w-4 shrink-0", item.color)} />
          <span className="truncate">{item.label}</span>
        </div>
      );
    }

    return (
      <button
        key={item.label}
        type="button"
        onClick={() => {
          if (item.sectionId) {
            navigateToSection(item.sectionId, item.expandAction);
          }
          close();
        }}
        className={className}
      >
        <item.icon className={cn("h-4 w-4 shrink-0", item.color)} />
        <span className="truncate">{item.label}</span>
      </button>
    );
  };

  const sidebar = (
    <aside className="flex h-full w-64 flex-col gap-3.5 overflow-y-auto border-r border-slate-800 bg-[#0a101d] p-3">
      <div className="flex flex-col px-1.5 pt-1">
        <Image
          src="/logo.webp"
          alt="AutoVault360"
          width={180}
          height={36}
          className="object-contain"
        />
        <div className="mt-1 text-[9px] font-semibold tracking-[0.14em] text-slate-500">
          WHOLESALE DEALER PORTAL
        </div>
      </div>

      <div>
        <div className="flex w-full items-center gap-2.5 rounded-lg border border-slate-700 bg-slate-800/70 p-2 text-left">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-slate-800 text-sm text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold text-white">
              {dealershipName}
            </div>
            <div className="truncate text-[9.5px] tracking-wider text-slate-500">
              WHOLESALE DEALER
            </div>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
        </div>
      </div>

      <nav className="flex flex-col gap-0.5">
        {DEALER_NAV_GROUPS.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <div className="px-1.5 pb-1 pt-3 text-[10px] font-semibold tracking-[0.12em] text-slate-500">
                {group.label}
              </div>
            )}
            {group.items.map((item) => renderNavItem(item))}
          </div>
        ))}
      </nav>

      <div className="mt-auto flex items-center gap-2.5 rounded-xl border border-slate-700 bg-slate-900/60 p-2.5">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-800">
          <Headphones className="h-4 w-4 text-cyan-400" />
        </div>
        <div className="flex-1">
          <div className="text-[12.5px] font-semibold text-white">
            Need Help?
          </div>
          <div className="text-[11px] text-slate-500">Contact Support</div>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
      </div>
    </aside>
  );

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed left-3 top-3 z-30 rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:text-white lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={close} />
          <div className="absolute left-0 top-0 h-full shadow-2xl">{sidebar}</div>
        </div>
      )}

      <div className="sticky top-0 hidden h-screen lg:block">{sidebar}</div>
    </>
  );
}
