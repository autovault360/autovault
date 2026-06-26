import {
  LayoutDashboard,
  Car,
  Tag,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Folder,
  FolderPlus,
  Archive,
  Wallet,
  Calendar,
  FileText,
  Receipt,
  BookOpen,
  Users,
  Handshake,
  Shield,
  Building2,
  Settings,
  Bell,
} from "lucide-react";
import type { SidebarGroup } from "@/components/layout/sidebar";

export const ADMIN_NAV_GROUPS: SidebarGroup[] = [
  {
    label: null,
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        color: "text-blue-500",
        exact: true,
      },
      {
        href: "/dashboard/vehicles",
        label: "Inventory",
        icon: Car,
        color: "text-amber-500",
      },
      // {
      //   href: "/dashboard/sold-vehicles",
      //   label: "Sold Vehicles",
      //   icon: Tag,
      //   color: "text-green-500",
      // },
      {
        href: "/dashboard/financials/profit-vehicles-report",
        label: "Vehicles by Profit",
        icon: TrendingUp,
        color: "text-green-500",
      },
      {
        href: "/dashboard/financials/vehicle-losses-report",
        label: "Vehicles by Loss",
        icon: TrendingDown,
        color: "text-red-500",
      },
      {
        href: "/dashboard/profit-loss",
        label: "Profit & Loss",
        icon: BarChart3,
        color: "text-green-500",
      },
      {
        href: "/dashboard/expenses",
        label: "Expenses",
        icon: DollarSign,
        color: "text-red-500",
      },
    ],
  },
  {
    label: "PEOPLE",
    items: [
      {
        href: "/dashboard/customers",
        label: "Customers",
        icon: Users,
        color: "text-blue-500",
      },
      {
        href: "/dashboard/sales-reps",
        label: "Sales Reps",
        icon: Handshake,
        color: "text-green-500",
      },
      // {
      //   href: "/dashboard/users",
      //   label: "Users",
      //   icon: Shield,
      //   color: "text-purple-500",
      // },
    ],
  },
  {
    label: "DOCUMENTS",
    items: [
      {
        href: "/dashboard/deal-jackets/create",
        label: "Create a Deal Jacket",
        icon: FolderPlus,
        color: "text-cyan-500",
      },
      {
        href: "/dashboard/deal-jackets",
        label: "Deal Jacket",
        icon: Folder,
        color: "text-blue-500",
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
        href: "/dashboard/financials/payroll-commissions",
        label: "Payroll & Commissions",
        icon: Wallet,
        color: "text-emerald-500",
      },
    ],
  },
  {
    label: "TOOLS",
    items: [
      {
        href: "/dashboard/calendar",
        label: "Calendar",
        icon: Calendar,
        color: "text-emerald-500",
      },
      {
        href: "/dashboard/reports",
        label: "Reports",
        icon: FileText,
        color: "text-red-500",
      },
      {
        href: "/dashboard/reminders",
        label: "Reminders",
        icon: Bell,
        color: "text-amber-500",
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
  {
    label: "ADMIN",
    items: [
      {
        href: "/dashboard/dealerships",
        label: "Dealerships",
        icon: Building2,
        color: "text-indigo-500",
      },
      {
        href: "/dashboard/settings",
        label: "Settings",
        icon: Settings,
        color: "text-slate-400",
      },
    ],
  },
];
