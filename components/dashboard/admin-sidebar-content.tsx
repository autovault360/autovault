"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, TrendingUp } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import UnifiedSidebar from "@/components/layout/unified-sidebar";
import { ADMIN_NAV_GROUPS } from "@/components/layout/admin-nav";
import type { SidebarItem } from "@/components/layout/sidebar";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

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
  const pathname = usePathname();

  const financialsHrefs = [
    "/dashboard/financials/payroll-commissions",
    "/dashboard/financials/profit-vehicles-report",
    "/dashboard/financials/vehicle-losses-report",
    "/dashboard/financials/expenses",
  ];

  const isFinancialsActive = financialsHrefs.some(
    (href) => pathname === href || pathname.startsWith(`${href}/`),
  );

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

  const renderItem = (item: SidebarItem, defaultRender: () => React.ReactNode) => {
    if (item.sectionId === "financials") {
      return (
        <div key="financials-accordion">
          <Accordion type="single" collapsible defaultValue={isFinancialsActive ? "financials" : undefined}>
            <AccordionItem value="financials" className="border-none">
              <AccordionTrigger className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-slate-300 hover:bg-slate-800/60 hover:no-underline [&[data-state=open]]:text-white">
                <TrendingUp className="h-4 w-4 shrink-0 text-emerald-400" />
                <span className="flex-1 text-left">Financials</span>
              </AccordionTrigger>
              <AccordionContent className="pb-1 [&_a]:no-underline [&_a:hover]:text-white">
                <div className="ml-3 space-y-0.5">
                  {item.subItems?.map((sub) => {
                    const subActive = pathname === sub.href || (sub.href && pathname.startsWith(`${sub.href}/`));
                    const Icon = sub.icon;
                    return (
                      <Link
                        key={sub.label}
                        href={sub.href ?? "#"}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] text-slate-400 transition hover:bg-slate-800/60 hover:text-white",
                          subActive && "border border-slate-700 bg-slate-800/80 font-semibold text-white",
                        )}
                      >
                        {Icon && <Icon className={cn("h-4 w-4 shrink-0", sub.color ?? "text-slate-400")} />}
                        <span className="truncate">{sub.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      );
    }
    return defaultRender();
  };

  return <UnifiedSidebar groups={ADMIN_NAV_GROUPS} profile={profileSection} renderItem={renderItem} />;
}
