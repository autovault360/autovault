import SalesRepsPageContent from "@/components/sales-reps/sales-reps-page-content";
import { computeSalesRepStats } from "@/lib/sales-reps/server/compute-sales-rep-stats";
import { getSalesRepsList } from "@/lib/sales-reps/server/get-sales-reps-list";

export default async function SalesRepsPage() {
  const salesReps = await getSalesRepsList();
  const stats = await computeSalesRepStats(salesReps);

  return <SalesRepsPageContent salesReps={salesReps} stats={stats} />;
}
