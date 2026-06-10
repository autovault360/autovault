import DealJacketsPageContent from "@/components/deal-jackets/deal-jackets-page-content";
import { getCpaSession } from "@/lib/cpa/server/get-cpa-session";
import { getDealJacketsForDashboard } from "@/lib/deal-jackets/get-deal-jackets-for-dashboard";

export default async function CpaDealJacketsPage() {
  const [session, { dealJackets, salesRepFilterOptions }] = await Promise.all([
    getCpaSession(),
    getDealJacketsForDashboard(),
  ]);

  return (
    <>
      <DealJacketsPageContent
        dealJackets={dealJackets}
        salesRepFilterOptions={salesRepFilterOptions}
        readOnly={session?.isReadOnly ?? true}
        showAdminHeader={false}
        basePath="/cpa"
      />
    </>
  );
}
