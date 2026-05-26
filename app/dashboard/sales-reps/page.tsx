import SalesRepsPageContent from "@/components/sales-reps/sales-reps-page-content";
import { getSalesRepsDashboard } from "@/lib/sales-reps/server/get-sales-reps-dashboard";

export default async function SalesRepsPage() {
  const data = await getSalesRepsDashboard("this_month");

  return (
    <SalesRepsPageContent
      initialSalesReps={data.salesReps}
      initialStats={data.stats}
      initialError={data.error}
      initialPeriod="this_month"
    />
  );
}
