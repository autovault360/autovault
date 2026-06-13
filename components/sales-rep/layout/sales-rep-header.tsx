"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Car,
  FolderPlus,
  FileUp,
  MessageSquare,
  MessageCircle,
  CheckCircle,
  DollarSign,
  Wallet,
  LayoutDashboard,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { HeaderIconAction } from "@/components/layout/header-icon-action";
import { HeaderMoreMenu } from "@/components/layout/header-more-menu";
import { PortalHeaderShell } from "@/components/layout/portal-header-shell";
import { useSalesRepQuickActions } from "@/lib/portal/sales-rep-quick-actions-context";
import type { ISalesRepProfile } from "@/lib/sales-rep/dashboard/types";

type Props = {
  profile: ISalesRepProfile;
  notificationCount?: number;
};

export default function SalesRepHeader({
  profile,
  notificationCount = 0,
}: Props) {
  const router = useRouter();
  const { triggerAddVehicle } = useSalesRepQuickActions();
  const [messageUnread, setMessageUnread] = useState(0);

  useEffect(() => {
    fetch("/api/messages/unread-count")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.count !== undefined) setMessageUnread(data.count);
      })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/sales-rep/login");
    router.refresh();
  }

  const actions = (
    <>
      <HeaderIconAction
        icon={Car}
        label="Add Vehicle"
        tone="blue"
        onClick={triggerAddVehicle}
      />
      <HeaderIconAction
        icon={Car}
        label="Inventory"
        tone="green"
        onClick={() => router.push("/sales-rep/dashboard/inventory")}
      />
      <HeaderIconAction
        icon={FolderPlus}
        label="New Deal"
        tone="purple"
        onClick={() => router.push("/sales-rep/deal-jackets/create")}
      />
      <HeaderIconAction
        icon={FileUp}
        label="Send Doc"
        tone="greenDark"
        onClick={() => router.push("/sales-rep/dashboard/send-document")}
      />
      <HeaderIconAction
        icon={MessageSquare}
        label="Messages"
        tone="blue"
        onClick={() => router.push("/sales-rep/messages")}
      />
      <HeaderMoreMenu
        items={[
          {
            label: "Dashboard",
            href: "/sales-rep/dashboard",
            icon: LayoutDashboard,
          },
          {
            label: "My Sold Vehicles",
            href: "/sales-rep/dashboard/my-sold-vehicles",
            icon: CheckCircle,
          },
          {
            label: "My Deal Jackets",
            href: "/sales-rep/deal-jackets",
            icon: FolderPlus,
          },
          {
            label: "Commissions",
            href: "/sales-rep/commissions",
            icon: DollarSign,
          },
          {
            label: "Payroll & Earnings",
            href: "/sales-rep/dashboard/payroll-earnings",
            icon: Wallet,
          },
        ]}
      />
    </>
  );

  const messagesLink = (
    <Link
      href="/sales-rep/messages"
      className="relative p-1.5 text-slate-400 transition hover:text-slate-200"
      aria-label="Messages"
    >
      <MessageCircle className="h-5 w-5" />
      {messageUnread > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500 px-1 text-[9px] font-bold text-white">
          {messageUnread > 99 ? "99+" : messageUnread}
        </span>
      )}
    </Link>
  );

  return (
    <PortalHeaderShell
      searchPlaceholder="Search VIN, Stock #, Customer, or Vehicle..."
      actions={actions}
      mobileActions={actions}
      notificationCount={notificationCount}
      extraRight={messagesLink}
      profile={{
        name: profile.name,
        subtitle: profile.title,
        initials: profile.initials,
        imageUrl: profile.imageUrl,
        onLogout: handleLogout,
      }}
    />
  );
}
