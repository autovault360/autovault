import StateTaxPageContent from "@/components/state-tax/state-tax-page-content";
import { getStateTaxReport } from "@/lib/state-tax/server/get-state-tax-report";

export default async function StateTaxPage() {
  const report = await getStateTaxReport();
  return <StateTaxPageContent report={report} />;
}
