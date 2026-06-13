import { notFound } from "next/navigation";
import VehicleDetailShell from "@/components/vehicles/detail/vehicle-detail-shell";
import { getVehicleDetail } from "@/lib/vehicles/get-vehicle-detail";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function DealerVehicleDetailPage({ params }: Props) {
  const { id } = await params;
  const vehicle = (await getVehicleDetail(id)) || notFound();

  return <VehicleDetailShell vehicle={vehicle} backHref="/dealer/inventory" />;
}
