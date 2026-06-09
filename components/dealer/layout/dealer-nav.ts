import {
  LayoutDashboard,
  Car,
  Plus,
  Handshake,
  Search,
  Receipt,
  List,
  FolderOpen,
  Upload,
  BarChart3,
  Package,
  ArrowLeftRight,
  User,
  CreditCard,
  FileWarning,
  type LucideIcon,
} from "lucide-react";
import {
  DEALER_SECTION_IDS,
  type DealerExpandAction,
  type DealerSectionId,
} from "@/lib/dealer/dashboard/navigation";

export type DealerNavItem = {
  label: string;
  icon: LucideIcon;
  color: string;
  sectionId?: DealerSectionId;
  expandAction?: DealerExpandAction;
  href?: string;
  comingSoon?: boolean;
};

export type DealerNavGroup = {
  label: string | null;
  items: DealerNavItem[];
};

export const DEALER_NAV_GROUPS: DealerNavGroup[] = [
  {
    label: null,
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        color: "text-blue-500",
        sectionId: DEALER_SECTION_IDS.dashboard,
      },
    ],
  },
  {
    label: "INVENTORY",
    items: [
      {
        label: "Add Vehicle",
        icon: Plus,
        color: "text-emerald-500",
        sectionId: DEALER_SECTION_IDS.inventory,
        expandAction: "inventory-add",
      },
      {
        label: "Inventory Overview",
        icon: Car,
        color: "text-blue-500",
        sectionId: DEALER_SECTION_IDS.inventory,
      },
      {
        label: "Missing Titles Center",
        icon: FileWarning,
        color: "text-red-400",
        href: "/dealer/dashboard/missing-titles",
      },
    ],
  },
  {
    label: "DEALER TRANSACTIONS",
    items: [
      {
        label: "Find Dealers",
        icon: Search,
        color: "text-cyan-500",
        sectionId: DEALER_SECTION_IDS.transactions,
        expandAction: "transaction-add",
      },
      {
        label: "Dealer Transactions",
        icon: Handshake,
        color: "text-amber-500",
        sectionId: DEALER_SECTION_IDS.transactions,
      },
    ],
  },
  {
    label: "EXPENSES",
    items: [
      {
        label: "All Expenses",
        icon: Receipt,
        color: "text-orange-500",
        sectionId: DEALER_SECTION_IDS.expenses,
      },
      {
        label: "Add Expense",
        icon: Plus,
        color: "text-emerald-500",
        sectionId: DEALER_SECTION_IDS.expenses,
        expandAction: "expense-add",
      },
      {
        label: "Expense Categories",
        icon: List,
        color: "text-slate-400",
        sectionId: DEALER_SECTION_IDS.expenses,
      },
    ],
  },
  {
    label: "DOCUMENTS",
    items: [
      {
        label: "Documents",
        icon: FolderOpen,
        color: "text-blue-500",
        sectionId: DEALER_SECTION_IDS.documents,
      },
      {
        label: "Uploads",
        icon: Upload,
        color: "text-cyan-500",
        sectionId: DEALER_SECTION_IDS.documents,
      },
    ],
  },
  {
    label: "REPORTS",
    items: [
      {
        label: "Profit & Loss",
        icon: BarChart3,
        color: "text-green-500",
        href: "/dealer/dashboard/profit-loss",
      },
      {
        label: "Inventory",
        icon: Package,
        color: "text-blue-500",
        comingSoon: true,
      },
      {
        label: "Transaction",
        icon: ArrowLeftRight,
        color: "text-purple-500",
        comingSoon: true,
      },
    ],
  },
  {
    label: "SETTINGS",
    items: [
      {
        label: "My Profile",
        icon: User,
        color: "text-slate-400",
        comingSoon: true,
      },
      {
        label: "Subscription",
        icon: CreditCard,
        color: "text-slate-400",
        comingSoon: true,
      },
    ],
  },
];
