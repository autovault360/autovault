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
  Wallet,
  TrendingDown,
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
      {
        label: "Financials",
        icon: TrendingUp,
        color: "text-emerald-400",
        sectionId: "financials",
        subItems: [
          {
            href: "/dashboard/financials/payroll-commissions",
            label: "Payroll & Commissions",
            icon: Users,
            color: "text-violet-400",
          },
          {
            href: "/dashboard/financials/profit-vehicles-report",
            label: "Vehicle Profit Report",
            icon: TrendingUp,
            color: "text-green-400",
          },
          {
            href: "/dashboard/financials/vehicle-losses-report",
            label: "Vehicle Loss Report",
            icon: TrendingDown,
            color: "text-red-400",
          },
          {
            href: "/dashboard/financials/expenses",
            label: "Expenses",
            icon: Wallet,
            color: "text-orange-400",
          },
        ],
      },
      {
        label: "Customers",
        href: "/dashboard/customers",
        icon: User,
        color: "text-purple-500",
      },
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
