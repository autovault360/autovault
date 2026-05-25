import { notFound } from "next/navigation";
import AdminHeader from "@/components/layout/AdminHeader";
import ActivityLogCard from "@/components/vehicles/detail/activity-log-card";
import ComparablesCard from "@/components/vehicles/detail/comparables-card";
import NotesCard from "@/components/vehicles/detail/notes-card";
import PricingActionsCard from "@/components/vehicles/detail/pricing-actions-card";
import ReconditioningCard from "@/components/vehicles/detail/reconditioning-card";
import StatusHistoryCard from "@/components/vehicles/detail/status-history-card";
import VehicleDetailHeader from "@/components/vehicles/detail/vehicle-detail-header";
import VehicleFeaturesCard from "@/components/vehicles/detail/vehicle-features-card";
import VehicleGallery from "@/components/vehicles/detail/vehicle-gallery";
import VehicleSummaryCard from "@/components/vehicles/detail/vehicle-summary-card";
import { getVehicleDetail } from "@/lib/vehicles/get-vehicle-detail";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function VehicleDetailPage({ params }: Props) {
  const { id } = await params;
  const vehicle = (await getVehicleDetail(id)) || notFound();

  return (
    <div>
      <AdminHeader />
      <VehicleDetailHeader vehicle={vehicle} />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-5 auto-rows-auto">
        {/* Gallery */}
        <div className="sm:col-span-2 xl:col-span-2">
          <VehicleGallery images={vehicle.images} alt={vehicle.displayTitle} />
        </div>

        {/* Summary */}
        <div className="sm:col-span-2 xl:col-span-2">
          <VehicleSummaryCard vehicle={vehicle} />
        </div>

        {/* Pricing */}
        <div className="sm:col-span-2 xl:col-span-1">
          <PricingActionsCard vehicle={vehicle} />
        </div>

        {/* Features */}
        <div className="sm:col-span-2 xl:col-span-2">
          <VehicleFeaturesCard features={vehicle.features} />
        </div>

        {/* Reconditioning */}
        <div className="sm:col-span-1 xl:col-span-1">
          <ReconditioningCard
            expenses={vehicle.expenses}
            total={vehicle.totalReconditioning}
          />
        </div>

        {/* Status */}
        <div className="sm:col-span-1 xl:col-span-1">
          <StatusHistoryCard vehicle={vehicle} />
        </div>

        {/* Activity */}
        <div className="sm:col-span-2 xl:col-span-1 xl:row-span-2">
          <ActivityLogCard entries={vehicle.activityLog} />
        </div>

        {/* Comparables */}
        <div className="sm:col-span-2 xl:col-span-3">
          <ComparablesCard comparables={vehicle.comparables} />
        </div>

        {/* Notes */}
        <div className="sm:col-span-2 xl:col-span-1">
          <NotesCard notes={vehicle.notes} vehicleId={vehicle.id} />
        </div>
      </div>
    </div>
  );
}
