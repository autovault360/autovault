import { Suspense } from "react";
import DealerSoldVehiclesPageContent from "@/components/dealer/dashboard/sold-vehicles/dealer-sold-vehicles-page-content";
import SoldVehiclesCenterSkeleton from "@/components/dealer/dashboard/sold-vehicles/sold-vehicles-center-skeleton";

export default function DealerSoldVehiclesPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-w-0 max-w-full overflow-x-hidden bg-[#060b13] text-slate-100">
          <SoldVehiclesCenterSkeleton />
        </div>
      }
    >
      <DealerSoldVehiclesPageContent />
    </Suspense>
  );
}
