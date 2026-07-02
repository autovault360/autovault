import type { Metadata } from "next";
import { getAuthContext } from "@/lib/dashboard/server/auth-context";
import { buildVehiclesByLossReport } from "@/lib/financials/vehicles-report/build-vehicles-report";
import VehiclesByLossPageContent from "@/components/financials/vehicles-report/vehicles-by-loss-page-content";

export const metadata: Metadata = {
  title: "Vehicles by Loss | Admin Dashboard",
  description:
    "Vehicles closing below cost — ranked by biggest loss first.",
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
  const data = await buildVehiclesByLossReport(auth.dealershipId, {
    view: "monthly",
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });

  return <VehiclesByLossPageContent initialData={data} />;
}
