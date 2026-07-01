"use client";

import { useRouter } from "next/navigation";
import {
  Users,
  Folder,
  Shield,
  Archive,
  StickyNote,
  LayoutDashboard,
  Receipt,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { HeaderIconAction } from "@/components/layout/header-icon-action";
import { HeaderMoreMenu } from "@/components/layout/header-more-menu";
import { PortalHeaderShell } from "@/components/layout/portal-header-shell";
import { useCpaPortal } from "../context/cpa-portal-context";

export default function CpaPortalHeader() {
  const router = useRouter();
  const { session, openNotes } = useCpaPortal();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/cpa/login");
    router.refresh();
  }

  if (!session) return null;

  const actions = (
    <>
      <HeaderIconAction
        icon={Users}
        label="Payroll"
        tone="blue"
        onClick={() => router.push("/cpa/dashboard/payroll-commissions")}
      />
      <HeaderIconAction
        icon={Folder}
        label="Deal Jackets"
        tone="green"
        onClick={() => router.push("/cpa/deal-jackets")}
      />
      <HeaderIconAction
        icon={Shield}
        label="Audit"
        tone="red"
        onClick={() => router.push("/cpa/audit")}
      />
      <HeaderIconAction
        icon={Archive}
        label="Files"
        tone="purple"
        onClick={() => router.push("/cpa/files")}
      />
      <HeaderIconAction
        icon={StickyNote}
        label="CPA Notes"
        tone="greenDark"
        onClick={openNotes}
      />
      <HeaderMoreMenu
        items={[
          { label: "Dashboard", href: "/cpa/dashboard" },
          { label: "Monthly Financials", href: "/cpa/dashboard/monthly-financial" },
          { label: "Deal Jacket Review", href: "/cpa/deal-jackets" },
          { label: "Audit Readiness", href: "/cpa/audit" },
        ]}
      />
    </>
  );

  return (
    <PortalHeaderShell
      searchPlaceholder="Search deals, files, payroll, or reports..."
      actions={actions}
      mobileActions={actions}
      profile={{
        name: session.fullName,
        subtitle: session.email,
        initials: session.initials,
        onLogout: handleLogout,
      }}
    />
  );
}
