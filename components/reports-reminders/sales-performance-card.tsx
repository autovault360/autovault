"use client";

import type { SalesRepRow } from "@/lib/reports-reminders/types";
import {
  ReportCardHeaderWithLink,
  ReportCardShell,
  ReportViewMore,
} from "./report-card-primitives";

type Props = {
  rows: SalesRepRow[];
  onOpen?: () => void;
};

export default function SalesPerformanceCard({ rows, onOpen }: Props) {
  return (
    <ReportCardShell className="flex flex-col" onClick={onOpen}>
      <ReportCardHeaderWithLink title="SALES PERFORMANCE" onClick={onOpen} />
      <div className="min-h-0 flex-1 overflow-x-auto">
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] font-medium uppercase tracking-wide text-slate-500">
              <th className="w-6 pb-2 text-left" />
              <th className="pb-2 pr-2 text-left">Sales Rep</th>
              <th className="pb-2 pr-2 text-right">Cars Sold</th>
              <th className="pb-2 pr-2 text-right">Gross Profit</th>
              <th className="pb-2 pr-2 text-right">Commission</th>
              <th className="pb-2 text-right">Closing Ratio</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.rank}
                className="border-b border-slate-800/50 last:border-0"
              >
                <td className="py-2.5 pr-1 text-slate-500 tabular-nums">
                  {row.rank}
                </td>
                <td className="py-2.5 pr-2 font-medium text-slate-200">
                  {row.name}
                </td>
                <td className="py-2.5 pr-2 text-right text-slate-200 tabular-nums">
                  {row.carsSold}
                </td>
                <td className="py-2.5 pr-2 text-right text-slate-200 tabular-nums">
                  {row.grossProfit}
                </td>
                <td className="py-2.5 pr-2 text-right text-slate-200 tabular-nums">
                  {row.commission}
                </td>
                <td className="py-2.5 text-right text-slate-200 tabular-nums">
                  {row.closingRatio}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ReportViewMore label="View Leaderboard" onClick={onOpen} />
    </ReportCardShell>
  );
}
