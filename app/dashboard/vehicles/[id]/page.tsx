import { notFound } from "next/navigation";
import VehicleDetailShell from "@/components/vehicles/detail/vehicle-detail-shell";
import { getVehicleDetail } from "@/lib/vehicles/get-vehicle-detail";

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ edit?: string }> | { edit?: string };
};

export default async function VehicleDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const resolved = searchParams instanceof Promise ? await searchParams : (searchParams ?? {});
  const vehicle = (await getVehicleDetail(id)) || notFound();

  return <VehicleDetailShell vehicle={vehicle} defaultEdit={resolved.edit === "true"} />;
}
