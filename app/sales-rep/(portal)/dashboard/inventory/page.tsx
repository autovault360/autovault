import { getInventoryVehicles } from "@/lib/vehicles/server/get-inventory-vehicles";
import AddVehicleTrigger from "@/components/vehicles/add/add-vehicle-trigger";
import { PageHeaderTitle } from "@/components/layout/page-header-title";
import VehicleStatsCards from "@/components/vehicles/vehicle-stats-cards";
import SalesRepInventory from "@/components/sales-rep/dashboard/sales-rep-inventory";
import { authenticateUser } from "@/lib/vehicles/server/utils";

export default async function SalesRepInventoryPage({
  searchParams,
}: {
  searchParams?:
    | Promise<{ add?: string; edit?: string }>
    | { add?: string; edit?: string };
}) {
  const resolved =
    searchParams instanceof Promise ? await searchParams : (searchParams ?? {});
  const defaultOpen = resolved.add === "true";
  const defaultEditId = resolved.edit;
  const auth = await authenticateUser();
  const vehicles = auth.ok ? await getInventoryVehicles() : [];

  return (
    <div>
      <section className="mb-3.5 flex flex-wrap items-center justify-between gap-3 px-0.5">
        <div>
          <PageHeaderTitle
            title="Browse Inventory"
            subtitle="View dealership vehicle inventory."
          />
        </div>
        <AddVehicleTrigger defaultOpen={defaultOpen} />
      </section>

      <VehicleStatsCards vehicles={vehicles} />

      <SalesRepInventory vehicles={vehicles} defaultEditId={defaultEditId} />
    </div>
  );
}
