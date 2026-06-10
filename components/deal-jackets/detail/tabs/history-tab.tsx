"use client";

import type { DealJacketDetail } from "@/lib/deal-jackets/detail-types";
import { DetailTabPanel } from "../detail-primitives";
import ActivityTimeline from "../../activity-timeline";

export default function HistoryTab({ detail }: { detail: DealJacketDetail }) {
  return (
    <DetailTabPanel>
      <ActivityTimeline activities={detail.workflowActivities} />
    </DetailTabPanel>
  );
}
