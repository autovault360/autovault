"use client";

import type { ReportSummaryRow } from "@/lib/reports-reminders/types";
import {
  ReportCardShell,
  ReportMetricRows,
  ReportSummaryFooter,
  ReportSummaryTitle,
} from "./report-card-primitives";

type Props = {
  rows: ReportSummaryRow[];
  period?: string;
};

export default function ReportSummaryCard({ rows, period = "This Month" }: Props) {
  return (
    <ReportCardShell>
      <ReportSummaryTitle period={period} />
      <ReportMetricRows rows={rows} />
      <ReportSummaryFooter />
    </ReportCardShell>
  );
}
