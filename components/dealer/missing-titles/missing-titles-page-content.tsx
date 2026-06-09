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
    <div className="relative min-w-0 overflow-x-hidden">
      <section className="mb-3.5 flex flex-wrap items-center justify-between gap-3 px-0.5">
        <h1 className="text-xl font-bold text-white sm:text-2xl">
          Missing Titles Center
        </h1>
        <div className="flex flex-wrap items-center gap-2">
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
        </div>
      </section>

      <MissingTitlesStatsCards stats={stats} />

      <MissingTitlesTable records={records} locations={locations} />
    </div>
  );
}
