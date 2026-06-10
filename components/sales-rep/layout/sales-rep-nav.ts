import {
  LayoutDashboard,
  Car,
  CheckCircle,
  Bell,
  FolderPlus,
  Folder,
  Clock,
  CheckSquare,
  XCircle,
  MessageSquare,
  Users,
  FileUp,
  DollarSign,
  Wallet,
  BarChart3,
  User,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type SalesRepNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  color: string;
  comingSoon?: boolean;
  badge?: number;
  badgeColor?: "blue" | "amber" | "red";
};

export type SalesRepNavGroup = {
  label: string | null;
  items: SalesRepNavItem[];
};

export const SALES_REP_NAV_GROUPS: SalesRepNavGroup[] = [
  {
    label: null,
    items: [
      {
        href: "/sales-rep/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        color: "text-blue-500",
      },
    ],
  },
  {
    label: "INVENTORY",
    items: [
      {
        href: "/sales-rep/dashboard/inventory",
        label: "Browse Inventory",
        icon: Car,
        color: "text-emerald-500",
      },
      {
        href: "/sales-rep/sold-vehicles",
        label: "My Sold Vehicles",
        icon: CheckCircle,
        color: "text-green-500",
        comingSoon: true,
      },
      {
        href: "/sales-rep/vehicle-alerts",
        label: "Vehicle Alerts",
        icon: Bell,
        color: "text-amber-500",
        comingSoon: true,
        badge: 12,
        badgeColor: "blue",
      },
    ],
  },
  {
    label: "DEALS",
    items: [
      {
        href: "/sales-rep/deal-jackets/create",
        label: "Create Deal Jacket",
        icon: FolderPlus,
        color: "text-blue-500",
        comingSoon: true,
      },
      {
        href: "/sales-rep/deal-jackets",
        label: "My Deal Jackets",
        icon: Folder,
        color: "text-cyan-500",
        comingSoon: true,
        badge: 5,
        badgeColor: "amber",
      },
      {
        href: "/sales-rep/deal-jackets/pending",
        label: "Pending Approval",
        icon: Clock,
        color: "text-amber-500",
        comingSoon: true,
      },
      {
        href: "/sales-rep/deal-jackets/approved",
        label: "Approved Deals",
        icon: CheckSquare,
        color: "text-green-500",
        comingSoon: true,
      },
      {
        href: "/sales-rep/deal-jackets/rejected",
        label: "Rejected / Changes",
        icon: XCircle,
        color: "text-red-500",
        comingSoon: true,
      },
    ],
  },
  {
    label: "COMMUNICATION",
    items: [
      {
        href: "/sales-rep/messages",
        label: "Messages",
        icon: MessageSquare,
        color: "text-blue-500",
        comingSoon: true,
        badge: 3,
        badgeColor: "blue",
      },
      {
        href: "/sales-rep/team-chat",
        label: "Team Chat",
        icon: Users,
        color: "text-purple-500",
        comingSoon: true,
      },
      {
        href: "/sales-rep/send-document",
        label: "Send Document",
        icon: FileUp,
        color: "text-cyan-500",
        comingSoon: true,
      },
    ],
  },
  {
    label: "COMMISSIONS & PAYROLL",
    items: [
      {
        href: "/sales-rep/commissions",
        label: "My Commissions",
        icon: DollarSign,
        color: "text-green-500",
        comingSoon: true,
      },
      {
        href: "/sales-rep/payroll",
        label: "Payroll & Payouts",
        icon: Wallet,
        color: "text-emerald-500",
        comingSoon: true,
      },
      {
        href: "/sales-rep/commission-reports",
        label: "Commission Reports",
        icon: BarChart3,
        color: "text-blue-500",
        comingSoon: true,
      },
    ],
  },
  {
    label: "PROFILE",
    items: [
      {
        href: "/sales-rep/profile",
        label: "My Profile",
        icon: User,
        color: "text-slate-400",
        comingSoon: true,
      },
      {
        href: "/sales-rep/settings",
        label: "Settings",
        icon: Settings,
        color: "text-slate-400",
        comingSoon: true,
      },
    ],
  },
];
