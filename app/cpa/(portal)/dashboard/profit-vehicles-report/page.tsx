import type { Metadata } from "next";
import CpaProfitVehiclesReportContent from "@/components/cpa/profit-vehicles-report/cpa-profit-vehicles-report-content";

export const metadata: Metadata = {
  title: "Profit Vehicles Report | CPA Portal",
  description:
    "Read-only profitable vehicle sales analytics for CPA review in AutoVault360.",
};

export default function CpaProfitVehiclesReportPage() {
  return <CpaProfitVehiclesReportContent />;
}
