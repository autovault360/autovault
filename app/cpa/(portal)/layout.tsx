import { redirect } from "next/navigation";
import CpaPortalShell from "@/components/cpa/layout/cpa-portal-shell";
import { getCpaSession } from "@/lib/cpa/server/get-cpa-session";
import { canAccessCpaPortal } from "@/lib/cpa/server/permissions";
import { createClient } from "@/lib/supabase/server";
import type { AuthUser } from "@/lib/vehicles/server/utils";

export default async function CpaPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/cpa/login");

  const session = await getCpaSession();
  if (
    !session ||
    !canAccessCpaPortal(session.role as AuthUser["role"])
  ) {
    redirect("/dashboard");
  }

  return <CpaPortalShell session={session}>{children}</CpaPortalShell>;
}
