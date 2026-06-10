import SalesRepVehicleAlertsContent from "@/components/sales-rep/vehicle-alerts/sales-rep-vehicle-alerts-content";
import { SALES_REP_VEHICLE_ALERTS_MOCK } from "@/lib/sales-rep/vehicle-alerts/mock-data";

export default function SalesRepVehicleAlertsPage() {
  return (
    <SalesRepVehicleAlertsContent initialAlerts={SALES_REP_VEHICLE_ALERTS_MOCK} />
  );
}
