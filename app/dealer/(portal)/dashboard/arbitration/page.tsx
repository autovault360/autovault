import type { Metadata } from "next";
import ArbitrationPageContent from "@/components/dealer/arbitration/arbitration-page-content";
import { getArbitrationDashboard } from "@/lib/dealer/arbitration/server/get-arbitration-dashboard";

export const metadata: Metadata = {
  title: "Arbitration | Wholesale Dealer Dashboard",
  description:
    "Track vehicles in arbitration, team notes, and buyer/dealer details.",
};

export default async function ArbitrationPage() {
  const { records, stats, dealers, reasons } = await getArbitrationDashboard();

  return (
    <ArbitrationPageContent
      records={records}
      stats={stats}
      dealers={dealers}
      reasons={reasons}
    />
  );
}
