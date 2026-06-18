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
  onOpen?: () => void;
};

export default function ReportSummaryCard({ rows, period = "This Month", onOpen }: Props) {
  return (
    <ReportCardShell onClick={onOpen}>
      <ReportSummaryTitle period={period} />
      <ReportMetricRows rows={rows} />
      <ReportSummaryFooter onOpen={onOpen} />
    </ReportCardShell>
  );
}
