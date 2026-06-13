import type { Metadata } from "next";

import DealerInventoryPageContent from "@/components/dealer/dashboard/inventory/dealer-inventory-page-content";



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



  return (

    <DealerInventoryPageContent defaultAddOpen={resolved.add === "true"} />

  );

}

