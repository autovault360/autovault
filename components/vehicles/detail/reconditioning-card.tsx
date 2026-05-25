import {
  DetailCard,
  DetailCardHead,
} from "@/components/vehicles/detail/detail-card";
import { DetailRow } from "@/components/vehicles/detail/detail-row";
import { formatCurrency } from "@/lib/vehicles/types";
import type { VehicleExpense } from "@/lib/vehicles/detail-types";

export default function ReconditioningCard({
  expenses,
  total,
}: {
  expenses: VehicleExpense[];
  total: number;
}) {
  return (
    <DetailCard>
      <DetailCardHead
        title="RECONDITIONING & EXPENSES"
        action={
          <button
            type="button"
            className="text-[11px] font-medium text-blue-400 hover:text-blue-300"
          >
            + Add Expense
          </button>
        }
      />
      <div className="space-y-0.5">
        {expenses.map((e) => (
          <DetailRow
            key={e.label}
            label={e.label}
            value={formatCurrency(e.amount)}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-2.5">
        <span className="text-[11.5px] font-semibold text-white">
          Total Reconditioning
        </span>
        <span className="text-[11.5px] font-bold text-white">
          {formatCurrency(total)}
        </span>
      </div>
    </DetailCard>
  );
}
