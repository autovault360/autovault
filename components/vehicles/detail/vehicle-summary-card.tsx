import {
  DetailCard,
  DetailCardHead,
} from "@/components/vehicles/detail/detail-card";
import { DetailRow } from "@/components/vehicles/detail/detail-row";
import { formatField, formatMileage } from "@/lib/vehicles/types";
import type { VehicleDetail } from "@/lib/vehicles/detail-types";

export default function VehicleSummaryCard({
  vehicle,
}: {
  vehicle: VehicleDetail;
}) {
  const leftFields = [
    { label: "Year", value: vehicle.year },
    { label: "Make", value: formatField("make", vehicle.make) },
    {
      label: "Model",
      value: formatField("model", vehicle.model, vehicle.make),
    },
    { label: "Trim", value: vehicle.trim },
    {
      label: "Body Style",
      value: formatField("bodyStyle", vehicle.bodyStyle),
    },
    {
      label: "Exterior Color",
      value: formatField("exteriorColor", vehicle.exteriorColor),
    },
    {
      label: "Interior Color",
      value: formatField("interiorColor", vehicle.interiorColor),
    },
    { label: "Doors", value: vehicle.doors },
    {
      label: "Drivetrain",
      value: formatField("drivetrain", vehicle.drivetrain),
    },
  ];

  const rightFields = [
    { label: "Mileage", value: formatMileage(vehicle.mileage) },
    { label: "Engine", value: vehicle.engine },
    { label: "Transmission", value: vehicle.transmission },
    { label: "Fuel Type", value: formatField("fuelType", vehicle.fuelType) },
    { label: "MPG", value: vehicle.mpg },
    { label: "VIN", value: vehicle.vin },
    { label: "Stock #", value: vehicle.stockNumber },
    {
      label: "Lot Location",
      value: formatField("location", vehicle.location),
    },
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
