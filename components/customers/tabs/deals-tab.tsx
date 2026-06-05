"use client";

import {
  formatCurrency,
  formatDisplayDate,
  type CustomerDetail,
} from "@/lib/customers/types";

export default function DealsTab({ customer }: { customer: CustomerDetail }) {
  if (customer.deals.length === 0) {
    return (
      <p className="py-6 text-center text-[11.5px] text-slate-500">
        No deals recorded for this customer yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {customer.deals.map((deal) => (
        <div
          key={deal.id}
          className="rounded-sm border border-slate-700 bg-[#0e1626]/50 p-3"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[12.5px] font-medium text-white">
                {deal.vehicleName}
              </div>
              <div className="mt-0.5 text-[10.5px] text-slate-500">
                Stock #{deal.stockNumber} .. {formatDisplayDate(deal.saleDate)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[12.5px] font-semibold text-white">
                {formatCurrency(deal.totalCollected)}
              </div>
              <div className="text-[10.5px] text-emerald-400">
                +{formatCurrency(deal.grossProfit)} gross
              </div>
            </div>
          </div>
          {deal.notes && (
            <p className="mt-2 text-[11px] text-slate-400">{deal.notes}</p>
          )}
        </div>
      ))}
    </div>
  );
}
