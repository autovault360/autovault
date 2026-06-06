import dynamic from "next/dynamic";
import { getReportsRemindersData } from "@/lib/reports-reminders/server/get-reports-reminders-data";
import ReportsPageSkeleton from "./loading";

const ReportsContent = dynamic(
  () => import("@/components/reports-reminders/reports-reminders-page-content"),
  { loading: () => <ReportsPageSkeleton /> },
);

export default async function ReportsRemindersPage() {
  const { report, reminders } = await getReportsRemindersData();
  return <ReportsContent report={report} reminders={reminders} />;
}
