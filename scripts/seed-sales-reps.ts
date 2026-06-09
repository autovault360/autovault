/**
 * AutoVault360 — Sales Reps Seeder
 * Creates sample sales reps (auth + users profile) for the first active dealership.
 *
 * Usage:
 *   npx tsx scripts/seed-sales-reps.ts
 *   npx tsx scripts/seed-sales-reps.ts --dealership-id <uuid>
 *   npx tsx scripts/seed-sales-reps.ts --with-metrics
 *
 * Default login password for all seeded reps: SeedRep123!
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SEED_PASSWORD = "SeedRep123!";

type SeedRep = {
  fullName: string;
  email: string;
  phone: string;
  role: "sales_rep" | "manager";
  isActive: boolean;
  commissionRate: number;
  monthlyGoal: number;
  hireDate: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
};

const SEED_REPS: SeedRep[] = [
  {
    fullName: "Marcus Johnson",
    email: "marcus.johnson@seed.autovault360.test",
    phone: "(415) 555-0101",
    role: "sales_rep",
    isActive: true,
    commissionRate: 0.1,
    monthlyGoal: 50000,
    hireDate: "2023-03-15",
    address: "1240 Market St",
    city: "San Francisco",
    state: "CA",
    zip: "94102",
  },
  {
    fullName: "Sarah Williams",
    email: "sarah.williams@seed.autovault360.test",
    phone: "(415) 555-0102",
    role: "sales_rep",
    isActive: true,
    commissionRate: 0.12,
    monthlyGoal: 60000,
    hireDate: "2022-08-01",
    address: "88 Valencia St",
    address2: "Apt 4B",
    city: "San Francisco",
    state: "CA",
    zip: "94103",
  },
  {
    fullName: "Mike Thompson",
    email: "mike.thompson@seed.autovault360.test",
    phone: "(510) 555-0103",
    role: "sales_rep",
    isActive: true,
    commissionRate: 0.08,
    monthlyGoal: 45000,
    hireDate: "2024-01-10",
    address: "450 Broadway",
    city: "Oakland",
    state: "CA",
    zip: "94607",
  },
  {
    fullName: "Emily Chen",
    email: "emily.chen@seed.autovault360.test",
    phone: "(408) 555-0104",
    role: "manager",
    isActive: true,
    commissionRate: 0.15,
    monthlyGoal: 75000,
    hireDate: "2021-05-20",
    address: "2001 Stevens Creek Blvd",
    city: "San Jose",
    state: "CA",
    zip: "95128",
  },
  {
    fullName: "David Rivera",
    email: "david.rivera@seed.autovault360.test",
    phone: "(925) 555-0105",
    role: "sales_rep",
    isActive: false,
    commissionRate: 0.1,
    monthlyGoal: 55000,
    hireDate: "2020-11-02",
    address: "1600 Main St",
    city: "Walnut Creek",
    state: "CA",
    zip: "94596",
  },
];

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

function isMissingColumnError(message: string): boolean {
  return (
    message.includes("does not exist") ||
    message.includes("Could not find") ||
    message.includes("column")
  );
}

function parseArgs() {
  const args = process.argv.slice(2);
  let dealershipId: string | undefined;
  let withMetrics = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--dealership-id" && args[i + 1]) {
      dealershipId = args[++i];
    } else if (args[i] === "--with-metrics") {
      withMetrics = true;
    }
  }

  return { dealershipId, withMetrics };
}

async function resolveDealershipId(
  supabase: SupabaseClient,
  requestedId?: string,
): Promise<string> {
  if (requestedId) {
    const { data, error } = await supabase
      .from("dealerships")
      .select("id, name")
      .eq("id", requestedId)
      .maybeSingle();
    if (error || !data) {
      throw new Error(`Dealership not found: ${requestedId}`);
    }
    console.log(`🏢 Dealership: ${data.name} (${data.id})`);
    return data.id;
  }

  const { data, error } = await supabase
    .from("dealerships")
    .select("id, name")
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    throw new Error(
      "No active dealership found. Create a dealership first or pass --dealership-id <uuid>.",
    );
  }

  console.log(`🏢 Dealership: ${data.name} (${data.id})`);
  return data.id;
}

async function findAuthUserByEmail(supabase: SupabaseClient, email: string) {
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (error) return null;
  const normalized = email.toLowerCase();
  return data.users.find((u) => u.email?.toLowerCase() === normalized) ?? null;
}

async function upsertSalesRep(
  supabase: SupabaseClient,
  dealershipId: string,
  rep: SeedRep,
): Promise<{ userId: string; skipped: boolean }> {
  const { data: existingProfile } = await supabase
    .from("users")
    .select("id")
    .eq("dealership_id", dealershipId)
    .ilike("email", rep.email)
    .maybeSingle();

  if (existingProfile) {
    console.log(`   ↷ Skipped (already exists): ${rep.fullName}`);
    return { userId: existingProfile.id, skipped: true };
  }

  let authUser = await findAuthUserByEmail(supabase, rep.email);

  if (!authUser) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: rep.email,
      password: SEED_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: rep.fullName, role: rep.role },
    });
    if (error || !data.user) {
      throw new Error(`Auth create failed for ${rep.email}: ${error?.message}`);
    }
    authUser = data.user;
    console.log(`   ✅ Auth user: ${rep.email}`);
  } else {
    console.log(`   ℹ️  Auth user exists: ${rep.email}`);
  }

  const basePayload = {
    auth_user_id: authUser.id,
    dealership_id: dealershipId,
    email: rep.email,
    full_name: rep.fullName,
    role: rep.role,
    is_active: rep.isActive,
  };

  const extendedPayload = {
    ...basePayload,
    phone: rep.phone,
    address: rep.address,
    address2: rep.address2 ?? null,
    city: rep.city,
    state: rep.state,
    zip: rep.zip,
    hire_date: rep.hireDate,
    commission_rate: rep.commissionRate,
    monthly_goal: rep.monthlyGoal,
  };

  let insertResult = await supabase
    .from("users")
    .insert(extendedPayload)
    .select("id")
    .single();

  if (insertResult.error && isMissingColumnError(insertResult.error.message)) {
    insertResult = await supabase
      .from("users")
      .insert(basePayload)
      .select("id")
      .single();
  }

  if (insertResult.error || !insertResult.data) {
    throw new Error(
      `Profile insert failed for ${rep.email}: ${insertResult.error?.message}`,
    );
  }

  console.log(
    `   ✅ Profile: ${rep.fullName} (${rep.role}, ${rep.isActive ? "active" : "inactive"})`,
  );
  return { userId: insertResult.data.id, skipped: false };
}

async function seedMetrics(
  supabase: SupabaseClient,
  dealershipId: string,
  repUserIds: { rep: SeedRep; userId: string }[],
  createdByUserId: string,
) {
  const { data: vehicles, error: vehiclesError } = await supabase
    .from("vehicles")
    .select("id, asking_price, acquisition_cost, total_invested, vin, make, model")
    .eq("dealership_id", dealershipId)
    .eq("status", "in_stock")
    .is("deleted_at", null)
    .limit(repUserIds.length * 2);

  if (vehiclesError) {
    console.warn("⚠️  Could not load vehicles for metrics:", vehiclesError.message);
    return;
  }

  if (!vehicles?.length) {
    console.log("ℹ️  No in-stock vehicles found — skipping deal metrics seed.");
    return;
  }

  const today = new Date();
  const thisMonth = today.toISOString().slice(0, 10);
  const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 15);
  const lastMonth = lastMonthDate.toISOString().slice(0, 10);
  const saleDates = [thisMonth, thisMonth, lastMonth, lastMonth, thisMonth];

  let dealCount = 0;

  for (let i = 0; i < repUserIds.length && i * 2 < vehicles.length; i++) {
    const { rep, userId } = repUserIds[i];
    if (!rep.isActive) continue;

    for (let j = 0; j < 2; j++) {
      const vehicle = vehicles[i * 2 + j];
      if (!vehicle) break;

      const { data: existingDeal } = await supabase
        .from("deals")
        .select("id")
        .eq("vehicle_id", vehicle.id)
        .maybeSingle();

      if (existingDeal) continue;

      const customerPhone = `(555) 555-${String(1000 + dealCount).slice(-4)}`;
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .insert({
          dealership_id: dealershipId,
          name: `Seed Customer ${dealCount + 1}`,
          phone: customerPhone,
          email: `seed.customer${dealCount + 1}@autovault360.test`,
          type: "individual",
          status: "customer",
          sales_rep_id: userId,
          source: "walk_in",
          created_by: createdByUserId,
        })
        .select("id")
        .single();

      if (customerError || !customer) {
        console.warn(`   ⚠️  Customer seed failed: ${customerError?.message}`);
        continue;
      }

      const price = Number(vehicle.asking_price ?? 25000);
      const collected = Math.round(price * 0.95);
      const saleDate = saleDates[dealCount % saleDates.length];

      const { error: dealError } = await supabase.from("deals").insert({
        vehicle_id: vehicle.id,
        customer_id: customer.id,
        dealership_id: dealershipId,
        sale_date: saleDate,
        total_price_otd: price,
        total_collected: collected,
        sales_tax_amount: Math.round(price * 0.08),
        created_by: userId,
      });

      if (dealError) {
        console.warn(`   ⚠️  Deal seed failed: ${dealError.message}`);
        await supabase.from("customers").delete().eq("id", customer.id);
        continue;
      }

      await supabase
        .from("vehicles")
        .update({ status: "sold" })
        .eq("id", vehicle.id);

      dealCount++;
      console.log(`   ✅ Deal: ${rep.fullName} → ${vehicle.make} ${vehicle.model} (${saleDate})`);
    }
  }

  console.log(`\n📊 Seeded ${dealCount} sample deal(s) for dashboard metrics.`);
}

async function main() {
  const { dealershipId: requestedDealershipId, withMetrics } = parseArgs();

  console.log("╔══════════════════════════════════════════�—");
  console.log("║     AutoVault360 — Sales Reps Seeder     ║");
  console.log("╚══════════════════════════════════════════�—\n");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error(
      "�—� Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env",
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const dealershipId = await resolveDealershipId(supabase, requestedDealershipId);

  let createdByUserId: string;

  const { data: creator } = await supabase
    .from("users")
    .select("id, role")
    .eq("dealership_id", dealershipId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (creator) {
    createdByUserId = creator.id;
  } else {
    const { data: superAdmin } = await supabase
      .from("users")
      .select("id, role")
      .eq("role", "super_admin")
      .limit(1)
      .maybeSingle();

    if (!superAdmin) {
      throw new Error(
        "No users found for this dealership. Create an owner account first.",
      );
    }

    console.log("ℹ️  Using super admin as created_by for metrics seed.");
    createdByUserId = superAdmin.id;
  }

  console.log(`\n👥 Seeding ${SEED_REPS.length} sales reps...\n`);

  const createdReps: { rep: SeedRep; userId: string }[] = [];

  for (const rep of SEED_REPS) {
    console.log(`→ ${rep.fullName}`);
    const { userId, skipped } = await upsertSalesRep(supabase, dealershipId, rep);
    createdReps.push({ rep, userId });
    if (!skipped) {
      console.log(`      Commission: ${(rep.commissionRate * 100).toFixed(0)}% | Goal: $${rep.monthlyGoal.toLocaleString()}`);
    }
  }

  if (withMetrics) {
    console.log("\n📈 Seeding sample customers & deals...");
    await seedMetrics(supabase, dealershipId, createdReps, createdByUserId);
  }

  console.log("\n🎉 Sales rep seed complete!");
  console.log(`   Password for all seeded accounts: ${SEED_PASSWORD}`);
  console.log("   Emails:");
  for (const rep of SEED_REPS) {
    console.log(`     • ${rep.email}`);
  }
  if (!withMetrics) {
    console.log("\n   Tip: re-run with --with-metrics to seed sample deals (requires in-stock vehicles).");
  }
  console.log("");
}

main().catch((err) => {
  console.error("�—� Seed failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
