import { formatCurrency } from "@/lib/deal-jackets/types";
import type { DealJacketDetail } from "@/lib/deal-jackets/detail-types";

type Segment = { color: string; value: number };

export default function ExpenseDonut({
  center,
  label,
  segments,
  breakdown,
}: {
  center: string;
  label: string;
  segments: Segment[];
  breakdown: DealJacketDetail["expenseBreakdown"];
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let offset = 0;
  const r = 38;
  const c = 2 * Math.PI * r;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative mx-auto h-[120px] w-[120px] shrink-0 sm:mx-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={r / 2}
            fill="none"
            stroke="#1e293b"
            strokeWidth="12"
          />
          {segments.map((seg, i) => {
            const len = (seg.value / total) * c;
            const dash = `${len} ${c}`;
            const el = (
              <circle
                key={i}
                cx="50"
                cy="50"
                r={r / 2}
                fill="none"
                stroke={seg.color}
                strokeWidth="12"
                strokeDasharray={dash}
                strokeDashoffset={-offset}
              />
            );
            offset += len;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-2 text-center">
          <div className="text-[12px] font-bold text-white">{center}</div>
          <div className="text-[9px] text-slate-500">{label}</div>
        </div>
      </div>

      <ul className="min-w-0 flex-1 space-y-2">
        {breakdown.map((item) => (
          <li
            key={item.label}
            className="flex items-center gap-2 text-[10.5px]"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="min-w-0 flex-1 truncate text-slate-400">
              {item.label}
            </span>
            <span className="shrink-0 font-semibold text-slate-200">
              {formatCurrency(item.amount)}
            </span>
            <span className="w-9 shrink-0 text-right text-slate-500">
              {item.percent.toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
