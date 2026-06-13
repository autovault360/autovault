import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AppLayout from "@/components/layout/app-layout";
import AdminPortalShell from "@/components/layout/admin-portal-shell";
import AdminSidebarContent from "@/components/dashboard/admin-sidebar-content";
import AdminHeader from "@/components/layout/AdminHeader";
import AppFooter from "@/components/layout/app-footer";

const ADMIN_ALLOWED_ROLES = new Set(["super_admin", "owner", "manager"]);

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role, is_active")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile) {
    await supabase.auth.signOut();
    redirect("/login");
  }

  if (!profile.is_active) {
    await supabase.auth.signOut();
    redirect("/login");
  }

  if (!ADMIN_ALLOWED_ROLES.has(profile.role)) {
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <AdminPortalShell>
      <AppLayout
        sidebar={<AdminSidebarContent />}
        header={<AdminHeader />}
        footer={<AppFooter />}
      >
        {children}
      </AppLayout>
    </AdminPortalShell>
  );
}
