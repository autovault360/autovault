import {
  Camera,
  Bluetooth,
  Navigation,
  Flame,
  Sun,
  Armchair,
  Smartphone,
  Key,
  Radio,
  Eye,
  AlertTriangle,
  Gauge,
  Radar,
  Volume2,
  Users,
  Truck,
  GripHorizontal,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DetailCard,
  DetailCardHead,
} from "@/components/vehicles/detail/detail-card";
import type { VehicleFeature } from "@/lib/vehicles/detail-types";

const iconMap: Record<string, LucideIcon> = {
  camera: Camera,
  bluetooth: Bluetooth,
  navigation: Navigation,
  flame: Flame,
  sun: Sun,
  armchair: Armchair,
  smartphone: Smartphone,
  key: Key,
  radio: Radio,
  eye: Eye,
  "alert-triangle": AlertTriangle,
  gauge: Gauge,
  radar: Radar,
  "volume-2": Volume2,
  users: Users,
  truck: Truck,
  "grip-horizontal": GripHorizontal,
};

function FeatureItem({ feature }: { feature: VehicleFeature }) {
  const Icon = iconMap[feature.icon] ?? Camera;
  const isNo = feature.value.toLowerCase() === "no";
  return (
    <div className="flex items-center gap-2 py-1.5">
      <Icon className="h-3.5 w-3.5 shrink-0 text-slate-500" />
      <span className="min-w-0 flex-1 truncate text-[11px] text-slate-400">
        {feature.label}
      </span>
      <span
        className={cn(
          "shrink-0 text-[11px] font-medium",
          isNo ? "text-slate-500" : "text-white",
        )}
      >
        {feature.value}
      </span>
    </div>
  );
}

export default function VehicleFeaturesCard({
  features,
}: {
  features: VehicleFeature[];
}) {
  return (
    <DetailCard>
      <DetailCardHead title="VEHICLE DETAILS" />
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        {features.map((f) => (
          <FeatureItem key={f.label} feature={f} />
        ))}
      </div>
    </DetailCard>
  );
}
