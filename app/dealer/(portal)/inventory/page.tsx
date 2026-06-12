import type { Metadata } from "next";
import DealerInventoryPageContent from "@/components/dealer/dashboard/inventory/dealer-inventory-page-content";
import { getWholesaleInventory } from "@/lib/dealer/inventory/server/get-wholesale-inventory";

export const metadata: Metadata = {
  title: "Inventory Overview | Dealer Dashboard",
  description: "Manage wholesale inventory, titles, and pipeline status.",
};

export default async function DealerInventoryPage({
  searchParams,
}: {
  searchParams?:
    | Promise<{ add?: string }>
    | { add?: string };
}) {
  const resolved =
    searchParams instanceof Promise ? await searchParams : (searchParams ?? {});
  const vehicles = await getWholesaleInventory();

  return (
    <DealerInventoryPageContent
      vehicles={vehicles}
      defaultAddOpen={resolved.add === "true"}
    />
  );
}
