"use client";



import { useRouter } from "next/navigation";

import {

  Car,

  ScanLine,

  Check,

  UserPlus,

  Folder,

  Users,

  Receipt,

  LayoutDashboard,

} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import AddExpenseDropdown from "@/components/layout/add-expense-dropdown";

import { HeaderIconAction } from "@/components/layout/header-icon-action";

import { HeaderMoreMenu } from "@/components/layout/header-more-menu";

import { PortalHeaderShell } from "@/components/layout/portal-header-shell";



export default function AdminHeader({

  onAddCustomer,

  searchValue,

  onSearchChange,

  searchPlaceholder = "Search VIN, Stock #, Customer, Deal, or Tag...",

}: {

  onAddCustomer?: () => void;

  searchValue?: string;

  onSearchChange?: (value: string) => void;

  searchPlaceholder?: string;

}) {

  const router = useRouter();



  async function handleLogout() {

    const supabase = createClient();

    await supabase.auth.signOut();

    router.push("/login");

    router.refresh();

  }



  const handleAddCustomer = () => {

    if (onAddCustomer) {

      onAddCustomer();

      return;

    }

    router.push("/dashboard/customers?add=true");

  };



  const actions = (

    <>

      <HeaderIconAction

        icon={Car}

        label="Add Vehicle"

        tone="blue"

        onClick={() => router.push("/dashboard/vehicles?add=true")}

      />

      <AddExpenseDropdown variant="icon" />

      <HeaderIconAction

        icon={ScanLine}

        label="Scan VIN"

        tone="green"

        onClick={() => router.push("/dashboard/vehicles?add=true")}

      />

      <HeaderIconAction

        icon={Check}

        label="Mark Sold"

        tone="greenDark"

        onClick={() => router.push("/dashboard/vehicles")}

      />

      <HeaderIconAction

        icon={UserPlus}

        label="Add Customer"

        tone="purple"

        onClick={handleAddCustomer}

      />

      <HeaderMoreMenu

        items={[

          {

            label: "Dashboard",

            href: "/dashboard",

            icon: LayoutDashboard,

          },

          {

            label: "Deal Jackets",

            href: "/dashboard/deal-jackets",

            icon: Folder,

          },

          {

            label: "Customers",

            href: "/dashboard/customers",

            icon: Users,

          },

          {

            label: "Expenses",

            href: "/dashboard/expenses",

            icon: Receipt,

          },

        ]}

      />

    </>

  );



  return (

    <PortalHeaderShell

      searchPlaceholder={searchPlaceholder}

      searchValue={searchValue}

      onSearchChange={onSearchChange}

      actions={actions}

      mobileActions={actions}

      notificationCount={12}

      profile={{

        name: "John Dealer",

        subtitle: "Main Admin",

        initials: "JD",

        imageUrl: "https://i.pravatar.cc/64?img=12",

        onLogout: handleLogout,

      }}

    />

  );

}

