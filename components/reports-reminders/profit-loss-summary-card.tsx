"use client";

import type { ReportSummaryRow } from "@/lib/reports-reminders/types";
import {
  ReportCardShell,
  ReportExportButtonsRow,
  ReportMetricRows,
  ReportTitleWithPeriodAndLink,
} from "./report-card-primitives";

type Props = {
  rows: ReportSummaryRow[];
  period?: string;
};

export default function ProfitLossSummaryCard({
  rows,
  period = "This Month",
}: Props) {
  return (
    <ReportCardShell className="flex flex-col">
      <ReportTitleWithPeriodAndLink
        title="PROFIT & LOSS SUMMARY"
        period={period}
        showLink={false}
      />
      <div className="min-h-0 flex-1">
        <ReportMetricRows rows={rows} />
      </div>
      <ReportExportButtonsRow />
    </ReportCardShell>
  );
}
