import { notFound } from "next/navigation";
import DealJacketDetailShell from "@/components/deal-jackets/detail/deal-jacket-detail-shell";
import { getDealJacketDetail } from "@/lib/deal-jackets/get-deal-jacket-detail";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function DealJacketDetailPage({ params }: Props) {
  const { id } = await params;
  const detail = await getDealJacketDetail(id);

  if (!detail) {
    notFound();
  }

  return <DealJacketDetailShell detail={detail} />;
}
