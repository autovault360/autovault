import type { Metadata } from "next";
import { getAuthContext } from "@/lib/dashboard/server/auth-context";
import { fetchCpaVehicleLossesReport } from "@/lib/cpa/server/vehicle-losses-report/get-vehicle-losses-report";
import VehicleLossesReportPage from "@/components/financials/vehicle-losses-report-page";

export const metadata: Metadata = {
  title: "Vehicle Losses Report | Admin Dashboard",
  description: "Vehicle loss analytics for administrative review.",
};

export default async function AdminVehicleLossesReportPage() {
  const auth = await getAuthContext();
  if (!auth) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-red-400">
        Unable to authenticate.
      </div>
    );
  }

  const now = new Date();
  const data = await fetchCpaVehicleLossesReport(auth.dealershipId, {
    view: "monthly",
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });

  return <VehicleLossesReportPage data={data} />;
}
