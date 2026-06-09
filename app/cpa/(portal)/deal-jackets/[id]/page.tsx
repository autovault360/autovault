import { notFound } from "next/navigation";
import CpaHeader from "@/components/cpa/layout/cpa-header";
import DealJacketDetailShell from "@/components/deal-jackets/detail/deal-jacket-detail-shell";
import { getCpaSession } from "@/lib/cpa/server/get-cpa-session";
import { getDealJacketDetail } from "@/lib/deal-jackets/get-deal-jacket-detail";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CpaDealJacketDetailPage({ params }: Props) {
  const { id } = await params;
  const [detail, session] = await Promise.all([
    getDealJacketDetail(id),
    getCpaSession(),
  ]);

  if (!detail) {
    notFound();
  }

  return (
    <>
      <CpaHeader />
      <DealJacketDetailShell
        detail={detail}
        readOnly={session?.isReadOnly ?? true}
        showAdminHeader={false}
        basePath="/cpa"
      />
    </>
  );
}
