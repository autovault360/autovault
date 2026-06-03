import dynamic from "next/dynamic";
import { getRemindersReport } from "@/lib/reminders/server/get-reminders-report";
import RemindersPageSkeleton from "./loading";

const Content = dynamic(
  () => import("@/components/reminders/reminders-page-content"),
  { loading: () => <RemindersPageSkeleton /> },
);

export default async function RemindersPage() {
  const initialReport = await getRemindersReport();

  return <Content initialReport={initialReport} />;
}
