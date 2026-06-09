import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getAdminDashboardData } from "@/lib/dashboard/server/get-admin-dashboard-data";
import AdminDashboardContent from "./_components/admin-dashboard-content";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: dealStatusFilter } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dashboardData = await getAdminDashboardData(dealStatusFilter);

  return <AdminDashboardContent {...dashboardData} />;
}
