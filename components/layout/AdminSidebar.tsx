"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNProgressRouter } from "@/hooks/use-nprogress-router";
import {
  LayoutDashboard,
  Users,
  Car,
  TrendingUp,
  DollarSign,
  User,
  Folder,
  Archive,
  BarChart3,
  Calendar,
  FileText,
  Receipt,
  BookOpen,
  Headphones,
  ChevronRight,
  Check,
  X,
  Menu,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Image from "next/image";

const profiles = [
  {
    name: "John Dealer",
    role: "MAIN ADMIN",
    img: "https://i.pravatar.cc/64?img=12",
  },
  {
    name: "Sarah Williams",
    role: "ADMIN #2 · EDITOR",
    img: "https://i.pravatar.cc/64?img=47",
  },
  {
    name: "Mike Thompson",
    role: "SALES REP",
    img: "https://i.pravatar.cc/64?img=33",
  },
];

const navGroups = [
  {
    label: null,
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        color: "text-blue-500",
      },
      {
        href: "/dashboard/sales-reps",
        label: "Sales Reps",
        icon: Users,
        color: "text-emerald-500",
      },
      { href: "/dashboard/vehicles", label: "Vehicles", icon: Car, color: "text-amber-500" },
      {
        href: "/dashboard/profit-loss",
        label: "Profit & Loss",
        icon: TrendingUp,
        color: "text-green-500",
      },
      {
        href: "/dashboard/expenses",
        label: "Expenses",
        icon: DollarSign,
        color: "text-red-500",
      },
      { href: "/dashboard/customers", label: "Customers", icon: User, color: "text-purple-500" },
    ],
  },
  {
    label: "DOCUMENTS",
    items: [
      { href: "/dashboard/deal-jackets", label: "Deal Jacket", icon: Folder, color: "text-blue-500" },
      {
        href: "/dashboard/files-storage",
        label: "Files & Storage",
        icon: Archive,
        color: "text-cyan-500",
      },
    ],
  },
  {
    label: "TOOLS",
    items: [
      {
        href: "/dashboard/reports",
        label: "Reports & Reminders",
        icon: BarChart3,
        color: "text-red-500",
      },
      {
        href: "/dashboard/calendar",
        label: "Calendar",
        icon: Calendar,
        color: "text-emerald-500",
      },
      // {
      //   href: "#",
      //   label: "CDTFA Filing",
      //   icon: FileText,
      //   color: "text-blue-500",
      // },
      {
        href: "/dashboard/state-tax",
        label: "State Tax",
        icon: Receipt,
        color: "text-purple-500",
      },
      {
        href: "#",
        label: "CPA Log In",
        icon: BookOpen,
        color: "text-cyan-500",
      },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useNProgressRouter();
  const [activeProfile, setActiveProfile] = useState(0);
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const sidebar = (
    <aside className="flex h-full w-64 flex-col gap-3.5 border-r border-slate-800 bg-[#0b1322] p-3 overflow-y-auto">
      <div className="flex items-center">
        <Image
          src="/logo.webp"
          alt="AutoVault Logo"
          width={200}
          height={40}
          className="p-2 object-cover"
        />
      </div>

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
                <div className="truncate text-[13px] font-semibold text-white">
                  {p.name}
                </div>
                <div className="truncate text-[9.5px] tracking-wider text-slate-500">
                  {p.role}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
            </button>
          ))}
        </div>
      </div>

      <nav className="flex flex-col gap-0.5">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <div className="px-1.5 pb-1 pt-3 text-[10px] font-semibold tracking-[0.12em] text-slate-500">
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "#" &&
                  item.href.length > 1 &&
                  pathname.startsWith(`${item.href}/`));
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={close}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-slate-300 transition hover:bg-slate-800/60",
                    isActive &&
                      "bg-slate-800/80 border border-slate-700 text-white font-semibold",
                  )}
                >
                  <item.icon className={cn("h-4 w-4 shrink-0", item.color)} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
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
          <div className="text-[10.5px] text-slate-500">Contact Support</div>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile toggle */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed top-3 left-3 z-30 lg:hidden bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-400 hover:text-white"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={close} />
          <div className="absolute left-0 top-0 h-full shadow-2xl">
            {sidebar}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block h-screen sticky top-0">{sidebar}</div>
    </>
  );
}
