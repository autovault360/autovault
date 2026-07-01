import AddVehicleTrigger from "@/components/vehicles/add/add-vehicle-trigger";
import VehiclesInventoryShell from "@/components/vehicles/vehicles-inventory-shell";
import { getFlooringSummary } from "@/lib/vehicles/server/get-flooring-summary";
import { getInventoryVehicles } from "@/lib/vehicles/server/get-inventory-vehicles";
import { authenticateUser } from "@/lib/vehicles/server/utils";
import { getInventoryKpiPreferences } from "@/lib/vehicles/server/kpi-preferences";

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
  const kpiPreferences = auth.ok ? await getInventoryKpiPreferences() : [];

  return (
    <div>
      <div className="mb-[18px] flex flex-wrap items-end justify-between gap-3.5 px-0.5">
        <div>
          <div className="text-[13px] font-bold tracking-[3px] text-slate-500">
            INVENTORY <b className="mt-1 block text-[26px] font-extrabold tracking-[1px] text-slate-200">VEHICLES INVENTORY</b>
          </div>
          <p className="text-[12.5px] text-slate-500">
            — {vehicles.length} vehicles in active inventory
          </p>
        </div>

        <div className="shrink-0">
          <AddVehicleTrigger defaultOpen={defaultOpen} />
        </div>
      </div>

      <VehiclesInventoryShell
        vehicles={vehicles}
        defaultEditId={defaultEditId}
        initialKpiPreferences={kpiPreferences}
        flooringSummary={flooringSummary}
      />
    </div>
  );
}
