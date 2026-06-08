import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/layout/AdminSidebar";

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
    <div className="flex h-screen bg-[#010d19]">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 pb-8 pt-16 lg:pt-5">
        {children}
      </main>
    </div>
  );
}
