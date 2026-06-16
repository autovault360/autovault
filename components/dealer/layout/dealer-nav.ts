import {
  LayoutDashboard,
  Car,
  Plus,
  Handshake,
  Search,
  Tag,
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
  Scale,
  type LucideIcon,
} from "lucide-react";
import {
  DEALER_ROUTES,
  DEALER_SECTION_IDS,
  type DealerExpandAction,
  type DealerSectionId,
} from "@/lib/dealer/dashboard/navigation";

export type DealerNavItem = {
  label: string;
  icon: LucideIcon;
  color: string;
  href?: string;
  sectionId?: DealerSectionId;
  expandAction?: DealerExpandAction;
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
        href: DEALER_ROUTES.dashboard,
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
        href: DEALER_ROUTES.inventory,
      },
      {
        label: "Missing Titles Center",
        icon: FileWarning,
        color: "text-red-400",
        href: "/dealer/dashboard/missing-titles",
      },
      {
        label: "Arbitration",
        icon: Scale,
        color: "text-orange-400",
        href: DEALER_ROUTES.arbitration,
      },
    ],
  },
  {
    label: "SOLD VEHICLES",
    items: [
      {
        label: "Add Sold Vehicle",
        icon: Plus,
        color: "text-emerald-500",
        expandAction: "sold-add",
      },
      {
        label: "Sold Vehicles",
        icon: Tag,
        color: "text-blue-500",
        href: DEALER_ROUTES.soldVehicles,
      },
    ],
  },
  {
    label: "DEALER TRANSACTIONS",
    items: [
      {
        label: "Add Transaction",
        icon: Search,
        color: "text-cyan-500",
        expandAction: "transaction-add",
      },
      {
        label: "Dealer Transactions",
        icon: Handshake,
        color: "text-amber-500",
        href: DEALER_ROUTES.transactions,
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
        label: "Add Vehicle Expense",
        icon: Car,
        color: "text-blue-500",
        href: DEALER_ROUTES.addVehicleExpense,
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
        href: DEALER_ROUTES.documents,
      },
      {
        label: "Upload Documents",
        icon: Upload,
        color: "text-cyan-500",
        href: `${DEALER_ROUTES.documents}?upload=true`,
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
        href: DEALER_ROUTES.profile,
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
