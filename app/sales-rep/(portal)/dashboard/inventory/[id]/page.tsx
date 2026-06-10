import { notFound } from "next/navigation";
import SalesRepVehicleDetail from "@/components/sales-rep/dashboard/sales-rep-vehicle-detail";
import { getVehicleDetail } from "@/lib/vehicles/get-vehicle-detail";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SalesRepVehicleDetailPage({ params }: Props) {
  const { id } = await params;
  const vehicle = await getVehicleDetail(id);

  if (!vehicle) {
    notFound();
  }

  return <SalesRepVehicleDetail vehicle={vehicle} />;
}
