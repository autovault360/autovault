"use client";

import { useMemo } from "react";
import { formatCurrency } from "@/lib/expenses/types";
import type { ExpenseBreakdownBucket } from "@/lib/expenses/expense-page-calculations";

type Props = {
  buckets: ExpenseBreakdownBucket[];
  total: number;
};

const R = 70;
const CX = 100;
const CY = 100;
const C = 2 * Math.PI * R;

export default function ExpensesBreakdownCard({ buckets, total }: Props) {
  const gap = total > 0 ? 1.4 : 0;

  const activeBuckets = useMemo(
    () => buckets.filter((bucket) => bucket.amount > 0),
    [buckets],
  );

  const donutSegments = useMemo(() => {
    let offset = 0;
    return activeBuckets.map((bucket) => {
      const frac = total > 0 ? bucket.amount / total : 0;
      const len = Math.max(0, frac * C - gap);
      const segment = { bucket, len, offset };
      offset += frac * C;
      return segment;
    });
  }, [activeBuckets, total, gap]);

  return (
    <section className="mb-[22px]">
      <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[16px] font-extrabold text-white">Where the Money Goes</h2>
        <p className="text-[12px] text-slate-500">
          Biggest expense categories by total spend
        </p>
      </div>

      <div className="relative flex flex-col gap-8 overflow-hidden rounded-[14px] border border-slate-800 bg-card px-[26px] py-[22px] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-orange-500 after:content-[''] lg:flex-row lg:items-center">
        <div className="relative mx-auto h-[186px] w-[186px] shrink-0 lg:mx-0">
          <svg
            viewBox="0 0 200 200"
            className="h-full w-full"
            role="img"
            aria-label="Expense breakdown by category"
          >
            <g transform={`rotate(-90 ${CX} ${CY})`}>
              <circle
                cx={CX}
                cy={CY}
                r={R}
                fill="none"
                stroke="rgb(30 41 59)"
                strokeWidth={26}
              />
              {donutSegments.map(({ bucket, len, offset }) => (
                <circle
                  key={bucket.key}
                  cx={CX}
                  cy={CY}
                  r={R}
                  fill="none"
                  stroke={bucket.color}
                  strokeWidth={26}
                  strokeDasharray={`${len} ${C - len}`}
                  strokeDashoffset={-offset}
                  aria-label={`${bucket.key}: ${formatCurrency(bucket.amount)} (${bucket.percent}%)`}
                />
              ))}
            </g>
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-mono text-[20px] font-extrabold tabular-nums text-white">
              {formatCurrency(total)}
            </div>
            <div className="mt-[5px] text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">
              Total Spend
            </div>
          </div>
        </div>

        {activeBuckets.length > 0 ? (
          <div className="grid min-w-[300px] flex-1 grid-cols-1 gap-x-[30px] sm:grid-cols-2 xl:grid-cols-[repeat(auto-fit,minmax(210px,1fr))]">
            {activeBuckets.map((bucket) => (
              <div
                key={bucket.key}
                className="flex items-center gap-2 border-b border-white/5 py-[7px]"
              >
                <span
                  className="h-[9px] w-[9px] shrink-0 rounded-[3px]"
                  style={{ backgroundColor: bucket.color }}
                />
                <span className="min-w-0 truncate text-[12.5px] font-semibold text-slate-200">
                  {bucket.key}
                </span>
                <span className="ml-auto font-mono text-[12.5px] font-bold tabular-nums text-white">
                  {formatCurrency(bucket.amount)}
                </span>
                <span className="min-w-[40px] text-right font-mono text-[11px] tabular-nums text-slate-500">
                  {bucket.percent}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="flex-1 text-[13px] text-slate-500">
            No category spend recorded for this period.
          </p>
        )}
      </div>
    </section>
  );
}
