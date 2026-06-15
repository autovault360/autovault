"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Car,
  FileWarning,
  Handshake,
  Plus,
  Receipt,
  Scale,
  Tag,
  BarChart3,
  Package,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { HeaderIconAction } from "@/components/layout/header-icon-action";
import { HeaderMoreMenu } from "@/components/layout/header-more-menu";
import { PortalHeaderShell } from "@/components/layout/portal-header-shell";
import {
  DEALER_ROUTES,
  DEALER_SECTION_IDS,
} from "@/lib/dealer/dashboard/navigation";
import { useDealerNavigation } from "../context/dealer-dashboard-context";

type Props = {
  dealershipName: string;
  initials: string;
  notificationCount?: number;
};

export default function DealerHeader({
  dealershipName,
  initials,
  notificationCount = 0,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    navigateToSection,
    triggerAddVehicle,
    triggerAddSoldVehicle,
    triggerAddTransaction,
    openExpenseModal,
  } = useDealerNavigation();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/dealer/login");
    router.refresh();
  }

  const handleAddExpense = () => {
    openExpenseModal();
    if (pathname === DEALER_ROUTES.dashboard) {
      navigateToSection(DEALER_SECTION_IDS.expenses, "expense-add");
    }
  };

  const actions = (
    <>
      <HeaderIconAction
        icon={Plus}
        label="Add Vehicle"
        tone="blue"
        onClick={triggerAddVehicle}
      />
      <HeaderIconAction
        icon={Car}
        label="Inventory"
        tone="green"
        onClick={() => router.push(DEALER_ROUTES.inventory)}
      />
      <HeaderIconAction
        icon={FileWarning}
        label="Missing Titles"
        tone="red"
        onClick={() => router.push("/dealer/dashboard/missing-titles")}
      />
      <HeaderIconAction
        icon={Scale}
        label="Arbitration"
        tone="orange"
        onClick={() => router.push(DEALER_ROUTES.arbitration)}
      />
      <HeaderIconAction
        icon={Tag}
        label="Add Sold"
        tone="greenDark"
        onClick={triggerAddSoldVehicle}
      />
      <HeaderIconAction
        icon={Handshake}
        label="Add Transaction"
        tone="purple"
        onClick={triggerAddTransaction}
      />
      <HeaderMoreMenu
        items={[
          {
            label: "Add Expense",
            onClick: handleAddExpense,
            icon: Receipt,
          },
          {
            label: "Missing Titles",
            href: "/dealer/dashboard/missing-titles",
            icon: FileWarning,
          },
          {
            label: "Arbitration",
            href: DEALER_ROUTES.arbitration,
            icon: Scale,
          },
          {
            label: "Sold Vehicles",
            href: DEALER_ROUTES.soldVehicles,
            icon: Tag,
          },
          {
            label: "Transactions",
            href: DEALER_ROUTES.transactions,
            icon: Handshake,
          },
          {
            label: "Profit & Loss",
            href: "/dealer/dashboard/profit-loss",
            icon: BarChart3,
          },
          {
            label: "Dashboard",
            href: DEALER_ROUTES.dashboard,
            icon: Package,
          },
        ]}
      />
    </>
  );

  return (
    <PortalHeaderShell
      searchPlaceholder="Search VIN, Stock #, or vehicle..."
      actions={actions}
      mobileActions={actions}
      notificationCount={notificationCount}
      profile={{
        name: dealershipName,
        subtitle: "Wholesale Dealer",
        initials,
        onLogout: handleLogout,
      }}
    />
  );
}
