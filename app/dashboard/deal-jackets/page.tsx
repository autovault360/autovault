import DealJacketsPageContent from "@/components/deal-jackets/deal-jackets-page-content";
import { getDealJacketsForDashboard } from "@/lib/deal-jackets/get-deal-jackets-for-dashboard";

export default async function DealJacketsPage() {
  const { dealJackets, stats, salesRepFilterOptions } =
    await getDealJacketsForDashboard();

  return (
    <DealJacketsPageContent
      dealJackets={dealJackets}
      stats={stats}
      salesRepFilterOptions={salesRepFilterOptions}
      showAdminHeader={false}
    />
  );
}
