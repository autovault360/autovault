import { getStateTaxReport } from "@/lib/state-tax/server/get-state-tax-report";
import StateTaxPageContent from "@/components/state-tax/state-tax-page-content";

export default async function StateTaxPage() {
  const report = await getStateTaxReport();
  return <StateTaxPageContent report={report} />;
}
