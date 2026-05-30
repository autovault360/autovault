import SalesRepsPageContent from "@/components/sales-reps/sales-reps-page-content";
import { getSalesRepsDashboard } from "@/lib/sales-reps/server/get-sales-reps-dashboard";

export default async function SalesRepsPage({
  searchParams,
}: {
  searchParams?: Promise<{ add?: string }> | { add?: string };
}) {
  const resolved = searchParams instanceof Promise ? await searchParams : (searchParams ?? {});
  const data = await getSalesRepsDashboard("this_month");

  return (
    <SalesRepsPageContent
      salesReps={data.salesReps}
      stats={data.stats}
      loadError={data.error}
      defaultOpen={resolved.add === "true"}
    />
  );
}
