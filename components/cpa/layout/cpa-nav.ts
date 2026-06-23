import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Users,
  Archive,
  StickyNote,
  FileDown,
  BarChart3,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type CpaNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  color: string;
  comingSoon?: boolean;
  badgeKey?: "notes";
  opensNotes?: boolean;
  activeClassName?: string;
};

export type CpaNavGroup = {
  label: string | null;
  items: CpaNavItem[];
};

export const CPA_NAV_GROUPS: CpaNavGroup[] = [
  {
    label: "DASHBOARD",
    items: [
      {
        href: "/cpa/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        color: "text-violet-400",
        activeClassName: "border-violet-500/40 bg-violet-600/20 font-semibold text-white",
      },
    ],
  },
  {
    label: "FINANCIALS",
    items: [
      {
        href: "/cpa/profit-loss",
        label: "Profit & Loss",
        icon: BarChart3,
        color: "text-emerald-400",
      },
      {
        href: "/cpa/dashboard/payroll-commissions",
        label: "Payroll & Commissions",
        icon: Users,
        color: "text-violet-400",
      },
      {
        href: "/cpa/dashboard/profit-vehicles-report",
        label: "Vehicle Profit Report",
        icon: TrendingUp,
        color: "text-green-400",
      },
      {
        href: "/cpa/dashboard/vehicle-losses-report",
        label: "Vehicle Loss Report",
        icon: TrendingDown,
        color: "text-red-400",
      },
      {
        href: "/cpa/expenses",
        label: "Expenses",
        icon: Wallet,
        color: "text-orange-400",
      },
    ],
  },
  {
    label: "TOOLS",
    items: [
      {
        href: "/cpa/exports",
        label: "Export Data",
        icon: FileDown,
        color: "text-red-400",
      },
      {
        href: "/cpa/dashboard",
        label: "CPA Notes",
        icon: StickyNote,
        color: "text-yellow-400",
        badgeKey: "notes",
        opensNotes: true,
        comingSoon: true,
      },
      {
        href: "/cpa/files",
        label: "Document Center",
        icon: Archive,
        color: "text-cyan-400",
      },
    ],
  },
];
