import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getAuthContext } from "@/lib/dashboard/server/auth-context";
import { fetchCpaProfitVehiclesReport } from "@/lib/cpa/server/profit-vehicles-report/get-profit-vehicles-report";
import ProfitVehiclesReportPage from "@/components/financials/profit-vehicles-report-page";

export const metadata: Metadata = {
  title: "Profit Vehicles Report | Admin Dashboard",
  description: "Profitable vehicle sales analytics.",
};

export default async function AdminProfitVehiclesReportPage() {
  const auth = await getAuthContext();
  if (!auth) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-red-400">
        Unable to authenticate.
      </div>
    );
  }

  const now = new Date();
  const data = await fetchCpaProfitVehiclesReport(auth.dealershipId, {
    view: "monthly",
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });

  return <ProfitVehiclesReportPage data={data} />;
}
