import {
  formatCurrencyDecimal,
  formatDisplayDate,
  type CustomerProfileSummary,
} from "@/lib/customers/types";
import { cn } from "@/lib/utils";

const METRICS: {
  key: keyof CustomerProfileSummary | "customerSince";
  label: string;
  format: (
    summary: CustomerProfileSummary,
    customerSince: string,
  ) => string;
}[] = [
  {
    key: "totalVehiclesPurchased",
    label: "Total Vehicles Purchased",
    format: (s) => String(s.totalVehiclesPurchased),
  },
  {
    key: "totalSpent",
    label: "Total Spent",
    format: (s) => formatCurrencyDecimal(s.totalSpent),
  },
  {
    key: "lastPurchaseDate",
    label: "Last Purchase Date",
    format: (s) => formatDisplayDate(s.lastPurchaseDate),
  },
  {
    key: "customerSince",
    label: "Customer Since",
    format: (_s, since) => formatDisplayDate(since),
  },
];

export default function CustomerHeroMetrics({
  summary,
  customerSince,
  className,
}: {
  summary: CustomerProfileSummary;
  customerSince: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4",
        className,
      )}
    >
      {METRICS.map((metric) => (
        <div
          key={metric.label}
          className="flex flex-col rounded-md border border-slate-800/80 bg-[var(--bg-primary)] px-3 py-2.5"
        >
          <span className="text-[10px] font-medium text-slate-500">
            {metric.label}
          </span>
          <span className="mt-1 text-[15px] font-bold tracking-tight text-white">
            {metric.format(summary, customerSince)}
          </span>
        </div>
      ))}
    </div>
  );
}
