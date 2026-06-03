import dynamic from "next/dynamic";
import ReportsPageSkeleton from "./loading";

const ReportsContent = dynamic(
  () => import("@/components/reports-reminders/reports-reminders-page-content"),
  { loading: () => <ReportsPageSkeleton /> },
);

export default function ReportsRemindersPage() {
  return <ReportsContent />;
}
