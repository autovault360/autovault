import {
  DetailCard,
  DetailCardHead,
} from "@/components/vehicles/detail/detail-card";
import { DetailRow } from "@/components/vehicles/detail/detail-row";
import { formatMileage } from "@/lib/vehicles/types";
import type { VehicleDetail } from "@/lib/vehicles/detail-types";

export default function VehicleSummaryCard({
  vehicle,
}: {
  vehicle: VehicleDetail;
}) {
  const leftFields = [
    { label: "Year", value: vehicle.year },
    { label: "Make", value: vehicle.make },
    { label: "Model", value: vehicle.model },
    { label: "Trim", value: vehicle.trim },
    { label: "Body Style", value: vehicle.bodyStyle },
    { label: "Exterior Color", value: vehicle.exteriorColor },
    { label: "Interior Color", value: vehicle.interiorColor },
    { label: "Doors", value: vehicle.doors },
    { label: "Drivetrain", value: vehicle.drivetrain },
  ];

  const rightFields = [
    { label: "Mileage", value: formatMileage(vehicle.mileage) },
    { label: "Engine", value: vehicle.engine },
    { label: "Transmission", value: vehicle.transmission },
    { label: "Fuel Type", value: vehicle.fuelType },
    { label: "MPG", value: vehicle.mpg },
    { label: "VIN", value: vehicle.vin },
    { label: "Stock #", value: vehicle.stockNumber },
    { label: "Lot Location", value: vehicle.location },
    { label: "Date Added", value: vehicle.dateAcquired },
  ];

  return (
    <DetailCard>
      <DetailCardHead title="VEHICLE SUMMARY" />
      <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
        <div className="divide-y divide-slate-800/60">
          {leftFields.map((f) => (
            <DetailRow key={f.label} label={f.label} value={f.value} />
          ))}
        </div>
        <div className="divide-y divide-slate-800/60">
          {rightFields.map((f) => (
            <DetailRow key={f.label} label={f.label} value={f.value} />
          ))}
        </div>
      </div>
    </DetailCard>
  );
}
