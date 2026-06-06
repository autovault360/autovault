import { redirect } from "next/navigation";
import SalesRepPortalShell from "@/components/sales-rep/layout/sales-rep-portal-shell";
import { createClient } from "@/lib/supabase/server";

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

  return <SalesRepPortalShell>{children}</SalesRepPortalShell>;
}
