import { redirect } from "next/navigation";
import SalesRepPortalShell from "@/components/sales-rep/layout/sales-rep-portal-shell";
import { createClient } from "@/lib/supabase/server";

const SALES_REP_ROLES = new Set(["sales_rep"]);

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";
}

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
    .select("id, full_name, role, image_url, email")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile || !SALES_REP_ROLES.has(profile.role)) {
    await supabase.auth.signOut();
    redirect("/sales-rep/login");
  }

  let imageUrl: string | null = null;
  if (profile.image_url) {
    const { data: signed } = await supabase.storage
      .from("user-images")
      .createSignedUrl(profile.image_url, 3600);
    if (signed?.signedUrl) imageUrl = signed.signedUrl;
  }

  return (
    <SalesRepPortalShell
      profile={{
        name: profile.full_name ?? "Sales Rep",
        title: "Sales Representative",
        id: profile.id,
        initials: getInitials(profile.full_name ?? "Sales Rep"),
        imageUrl: imageUrl ?? undefined,
      }}
    >
      {children}
    </SalesRepPortalShell>
  );
}
