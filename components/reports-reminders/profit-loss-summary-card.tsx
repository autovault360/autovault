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
  onOpen?: () => void;
};

export default function ProfitLossSummaryCard({
  rows,
  period = "This Month",
  onOpen,
}: Props) {
  return (
    <ReportCardShell className="flex h-full min-w-0 flex-col" onClick={onOpen}>
      <ReportTitleWithPeriodAndLink
        title="PROFIT & LOSS SUMMARY"
        period={period}
        showLink={false}
        onClick={onOpen}
      />
      <div className="min-h-0 flex-1">
        <ReportMetricRows rows={rows} />
      </div>
      <ReportExportButtonsRow onExport={onOpen} />
    </ReportCardShell>
  );
}
