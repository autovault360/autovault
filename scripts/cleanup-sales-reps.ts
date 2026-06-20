/**
 * AutoVault360 �€” Sales Reps Cleanup
 * Deletes all sales reps (role: sales_rep, manager) from auth.users + public.users
 * and nullifies their references in related tables.
 *
 * Usage:
 *   npx tsx scripts/cleanup-sales-reps.ts
 *   npx tsx scripts/cleanup-sales-reps.ts --dealership-id <uuid>
 *   npx tsx scripts/cleanup-sales-reps.ts --dry-run
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

async function main() {
  const { dealershipId: requestedDealershipId, dryRun } = parseArgs();

  console.log("�•”�•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•�€”");
  console.log("�•‘   AutoVault360 �€” Sales Reps Cleanup      �•‘");
  console.log(dryRun ? "�•‘   �Ÿ”� DRY RUN �€” no changes will be made �•‘" : "�•š�•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•�");
  if (!dryRun) console.log("�•š�•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•��•�");
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

  let query = supabase
    .from("users")
    .select("id, auth_user_id, email, full_name, role")
    .in("role", ["sales_rep", "manager"]);

  if (requestedDealershipId) {
    query = query.eq("dealership_id", requestedDealershipId);
  }

  const { data: reps, error } = await query;

  if (error) {
    console.error("Failed to fetch sales reps:", error.message);
    process.exit(1);
  }

  if (!reps || reps.length === 0) {
    console.log("No sales reps found to delete.");
    process.exit(0);
  }

  console.log(`Found ${reps.length} sales rep(s):\n`);
  for (const rep of reps) {
    console.log(`  �€� ${rep.full_name} (${rep.email}) �€” ${rep.role} �€” id: ${rep.id}`);
  }
  console.log("");

  if (dryRun) {
    console.log("�Ÿ”� Dry run complete. Pass --dry-run to see what would be deleted.");
    process.exit(0);
  }

  const repIds = reps.map((r) => r.id);
  const authUserIds = reps.map((r) => r.auth_user_id);

  console.log("Step 1/5: Nullifying sales_rep_id in customers...");
  const { data: customerRefs, error: customerErr } = await supabase
    .from("customers")
    .update({ sales_rep_id: null })
    .in("sales_rep_id", repIds)
    .select("id");
  if (customerErr) console.error("  customers update failed:", customerErr.message);
  else console.log(`  �œ… Updated ${customerRefs?.length ?? 0} customer(s)`);

  console.log("Step 2/5: Nullifying sales_rep_id in deal_jackets...");
  const { data: jacketRefs, error: jacketErr } = await supabase
    .from("deal_jackets")
    .update({ sales_rep_id: null })
    .in("sales_rep_id", repIds)
    .select("id");
  if (jacketErr) console.error("  deal_jackets update failed:", jacketErr.message);
  else console.log(`  �œ… Updated ${jacketRefs?.length ?? 0} deal jacket(s)`);

  console.log("Step 3/5: Nullifying sales_rep_id in calendar_events...");
  const { data: eventRefs, error: eventErr } = await supabase
    .from("calendar_events")
    .update({ sales_rep_id: null })
    .in("sales_rep_id", repIds)
    .select("id");
  if (eventErr) console.error("  calendar_events update failed:", eventErr.message);
  else console.log(`  �œ… Updated ${eventRefs?.length ?? 0} event(s)`);

  console.log("Step 4/5: Deleting profile rows from public.users...");
  const { data: deletedUsers, error: deleteUsersErr } = await supabase
    .from("users")
    .delete()
    .in("id", repIds)
    .select("id, full_name");
  if (deleteUsersErr) {
    console.error("  users delete failed:", deleteUsersErr.message);
    process.exit(1);
  }
  console.log(`  �œ… Deleted ${deletedUsers?.length ?? 0} user profile(s)`);

  console.log("Step 5/5: Deleting auth users from auth.users...");
  for (const authUserId of authUserIds) {
    const { error: delAuthErr } = await supabase.auth.admin.deleteUser(authUserId);
    if (delAuthErr) {
      console.error(`  Failed to delete auth user ${authUserId}: ${delAuthErr.message}`);
    } else {
      console.log(`  �œ… Deleted auth user: ${authUserId}`);
    }
  }

  console.log("\n�ŸŽ‰ Cleanup complete!");
}

main().catch((err) => {
  console.error("Cleanup failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
