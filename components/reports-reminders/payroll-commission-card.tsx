"use client";

import {
  ReportCardShell,
  ReportExportButtonsRow,
  ReportSectionLabel,
  ReportTitleWithPeriodAndLink,
} from "./report-card-primitives";

type SummaryRow = { label: string; value: string };

type Props = {
  payroll: SummaryRow[];
  commissions: SummaryRow[];
  period?: string;
};

function SummaryBlock({
  title,
  rows,
}: {
  title: string;
  rows: SummaryRow[];
}) {
  return (
    <div>
      <ReportSectionLabel>{title}</ReportSectionLabel>
      <ul className="space-y-2.5">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex items-center justify-between gap-3 text-[11px]"
          >
            <span className="text-slate-400">{row.label}</span>
            <span className="font-semibold tabular-nums text-slate-100">
              {row.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PayrollCommissionCard({
  payroll,
  commissions,
  period = "This Month",
}: Props) {
  return (
    <ReportCardShell className="flex h-full min-w-0 flex-col">
      <ReportTitleWithPeriodAndLink title="PAYROLL & COMMISSION" period={period} />

      <div className="min-h-0 flex-1 space-y-4 py-1">
        <SummaryBlock title="Payroll Summary" rows={payroll} />
        <SummaryBlock title="Commission Summary" rows={commissions} />
      </div>

      <ReportExportButtonsRow excelOnly centered />
    </ReportCardShell>
  );
}
