import type { Metadata } from "next";
import { getAuthContext } from "@/lib/dashboard/server/auth-context";
import { buildVehiclesByProfitReport } from "@/lib/financials/vehicles-report/build-vehicles-report";
import VehiclesByProfitPageContent from "@/components/financials/vehicles-report/vehicles-by-profit-page-content";

export const metadata: Metadata = {
  title: "Vehicles by Profit | Admin Dashboard",
  description: "Sold vehicles that closed profitable — ranked highest net profit first.",
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
  const data = await buildVehiclesByProfitReport(auth.dealershipId, {
    view: "monthly",
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });

  return <VehiclesByProfitPageContent initialData={data} />;
}
