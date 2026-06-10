import SalesRepSoldVehiclesContent from "@/components/sales-rep/sold-vehicles/sales-rep-sold-vehicles-content";
import { SALES_REP_SOLD_VEHICLES_MOCK } from "@/lib/sales-rep/sold-vehicles/mock-data";

export default function SalesRepMySoldVehiclesPage() {
  return (
    <SalesRepSoldVehiclesContent vehicles={SALES_REP_SOLD_VEHICLES_MOCK} />
  );
}
