"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  formatCurrencyDecimal,
  formatDisplayDate,
  type CustomerDetail,
} from "@/lib/customers/types";

export default function ProfileDealsTab({
  customer,
}: {
  customer: CustomerDetail;
}) {
  if (customer.deals.length === 0) {
    return (
      <p className="py-8 text-center text-[12px] text-slate-500">
        No deals recorded for this customer yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {customer.deals.map((deal) => (
        <div
          key={deal.id}
          className="flex flex-col gap-3 rounded-md border border-slate-700/80 bg-[#0b121f]/40 p-4 sm:flex-row sm:items-start"
        >
          <div className="relative h-[72px] w-[110px] shrink-0 overflow-hidden rounded-md border border-slate-800 bg-[var(--bg-primary)]">
            {deal.imageUrl ? (
              <Image
                src={deal.imageUrl}
                alt={deal.vehicleName}
                fill
                className="object-cover"
                sizes="110px"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[10px] text-slate-600">
                No image
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-[14px] font-semibold text-white">
                  {deal.vehicleName}
                </h3>
                {deal.jacketNumber && (
                  <p className="mt-0.5 text-[10.5px] text-slate-500">
                    Jacket #{deal.jacketNumber}
                  </p>
                )}
              </div>
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[9.5px] font-semibold text-emerald-400">
                Sold
              </span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-400 md:grid-cols-3">
              <span>
                Stock #:{" "}
                <span className="text-slate-200">{deal.stockNumber}</span>
              </span>
              <span className="col-span-2 md:col-span-1">
                VIN:{" "}
                <span className="font-mono text-slate-200">{deal.vin}</span>
              </span>
              <span>
                Sold Date:{" "}
                <span className="text-slate-200">
                  {formatDisplayDate(deal.saleDate)}
                </span>
              </span>
              <span>
                Sold Price:{" "}
                <span className="text-slate-200">
                  {formatCurrencyDecimal(deal.soldPrice)}
                </span>
              </span>
              <span>
                Sales Rep:{" "}
                <span className="text-slate-200">{deal.salesRepName}</span>
              </span>
            </div>
            {deal.notes && (
              <p className="mt-2 text-[11px] text-slate-400">{deal.notes}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-7 border-slate-600 bg-transparent text-[10.5px] text-blue-400"
              >
                <Link href={`/dashboard/vehicles/${deal.vehicleId}`}>
                  View Vehicle
                </Link>
              </Button>
              {deal.dealJacketId && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-7 border-slate-600 bg-transparent text-[10.5px] text-blue-400"
                >
                  <Link href={`/dashboard/deal-jackets/${deal.dealJacketId}`}>
                    View Jacket
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
