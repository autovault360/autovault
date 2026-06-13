"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatField, getStatusStyle } from "@/lib/vehicles/types";
import type { VehicleDetail } from "@/lib/vehicles/detail-types";
import EditVehicleModal from "@/components/vehicles/detail/edit-vehicle-modal";

export default function VehicleDetailHeader({
  vehicle,
  editOpen: externalEditOpen,
  onEditOpenChange,
  onVehicleUpdated,
  photoUploadTrigger,
  backHref = "/dashboard/vehicles",
}: {
  vehicle: VehicleDetail;
  editOpen?: boolean;
  onEditOpenChange?: (open: boolean) => void;
  onVehicleUpdated?: (vehicle: VehicleDetail) => void;
  photoUploadTrigger?: number | undefined;
  backHref?: string;
}) {
  const [internalEditOpen, setInternalEditOpen] = useState(false);
  const editOpen = externalEditOpen ?? internalEditOpen;
  const setEditOpen = onEditOpenChange ?? setInternalEditOpen;

  return (
    <>
      <section className="mb-3.5 space-y-2.5">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-blue-400 transition hover:text-blue-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Inventory
        </Link>

        <div className="flex flex-col md:flex-row items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-[0.12em] text-white">
                {vehicle.displayTitle}
              </h1>
              <span
                className={cn(
                  "rounded-md px-2 py-0.5 text-[10px] font-semibold",
                  getStatusStyle(vehicle.status),
                )}
              >
                {vehicle.status}
              </span>
              <span className="rounded-md bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
                {formatField("location", vehicle.location)}
              </span>
            </div>
            <p className="mt-1 text-[12.5px] text-slate-500">
              Stock #: {vehicle.stockNumber}
              <span className="mx-2 text-slate-700">..</span>
              VIN: {vehicle.vin}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-card px-3 py-2 text-[12.5px] text-slate-300 transition hover:border-slate-600"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Vehicle
            </button>
            <button
              type="button"
              onClick={() => window.open(`/dashboard/vehicles/${vehicle.id}/print`, "_blank")}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-card px-3 py-2 text-[12.5px] text-slate-300 transition hover:border-slate-600"
            >
              <Printer className="h-3.5 w-3.5" />
              Print Info
            </button>
          </div>
        </div>
      </section>

      <EditVehicleModal
        vehicle={vehicle}
        open={editOpen}
        onOpenChange={setEditOpen}
        onVehicleUpdated={onVehicleUpdated}
        triggerUpload={photoUploadTrigger}
      />
    </>
  );
}
