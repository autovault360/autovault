"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { VehicleDetail } from "@/lib/vehicles/detail-types";
import VehicleGallery from "@/components/vehicles/detail/vehicle-gallery";
import VehicleSummaryCard from "@/components/vehicles/detail/vehicle-summary-card";
import StatusHistoryCard from "@/components/vehicles/detail/status-history-card";
import { getStatusStyle } from "@/lib/vehicles/types";
import { cn } from "@/lib/utils";

export default function SalesRepVehicleDetail({
  vehicle,
}: {
  vehicle: VehicleDetail;
}) {
  return (
    <div>
      <section className="mb-3.5 space-y-2.5">
        <Link
          href="/sales-rep/dashboard/inventory"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-blue-400 transition hover:text-blue-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Inventory
        </Link>

        <div className="flex flex-col md:flex-row items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold text-white md:text-2xl">
              {vehicle.displayTitle}
            </h1>
            <p className="mt-0.5 text-[12.5px] text-slate-500">
              Stock #{vehicle.stockNumber} &middot; VIN: {vehicle.vin}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span
              className={cn(
                "rounded-md px-2.5 py-1 text-[11px] font-semibold",
                getStatusStyle(vehicle.status),
              )}
            >
              {vehicle.status}
            </span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-5 auto-rows-auto">
        <div className="sm:col-span-2 xl:col-span-2">
          <VehicleGallery
            images={vehicle.images}
            alt={vehicle.displayTitle}
          />
        </div>

        <div className="sm:col-span-2 xl:col-span-2">
          <VehicleSummaryCard vehicle={vehicle} />
        </div>

        <div className="sm:col-span-2 xl:col-span-1">
          <StatusHistoryCard vehicle={vehicle} />
        </div>
      </div>
    </div>
  );
}
