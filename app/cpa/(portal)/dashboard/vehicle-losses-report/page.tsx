import type { Metadata } from "next";
import CpaVehicleLossesReportContent from "@/components/cpa/vehicle-losses-report/cpa-vehicle-losses-report-content";

export const metadata: Metadata = {
  title: "Vehicle Losses Report | CPA Portal",
  description:
    "Read-only vehicle loss analytics for CPA review in AutoVault360.",
};

export default function CpaVehicleLossesReportPage() {
  return <CpaVehicleLossesReportContent />;
}
