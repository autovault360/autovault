import { redirect } from "next/navigation";
import SalesRepPortalShell from "@/components/sales-rep/layout/sales-rep-portal-shell";
import { createClient } from "@/lib/supabase/server";

const SALES_REP_ROLES = new Set(["sales_rep"]);

export default async function SalesRepPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sales-rep/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile || !SALES_REP_ROLES.has(profile.role)) {
    await supabase.auth.signOut();
    redirect("/sales-rep/login");
  }

  return <SalesRepPortalShell>{children}</SalesRepPortalShell>;
}
