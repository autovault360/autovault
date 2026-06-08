"use client";

import { CardShell } from "@/components/dashboard/card-shell";
import { formatPayrollCurrency, type CommissionSegment } from "@/lib/payroll/types";

function Dot({ color }: { color: string }) {
  return (
    <span
      className="mr-1.5 inline-block h-2 w-2 shrink-0 rounded-full align-middle"
      style={{ backgroundColor: color }}
    />
  );
}

function CommissionDonut({
  segments,
  center,
  label,
}: {
  segments: CommissionSegment[];
  center: string;
  label: string;
}) {
  const total = segments.reduce((a, b) => a + b.percent, 0);
  const C = 2 * Math.PI * 46;
  let offset = 0;

  return (
    <div className="relative flex flex-col items-center shrink-0">
      <svg viewBox="0 0 120 120" className="h-28 w-28">
        <circle cx="60" cy="60" r="46" fill="none" stroke="#1f2a3d" strokeWidth="18" />
        {segments.map((s, i) => {
          const len = (s.percent / total) * C;
          const el = (
            <circle
              key={i}
              cx="60"
              cy="60"
              r="46"
              fill="none"
              stroke={s.color}
              strokeWidth="18"
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 60 60)"
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute top-9 text-center">
        <div className="text-[13px] font-bold text-white">{center}</div>
        <div className="text-[9px] text-slate-500">{label}</div>
      </div>
    </div>
  );
}

export default function PayrollCommissionBreakdown({
  segments,
}: {
  segments: CommissionSegment[];
}) {
  const total = segments.reduce((sum, s) => sum + s.amount, 0);

  return (
    <CardShell className="mb-3.5">
      <div className="mb-3 text-[11px] font-bold tracking-[0.14em] text-slate-500">
        COMMISSION BREAKDOWN
      </div>
      <div className="flex items-center gap-3">
        <CommissionDonut
          segments={segments}
          center={formatPayrollCurrency(total)}
          label="Total Commissions"
        />
        <ul className="min-w-0 flex-1 space-y-1.5 text-[10px]">
          {segments.map((seg) => (
            <li key={seg.name} className="flex items-center">
              <Dot color={seg.color} />
              <span className="truncate text-slate-400">{seg.name}</span>
              <span className="ml-auto pl-2 font-mono tabular-nums text-slate-300">
                {formatPayrollCurrency(seg.amount)}
              </span>
              <span className="ml-1.5 w-8 text-right text-slate-500">
                {seg.percent}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </CardShell>
  );
}
