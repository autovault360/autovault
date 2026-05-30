"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import type { VehicleDetail } from "@/lib/vehicles/detail-types";
import AdminHeader from "@/components/layout/AdminHeader";
import VehicleDetailHeader from "@/components/vehicles/detail/vehicle-detail-header";
import VehicleGallery from "@/components/vehicles/detail/vehicle-gallery";
import VehicleSummaryCard from "@/components/vehicles/detail/vehicle-summary-card";
import PricingActionsCard from "@/components/vehicles/detail/pricing-actions-card";
import VehicleFeaturesCard from "@/components/vehicles/detail/vehicle-features-card";
import ReconditioningCard from "@/components/vehicles/detail/reconditioning-card";
import StatusHistoryCard from "@/components/vehicles/detail/status-history-card";
import ActivityLogCard from "@/components/vehicles/detail/activity-log-card";
import ComparablesCard from "@/components/vehicles/detail/comparables-card";
import NotesCard from "@/components/vehicles/detail/notes-card";

export default function VehicleDetailShell({
  vehicle: initialVehicle,
  defaultEdit = false,
}: {
  vehicle: VehicleDetail;
  defaultEdit?: boolean;
}) {
  const pathname = usePathname();
  const [vehicle, setVehicle] = useState(initialVehicle);
  const [editOpen, setEditOpen] = useState(defaultEdit);
  const [triggerUpload, setTriggerUpload] = useState<number | undefined>(undefined);

  useEffect(() => {
    setVehicle(initialVehicle);
  }, [initialVehicle]);

  useEffect(() => {
    setEditOpen(defaultEdit);
  }, [defaultEdit]);

  const handleEditOpenChange = useCallback((open: boolean) => {
    setEditOpen(open);
    if (!open) setTriggerUpload(undefined);
    window.history.replaceState(null, "", open ? "?edit=true" : pathname);
  }, [pathname]);

  const handleUploadClick = useCallback(() => {
    setEditOpen(true);
    setTriggerUpload(Date.now());
  }, []);

  return (
    <div>
      <AdminHeader />
      <VehicleDetailHeader
        vehicle={vehicle}
        editOpen={editOpen}
        onEditOpenChange={handleEditOpenChange}
        onVehicleUpdated={setVehicle}
        photoUploadTrigger={triggerUpload}
      />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-5 auto-rows-auto">
        <div className="sm:col-span-2 xl:col-span-2">
          <VehicleGallery
            images={vehicle.images}
            alt={vehicle.displayTitle}
            onUploadClick={handleUploadClick}
          />
        </div>

        <div className="sm:col-span-2 xl:col-span-2">
          <VehicleSummaryCard vehicle={vehicle} />
        </div>

        <div className="sm:col-span-2 xl:col-span-1">
          <PricingActionsCard vehicle={vehicle} />
        </div>

        <div className="sm:col-span-2 xl:col-span-2">
          <VehicleFeaturesCard features={vehicle.features} />
        </div>

        <div className="sm:col-span-1 xl:col-span-1">
          <ReconditioningCard
            expenses={vehicle.expenses}
            total={vehicle.totalReconditioning}
          />
        </div>

        <div className="sm:col-span-1 xl:col-span-1">
          <StatusHistoryCard vehicle={vehicle} />
        </div>

        <div className="sm:col-span-2 xl:col-span-1 xl:row-span-2">
          <ActivityLogCard entries={vehicle.activityLog} />
        </div>

        <div className="sm:col-span-2 xl:col-span-3">
          <ComparablesCard comparables={vehicle.comparables} />
        </div>

        <div className="sm:col-span-2 xl:col-span-1">
          <NotesCard notes={vehicle.notes} vehicleId={vehicle.id} />
        </div>
      </div>
    </div>
  );
}
