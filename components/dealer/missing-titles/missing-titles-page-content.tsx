"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import DealerPageShell from "@/components/dealer/layout/dealer-page-shell";
import AddMissingTitleTrigger from "./add-missing-title-trigger";
import MissingTitlesStatsCards from "./missing-titles-stats-cards";
import MissingTitlesTable from "./missing-titles-table";
import type { MissingTitlesDashboardData } from "@/lib/dealer/missing-titles/types";

type Props = Pick<
  MissingTitlesDashboardData,
  "records" | "stats" | "locations"
>;

export default function MissingTitlesPageContent({
  records,
  stats,
  locations,
}: Props) {
  const [headerLocation, setHeaderLocation] = useState("all");

  const locationOptions = locations.filter(
    (location) => location !== "All Locations",
  );

  const handleAddRecord = () => {
    toast.info("Add missing title record flow will connect to the service layer.");
  };

  return (
    <DealerPageShell
      title="Missing Titles Center"
      headerExtra={
        <>
          <Select value={headerLocation} onValueChange={setHeaderLocation}>
            <SelectTrigger
              theme="dark"
              className={cn("h-9 w-full min-w-[140px] text-[11.5px] sm:w-[160px]")}
            >
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent theme="dark">
              <SelectItem value="all" className="text-[11.5px]">
                All Locations
              </SelectItem>
              {locationOptions.map((location) => (
                <SelectItem
                  key={location}
                  value={location}
                  className="text-[11.5px]"
                >
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <AddMissingTitleTrigger onClick={handleAddRecord} />
        </>
      }
    >
      <MissingTitlesStatsCards stats={stats} />

      <MissingTitlesTable records={records} locations={locations} />
    </DealerPageShell>
  );
}
