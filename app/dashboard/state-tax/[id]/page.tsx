import { notFound } from "next/navigation";
import { getFilingPeriodDetailAction } from "@/lib/tax-filing/server/get-filing-period-detail";
import FilingPeriodDetailPage from "@/components/state-tax/filing-period-detail-page";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function FilingPeriodPage({ params }: Props) {
  const { id } = await params;
  const detail = await getFilingPeriodDetailAction(id);

  if (!detail) {
    notFound();
  }

  return <FilingPeriodDetailPage detail={detail} />;
}
