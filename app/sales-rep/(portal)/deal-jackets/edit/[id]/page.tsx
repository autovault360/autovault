import SalesRepEditDealJacketPageContent from "@/components/deal-jackets/edit/sales-rep-edit-deal-jacket-page-content";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditDealJacketPage({ params }: Props) {
  const { id } = await params;

  return <SalesRepEditDealJacketPageContent dealJacketId={id} />;
}
