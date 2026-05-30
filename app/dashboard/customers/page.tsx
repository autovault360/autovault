import CustomersPageContent from "@/components/customers/customers-page-content";
import { computeCustomerStats } from "@/lib/customers/server/compute-customer-stats";
import { getCustomers, getSalesReps } from "@/lib/customers/server/get-customers";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams?: Promise<{ add?: string; edit?: string }> | { add?: string; edit?: string };
}) {
  const resolved = searchParams instanceof Promise ? await searchParams : (searchParams ?? {});
  const [customers, stats, salesReps] = await Promise.all([
    getCustomers(),
    computeCustomerStats(),
    getSalesReps(),
  ]);

  return (
    <CustomersPageContent
      customers={customers}
      stats={stats}
      salesReps={salesReps}
      defaultOpen={resolved.add === "true"}
      defaultEditId={resolved.edit}
    />
  );
}
