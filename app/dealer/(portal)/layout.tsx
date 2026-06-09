import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  DealerDashboardProvider,
} from "@/components/dealer/context/dealer-dashboard-context";
import DealerPortalShell from "@/components/dealer/layout/dealer-portal-shell";

const WHOLESALE_DEALER_ROLES = new Set(["wholesale_dealer"]);

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function DealerPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/dealer/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role, full_name, dealership_id")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile || !WHOLESALE_DEALER_ROLES.has(profile.role)) {
    await supabase.auth.signOut();
    redirect("/dealer/login");
  }

  let dealershipName = profile.full_name ?? "Wholesale Dealer";
  if (profile.dealership_id) {
    const { data: dealership } = await supabase
      .from("dealerships")
      .select("name")
      .eq("id", profile.dealership_id)
      .maybeSingle();
    if (dealership?.name) dealershipName = dealership.name;
  }
  const initials = getInitials(dealershipName);

  return (
    <DealerDashboardProvider dealerName={dealershipName}>
      <DealerPortalShell dealershipName={dealershipName} initials={initials}>
        {children}
      </DealerPortalShell>
    </DealerDashboardProvider>
  );
}
