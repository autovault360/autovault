import DealJacketsPageContent from "@/components/deal-jackets/deal-jackets-page-content";
import { DEAL_JACKETS_MOCK } from "@/lib/deal-jackets/mock-data";

export default function DealJacketsPage() {
  return <DealJacketsPageContent dealJackets={DEAL_JACKETS_MOCK} />;
}
