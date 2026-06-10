/**
 * AutoVault360 — Vehicle Data Cleanup
 * Deletes ALL vehicles and their related data (deal jackets, deals,
 * customers, images, expenses, etc.) while preserving user accounts
 * and dealership configuration.
 *
 * Usage:
 *   npx tsx scripts/cleanup-vehicles.ts
 *   npx tsx scripts/cleanup-vehicles.ts --dealership-id <uuid>
 *   npx tsx scripts/cleanup-vehicles.ts --dry-run
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = fileURLToPath(new URL(".", import.meta.url));
const envContent = readFileSync(resolve(scriptDir, "..", ".env"), "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const value = trimmed.slice(eqIdx + 1).trim();
  if (!process.env[key]) process.env[key] = value;
}

function parseArgs() {
  const args = process.argv.slice(2);
  let dealershipId: string | undefined;
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--dealership-id" && args[i + 1]) {
      dealershipId = args[++i];
    } else if (args[i] === "--dry-run") {
      dryRun = true;
    }
  }

  return { dealershipId, dryRun };
}

async function showCounts(
  supabase: SupabaseClient,
  dealershipId?: string,
): Promise<void> {
  const tables = [
    "deal_jacket_documents",
    "deal_jackets",
    "deals",
    "vehicle_losses",
    "vehicle_images",
    "vehicle_expenses",
    "pricing_history",
    "status_history",
    "vehicles",
    "customer_documents",
    "customer_communications",
    "customer_notes",
    "customers",
    "cpa_notes",
    "calendar_events",
    "audit_logs",
    "files",
  ];

  console.log("Current row counts:");
  for (const table of tables) {
    let query = supabase.from(table).select("id", { count: "exact", head: true });
    if (dealershipId && table !== "audit_logs") {
      query = query.eq("dealership_id", dealershipId);
    }
    const { count, error } = await query;
    if (error) {
      console.log(`  ${table}: error - ${error.message}`);
    } else {
      console.log(`  ${table}: ${count ?? 0}`);
    }
  }
}

async function main() {
  const { dealershipId: requestedDealershipId, dryRun } = parseArgs();

  console.log("╔═══════════════════════════════════════════╗");
  console.log("║  AutoVault360 — Vehicle Data Cleanup     ║");
  if (dryRun) {
    console.log("║   🔍 DRY RUN — no changes will be made  ║");
  }
  console.log("╚═══════════════════════════════════════════╝");
  console.log("");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  if (requestedDealershipId) {
    console.log(`Targeting dealership: ${requestedDealershipId}\n`);
  } else {
    console.log("Targeting ALL dealerships\n");
  }

  await showCounts(supabase, requestedDealershipId);
  console.log("");

  if (dryRun) {
    console.log("🔍 Dry run complete. Pass --dry-run to see what would be deleted.");
    process.exit(0);
  }

  function eqFilter(query: any) {
    if (requestedDealershipId) return query.eq("dealership_id", requestedDealershipId);
    return query.neq("id", "00000000-0000-0000-0000-000000000000");
  }

  // ── Step 1: Deal jackets (cascades to deal_jacket_documents) ──
  console.log("Step 1/15: deal_jackets...");
  {
    const query = eqFilter(supabase.from("deal_jackets").delete());
    const { data, error } = await query.select("id");
    if (error) console.error(`  ✗ ${error.message}`);
    else console.log(`  ✓ ${data?.length ?? 0} deleted`);
  }

  // ── Step 2: Deals ──
  console.log("Step 2/15: deals...");
  {
    const query = eqFilter(supabase.from("deals").delete());
    const { data, error } = await query.select("id");
    if (error) console.error(`  ✗ ${error.message}`);
    else console.log(`  ✓ ${data?.length ?? 0} deleted`);
  }

  // ── Step 3: Vehicle losses ──
  console.log("Step 3/15: vehicle_losses...");
  {
    const query = eqFilter(supabase.from("vehicle_losses").delete());
    const { data, error } = await query.select("id");
    if (error) console.error(`  ✗ ${error.message}`);
    else console.log(`  ✓ ${data?.length ?? 0} deleted`);
  }

  // ── Step 4: Vehicle images ──
  console.log("Step 4/15: vehicle_images...");
  {
    const query = eqFilter(supabase.from("vehicle_images").delete());
    const { data, error } = await query.select("id");
    if (error) console.error(`  ✗ ${error.message}`);
    else console.log(`  ✓ ${data?.length ?? 0} deleted`);
  }

  // ── Step 5: Vehicle expenses ──
  console.log("Step 5/15: vehicle_expenses...");
  {
    const query = eqFilter(supabase.from("vehicle_expenses").delete());
    const { data, error } = await query.select("id");
    if (error) console.error(`  ✗ ${error.message}`);
    else console.log(`  ✓ ${data?.length ?? 0} deleted`);
  }

  // ── Step 6: Pricing history ──
  console.log("Step 6/15: pricing_history...");
  {
    const query = eqFilter(supabase.from("pricing_history").delete());
    const { data, error } = await query.select("id");
    if (error) console.error(`  ✗ ${error.message}`);
    else console.log(`  ✓ ${data?.length ?? 0} deleted`);
  }

  // ── Step 7: Status history ──
  console.log("Step 7/15: status_history...");
  {
    const query = eqFilter(supabase.from("status_history").delete());
    const { data, error } = await query.select("id");
    if (error) console.error(`  ✗ ${error.message}`);
    else console.log(`  ✓ ${data?.length ?? 0} deleted`);
  }

  // ── Step 8: Vehicles (core table) ──
  console.log("Step 8/15: vehicles...");
  {
    const query = eqFilter(supabase.from("vehicles").delete());
    const { data, error } = await query.select("id");
    if (error) console.error(`  ✗ ${error.message}`);
    else console.log(`  ✓ ${data?.length ?? 0} deleted`);
  }

  // ── Step 9: Customer documents ──
  console.log("Step 9/15: customer_documents...");
  {
    const query = eqFilter(supabase.from("customer_documents").delete());
    const { data, error } = await query.select("id");
    if (error) console.error(`  ✗ ${error.message}`);
    else console.log(`  ✓ ${data?.length ?? 0} deleted`);
  }

  // ── Step 10: Customer communications ──
  console.log("Step 10/15: customer_communications...");
  {
    const query = eqFilter(supabase.from("customer_communications").delete());
    const { data, error } = await query.select("id");
    if (error) console.error(`  ✗ ${error.message}`);
    else console.log(`  ✓ ${data?.length ?? 0} deleted`);
  }

  // ── Step 11: Customer notes ──
  console.log("Step 11/15: customer_notes...");
  {
    const query = eqFilter(supabase.from("customer_notes").delete());
    const { data, error } = await query.select("id");
    if (error) console.error(`  ✗ ${error.message}`);
    else console.log(`  ✓ ${data?.length ?? 0} deleted`);
  }

  // ── Step 12: Customers ──
  console.log("Step 12/15: customers...");
  {
    const query = eqFilter(supabase.from("customers").delete());
    const { data, error } = await query.select("id");
    if (error) console.error(`  ✗ ${error.message}`);
    else console.log(`  ✓ ${data?.length ?? 0} deleted`);
  }

  // ── Step 13: CPA notes referencing vehicles ──
  console.log("Step 13/15: cpa_notes (vehicle-linked)...");
  {
    let query = supabase.from("cpa_notes").delete().not("vehicle_id", "is", null);
    if (requestedDealershipId) {
      query = query.eq("dealership_id", requestedDealershipId);
    }
    const { data, error } = await query.select("id");
    if (error) console.error(`  ✗ ${error.message}`);
    else console.log(`  ✓ ${data?.length ?? 0} deleted`);
  }

  // ── Step 14: Files (vehicle/customer/deal/deal_jacket references) ──
  console.log("Step 14/15: files (vehicle/customer/deal/deal_jacket)...");
  {
    const entities = ["vehicle", "customer", "deal", "deal_jacket"];
    for (const entity of entities) {
      let query = supabase
        .from("files")
        .delete()
        .eq("source_entity", entity);
      if (requestedDealershipId) {
        query = query.eq("dealership_id", requestedDealershipId);
      }
      const { data, error } = await query.select("id");
      if (error) console.error(`  ✗ ${entity}: ${error.message}`);
      else console.log(`  ✓ ${entity}: ${data?.length ?? 0} deleted`);
    }
  }

  // ── Step 15: Audit logs (vehicle/customer/deal/deal_jacket/expense references) ──
  console.log("Step 15/15: audit_logs...");
  {
    const entityTypes = ["vehicle", "customer", "deal", "deal_jacket", "vehicle_expense"];
    for (const entity of entityTypes) {
      let query = supabase
        .from("audit_logs")
        .delete()
        .eq("entity_type", entity);
      if (requestedDealershipId) {
        query = query.eq("dealership_id", requestedDealershipId);
      }
      const { data, error } = await query.select("id");
      if (error) console.error(`  ✗ ${entity}: ${error.message}`);
      else console.log(`  ✓ ${entity}: ${data?.length ?? 0} deleted`);
    }
  }

  // ── Final counts ──
  console.log("\nFinal counts after cleanup:");
  await showCounts(supabase, requestedDealershipId);

  console.log("\n✅ Cleanup complete!");
}

main().catch((err) => {
  console.error("Cleanup failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
