import AddVehicleTrigger from "@/components/vehicles/add/add-vehicle-trigger";
import VehicleStatsCards from "@/components/vehicles/vehicle-stats-cards";
import VehiclesInventory from "@/components/vehicles/vehicles-inventory";
import FlooringCostBanner from "@/components/vehicles/flooring/flooring-cost-banner";
import { getFlooringSummary } from "@/lib/vehicles/server/get-flooring-summary";
import { getInventoryVehicles } from "@/lib/vehicles/server/get-inventory-vehicles";
import { authenticateUser } from "@/lib/vehicles/server/utils";

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams?: Promise<{ add?: string; edit?: string }>;
}) {
  const resolved = await searchParams;
  const defaultOpen = resolved?.add === "true";
  const defaultEditId = resolved?.edit;
  const auth = await authenticateUser();

  const vehicles = auth.ok ? await getInventoryVehicles() : [];
  const flooringSummary = auth.ok ? await getFlooringSummary() : null;

  return (
    <div>
      <section className="mb-3.5 flex flex-wrap items-start justify-between gap-3 px-0.5">
        <div className="min-w-[200px] shrink-0">
          <h1 className="text-xl font-bold tracking-[0.12em] text-white">
            VEHICLES INVENTORY
          </h1>
          <p className="mt-0.5 text-[12.5px] text-slate-500">
            Manage, track, and analyze your vehicle inventory.
          </p>
        </div>

        {flooringSummary ? (
          <div className="order-3 w-full flex-1 xl:order-none xl:max-w-md xl:mx-auto">
            <FlooringCostBanner summary={flooringSummary} className="mb-0" />
          </div>
        ) : null}

        <div className="shrink-0">
          <AddVehicleTrigger defaultOpen={defaultOpen} />
        </div>
      </section>

      <VehicleStatsCards vehicles={vehicles} />

      <VehiclesInventory vehicles={vehicles} defaultEditId={defaultEditId} />
    </div>
  );
}
