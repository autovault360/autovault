import {
  LayoutDashboard,
  Calendar,
  Receipt,
  Users,
  Archive,
  StickyNote,
  FileDown,
  BarChart3,
  FileText,
  Car,
  Wallet,
  Building2,
  TrendingUp,
  TrendingDown,
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
    label: "CPA PORTAL",
    items: [
      {
        href: "/cpa/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        color: "text-violet-400",
        activeClassName: "border-violet-500/40 bg-violet-600/20 font-semibold text-white",
      },
      {
        href: "/cpa/dealership-overview",
        label: "Dealership Overview",
        icon: Building2,
        color: "text-blue-400",
        comingSoon: true,
      },
    ],
  },
  {
    label: "FINANCIALS",
    items: [
      {
        href: "/cpa/monthly-financials",
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
        href: "/cpa/expenses",
        label: "Expenses",
        icon: Wallet,
        color: "text-orange-400",
      },
      {
        href: "/cpa/vehicles",
        label: "Vehicles",
        icon: Car,
        color: "text-blue-400",
        comingSoon: true,
      },
      {
        href: "/cpa/sales-tax",
        label: "Sales Tax Center",
        icon: Receipt,
        color: "text-cyan-400",
      },
    ],
  },
  {
    label: "REPORTS",
    items: [
      {
        href: "/cpa/monthly-financials",
        label: "Monthly View",
        icon: Calendar,
        color: "text-emerald-400",
      },
      {
        href: "/cpa/yearly-financials",
        label: "Yearly View",
        icon: Calendar,
        color: "text-cyan-400",
      },
      {
        href: "/cpa/dashboard/profit-vehicles-report",
        label: "Profit Vehicles Report",
        icon: TrendingUp,
        color: "text-emerald-400",
      },
      {
        href: "/cpa/dashboard/vehicle-losses-report",
        label: "Vehicle Losses Report",
        icon: TrendingDown,
        color: "text-red-400",
      },
      {
        href: "/cpa/custom-reports",
        label: "Custom Reports",
        icon: FileText,
        color: "text-slate-400",
        comingSoon: true,
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
        href: "/cpa/files",
        label: "Document Center",
        icon: Archive,
        color: "text-cyan-400",
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
    ],
  },
];
