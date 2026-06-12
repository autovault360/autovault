import {
  computeVehicleStats,
  type Vehicle,
  type VehicleStatus,
} from "@/lib/vehicles/types";
import { mapDbVehicleStatus } from "@/lib/vehicles/map-db-status";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { authenticateUser } from "@/lib/vehicles/server/utils";
import AddVehicleTrigger from "@/components/vehicles/add/add-vehicle-trigger";
import { PageHeaderTitle } from "@/components/layout/page-header-title";
import VehicleStatsCards from "@/components/vehicles/vehicle-stats-cards";
import SalesRepInventory from "@/components/sales-rep/dashboard/sales-rep-inventory";

function mapStatus(dbStatus: string): VehicleStatus {
  return mapDbVehicleStatus(dbStatus);
}

function daysSince(date: string | null | undefined): number {
  if (!date) return 0;
  return Math.floor(
    (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24),
  );
}

function formatISO(date: string | null | undefined): string {
  if (!date) return "";
  return date.split("T")[0];
}

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
  const vehicles: Vehicle[] = [];

  if (!auth.ok) {
    console.warn("SalesRepInventoryPage: auth failed", auth.error);
  } else {
    const { dealershipId } = auth.user;
    const supabase = await createClient();

    const { data: rows, error } = await supabase
      .from("vehicles")
      .select("*, images:vehicle_images(storage_path, is_primary, sort_order)")
      .eq("dealership_id", dealershipId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("SalesRepInventoryPage: query error", error.message);
    } else if (rows) {
      for (const row of rows) {
        const r = row as Record<string, unknown>;
        const images = r.images as { storage_path: string; is_primary: boolean; sort_order: number }[] | undefined;
        let imageUrl = "";
        const sortedImages = [...(images ?? [])].sort((a, b) => {
          if (a.is_primary !== b.is_primary) return Number(b.is_primary) - Number(a.is_primary);
          return (a.sort_order ?? 0) - (b.sort_order ?? 0);
        });
        if (sortedImages[0]) {
          try {
            const { data, error: signedError } = await supabase.storage
              .from("vehicle-images")
              .createSignedUrl(sortedImages[0].storage_path, 3600);
            imageUrl = signedError || !data ? "" : data.signedUrl;
          } catch {
            imageUrl = "";
          }
        }

        vehicles.push({
          id: r.id as string,
          image: imageUrl,
          make: r.make as string,
          model: r.model as string,
          trim: (r.trim as string) ?? "",
          year: r.year as number,
          stockNumber: (r.stock_number as string) ?? "",
          vin: r.vin as string,
          mileage: (r.mileage as number) ?? 0,
          price: Number(r.asking_price ?? 0),
          cost: Number(r.acquisition_cost ?? 0),
          daysInInventory: daysSince(r.acquisition_date as string),
          status: mapStatus(r.status as string),
          location: (r.lot_location as string) ?? "",
          arrivalDate: formatISO(r.acquisition_date as string),
        });
      }
    }
  }

  const stats = computeVehicleStats(vehicles);

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

      <VehicleStatsCards stats={stats} />

      <SalesRepInventory vehicles={vehicles} defaultEditId={defaultEditId} />
    </div>
  );
}
