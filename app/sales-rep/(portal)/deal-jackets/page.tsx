import SalesRepDealJacketsContent from "@/components/sales-rep/deal-jackets/sales-rep-deal-jackets-content";
import { authenticateUser } from "@/lib/vehicles/server/utils";
import { listDealJackets } from "@/services/deal-jacket.service";
import { mapDealJacketListDto } from "@/lib/deal-jackets/map-list-item";

export const metadata = {
  title: "My Deal Jackets",
};

export default async function MyDealJacketsPage() {
  const auth = await authenticateUser();
  if (!auth.ok) {
    return <div className="p-6 text-slate-400">Please log in to view your deal jackets.</div>;
  }

  const result = await listDealJackets({
    dealershipId: auth.user.dealershipId,
    salesRepId: auth.user.userId,
    page: 1,
    pageSize: 200,
  });

  const dealJackets = result.items.map(mapDealJacketListDto);

  return (
    <SalesRepDealJacketsContent
      dealJackets={dealJackets}
      title="My Deal Jackets"
      description="View and manage your submitted deal jackets."
    />
  );
}
