"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Car,
  TrendingUp,
  DollarSign,
  User,
  Folder,
  FolderPlus,
  Archive,
  BarChart3,
  Calendar,
  FileText,
  Receipt,
  BookOpen,
  ChevronRight,
  Wallet,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { AppSidebar } from "./sidebar";
import type { SidebarItem, SidebarGroup } from "./sidebar";

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

const navGroups: SidebarGroup[] = [
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
        href: "/dashboard/deal-jackets/create",
        label: "Create Deal Jacket",
        icon: FolderPlus,
        color: "text-cyan-500",
      },
      {
        href: "/dashboard/files-storage",
        label: "Files & Storage",
        icon: Archive,
        color: "text-cyan-500",
      },
    ],
  },
  {
    label: "PAYROLL",
    items: [
      {
        label: "Payroll",
        icon: Wallet,
        color: "text-emerald-500",
        subItems: [
          { href: "/dashboard/payroll", label: "Payroll Dashboard", exact: true },
          { href: "/dashboard/payroll/runs", label: "Payroll Runs", comingSoon: true },
          { href: "/dashboard/payroll/commission-payouts", label: "Commission Payouts", comingSoon: true },
          { href: "/dashboard/payroll/deductions", label: "Deductions", comingSoon: true },
          { href: "/dashboard/payroll/history", label: "Payroll History", comingSoon: true },
        ],
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
      {
        href: "/dashboard/state-tax",
        label: "State Tax",
        icon: Receipt,
        color: "text-purple-500",
      },
      {
        href: "/cpa/dashboard",
        label: "CPA Portal",
        icon: BookOpen,
        color: "text-cyan-500",
      },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
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
  );

  return (
    <AppSidebar
      groups={navGroups}
      logoWidth={200}
      logoHeight={40}
      profile={profileSection}
    />
  );
}
