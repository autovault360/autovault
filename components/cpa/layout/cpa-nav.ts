import {
  LayoutDashboard,
  Calendar,
  Receipt,
  Users,
  Folder,
  Shield,
  Archive,
  StickyNote,
  FileDown,
  Bot,
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
};

export type CpaNavGroup = {
  label: string | null;
  items: CpaNavItem[];
};

export const CPA_NAV_GROUPS: CpaNavGroup[] = [
  {
    label: null,
    items: [
      {
        href: "/cpa/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        color: "text-blue-500",
      },
      {
        href: "/cpa/dashboard/monthly-financial",
        label: "Monthly Financials",
        icon: Calendar,
        color: "text-emerald-500",
        comingSoon: true,
      },
      {
        href: "/cpa/yearly-financials",
        label: "Yearly Financials",
        icon: Calendar,
        color: "text-cyan-500",
        comingSoon: true,
      },
      {
        href: "/cpa/sales-tax",
        label: "Sales Tax Center",
        icon: Receipt,
        color: "text-purple-500",
        comingSoon: true,
      },
      {
        href: "/cpa/payroll",
        label: "Payroll & Commissions",
        icon: Users,
        color: "text-orange-500",
      },
      {
        href: "/cpa/deal-jackets",
        label: "Deal Jacket Review",
        icon: Folder,
        color: "text-blue-500",
      },
      {
        href: "/cpa/audit",
        label: "Audit Readiness",
        icon: Shield,
        color: "text-amber-500",
      },
      {
        href: "/cpa/files",
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
        href: "/cpa/dashboard",
        label: "CPA Notes",
        icon: StickyNote,
        color: "text-yellow-500",
        badgeKey: "notes",
        opensNotes: true,
      },
      {
        href: "/cpa/exports",
        label: "Exports & Reports",
        icon: FileDown,
        color: "text-red-500",
        comingSoon: true,
      },
      {
        href: "/cpa/ai-assistant",
        label: "AI CPA Assistant",
        icon: Bot,
        color: "text-violet-500",
        comingSoon: true,
      },
    ],
  },
];
