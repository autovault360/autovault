import type { Metadata } from "next";
import MissingTitlesPageContent from "@/components/dealer/missing-titles/missing-titles-page-content";
import { getMissingTitlesDashboard } from "@/lib/dealer/missing-titles/server/get-missing-titles-dashboard";

export const metadata: Metadata = {
  title: "Missing Titles Center | Dealer Dashboard",
  description: "Track vehicles with missing titles, aging buckets, and follow-up status.",
};

export default async function MissingTitlesPage() {
  const { records, stats, locations } = await getMissingTitlesDashboard();

  return (
    <MissingTitlesPageContent
      records={records}
      stats={stats}
      locations={locations}
    />
  );
}
