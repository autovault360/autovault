import SalesRepSoldVehiclesContent from "@/components/sales-rep/sold-vehicles/sales-rep-sold-vehicles-content";
import { getSalesRepSoldVehicles } from "@/lib/sales-rep/sold-vehicles/server/get-sold-vehicles";

export default async function SalesRepMySoldVehiclesPage() {
  const { vehicles } = await getSalesRepSoldVehicles();
  return (
    <SalesRepSoldVehiclesContent vehicles={vehicles} />
  );
}
