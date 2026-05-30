import { notFound } from "next/navigation";
import CustomerDetailShell from "@/components/customers/detail/customer-detail-shell";
import { getCustomerDetail } from "@/lib/customers/server/get-customer-detail";
import { getSalesReps } from "@/lib/customers/server/get-customers";

type Props = {
  params: Promise<{ id: string }>;
  searchParams?:
    | Promise<{ from?: string; dealJacketId?: string }>
    | { from?: string; dealJacketId?: string };
};

export default async function CustomerDetailPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const resolved =
    searchParams instanceof Promise ? await searchParams : (searchParams ?? {});

  const [customer, salesReps] = await Promise.all([
    getCustomerDetail(id),
    getSalesReps(),
  ]);

  if (!customer) {
    notFound();
  }

  const fromDealJacketId =
    resolved.from === "deal-jacket" && resolved.dealJacketId
      ? resolved.dealJacketId
      : undefined;

  return (
    <CustomerDetailShell
      customer={customer}
      salesReps={salesReps}
      fromDealJacketId={fromDealJacketId}
    />
  );
}
