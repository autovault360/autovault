"use client";

import Image from "next/image";
import Link from "next/link";
import {
  DetailCard,
  DetailCardHead,
} from "@/components/vehicles/detail/detail-card";
import { Button } from "@/components/ui/button";
import type { CustomerDetail } from "@/lib/customers/types";
import {
  formatCurrencyDecimal,
  formatDisplayDate,
} from "@/lib/customers/types";

export default function ProfileVehiclesTab({
  customer,
}: {
  customer: CustomerDetail;
}) {
  if (customer.vehicles.length === 0) {
    return (
      <p className="py-8 text-center text-[12px] text-slate-500">
        No vehicles purchased yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {customer.vehicles.map((v) => (
        <DetailCard key={v.vehicleId}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative h-[72px] w-[110px] shrink-0 overflow-hidden rounded-md border border-slate-800 bg-[var(--bg-primary)]">
              {v.imageUrl ? (
                <Image
                  src={v.imageUrl}
                  alt={v.vehicleName}
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
              <DetailCardHead title={v.vehicleName} />
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-400 sm:grid-cols-3">
                <span>
                  Stock #:{" "}
                  <span className="text-orange-400">{v.stockNumber}</span>
                </span>
                <span className="col-span-2 sm:col-span-1">
                  VIN:{" "}
                  <span className="font-mono text-slate-200">{v.vin}</span>
                </span>
                <span>
                  Sold:{" "}
                  <span className="text-slate-200">
                    {formatDisplayDate(v.saleDate)}
                  </span>
                </span>
                <span>
                  Price:{" "}
                  <span className="font-semibold text-white">
                    {formatCurrencyDecimal(v.soldPrice)}
                  </span>
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-7 border-slate-600 bg-transparent text-[10.5px] text-blue-400"
                >
                  <Link href={`/dashboard/vehicles/${v.vehicleId}`}>
                    View Vehicle
                  </Link>
                </Button>
                {v.dealJacketId && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-7 border-slate-600 bg-transparent text-[10.5px] text-blue-400"
                  >
                    <Link href={`/dashboard/deal-jackets/${v.dealJacketId}`}>
                      View Jacket
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DetailCard>
      ))}
    </div>
  );
}
