import RemindersPageContent from "@/components/reminders/reminders-page-content";
import { getRemindersReport } from "@/lib/reminders/server/get-reminders-report";

export default async function RemindersPage() {
  const initialReport = await getRemindersReport();

  return <RemindersPageContent initialReport={initialReport} />;
}
