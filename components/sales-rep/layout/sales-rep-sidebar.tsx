"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Headphones, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  SALES_REP_NAV_GROUPS,
  type SalesRepNavItem,
} from "./sales-rep-nav";

function isNavActive(pathname: string, href: string) {
  if (href === "/sales-rep/dashboard") {
    return pathname === "/sales-rep/dashboard";
  }
  return (
    pathname === href ||
    (href.length > 1 && pathname.startsWith(`${href}/`))
  );
}

function NavBadge({ item }: { item: SalesRepNavItem }) {
  if (!item.badge) return null;
  const colorClass =
    item.badgeColor === "amber"
      ? "bg-amber-500"
      : item.badgeColor === "red"
        ? "bg-red-500"
        : "bg-blue-500";
  return (
    <span
      className={cn(
        "ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white",
        colorClass,
      )}
    >
      {item.badge}
    </span>
  );
}

export default function SalesRepSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const renderNavItem = (item: SalesRepNavItem) => {
    const active = isNavActive(pathname, item.href);
    const className = cn(
      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-slate-300 transition hover:bg-slate-800/60",
      active &&
        "border border-slate-700 bg-slate-800/80 font-semibold text-white",
    );

    if (item.comingSoon && item.href !== "/sales-rep/dashboard") {
      return (
        <div
          key={item.label}
          className={cn(className, "cursor-default opacity-70")}
        >
          <item.icon className={cn("h-4 w-4 shrink-0", item.color)} />
          <span className="truncate">{item.label}</span>
          <NavBadge item={item} />
        </div>
      );
    }

    return (
      <Link
        key={item.label}
        href={item.href}
        onClick={close}
        className={className}
      >
        <item.icon className={cn("h-4 w-4 shrink-0", item.color)} />
        <span className="truncate">{item.label}</span>
        <NavBadge item={item} />
      </Link>
    );
  };

  const sidebar = (
    <aside className="flex h-full w-64 flex-col gap-3.5 overflow-y-auto border-r border-slate-800 bg-[#0b1322] p-3">
      <div className="flex items-center">
        <Image
          src="/logo.webp"
          alt="AutoVault Logo"
          width={200}
          height={40}
          className="object-cover p-2"
        />
      </div>

      <div>
        <div className="px-1.5 pb-1.5 pt-2 text-[10px] font-semibold tracking-[0.12em] text-slate-500">
          SALES REP PORTAL
        </div>
        <div className="space-y-1">
          <div className="flex w-full items-center gap-2.5 rounded-lg border border-slate-700 bg-slate-800/70 p-2 text-left">
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://i.pravatar.cc/64?img=33" />
              <AvatarFallback className="bg-slate-800 text-sm text-white">
                MJ
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold text-white">
                Mike Johnson
              </div>
              <div className="truncate text-[9.5px] tracking-wider text-slate-500">
                SALES REPRESENTATIVE
              </div>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5">
        {SALES_REP_NAV_GROUPS.map((group, gi) => (
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
          <div className="text-[13px] text-slate-500">Contact Support</div>
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
