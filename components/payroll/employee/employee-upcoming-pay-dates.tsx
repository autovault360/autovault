import { DetailCard, DetailCardHead } from "@/components/vehicles/detail/detail-card";
import { formatPayrollCurrency, type EmployeeUpcomingPayDate } from "@/lib/payroll/types";

export default function EmployeeUpcomingPayDates({
  dates,
}: {
  dates: EmployeeUpcomingPayDate[];
}) {
  return (
    <DetailCard className="mb-2 bg-card/60 border-slate-800/80 h-auto">
      <DetailCardHead title="UPCOMING PAY DATES" />
      <ul className="space-y-2">
        {dates.map((item) => (
          <li key={item.id} className="flex gap-2">
            <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-[11px] tabular-nums text-slate-300">{item.date}</span>
                <span className="font-mono text-[11px] tabular-nums text-emerald-400">{formatPayrollCurrency(item.estimatedAmount)}</span>
              </div>
              <div className="text-[10px] text-slate-400">{item.label}</div>
              <div className="text-[9.5px] text-slate-500">in {item.daysUntil} days</div>
            </div>
          </li>
        ))}
      </ul>
    </DetailCard>
  );
}
