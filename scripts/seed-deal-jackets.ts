/**
 * Seeds 8 deal jackets (vehicles, customers, deal_jackets) from the Deal Jackets UI reference.
 *
 * Usage:
 *   npx tsx scripts/seed-deal-jackets.ts
 *   npx tsx scripts/seed-deal-jackets.ts --dealership-id <uuid>
 *   npx tsx scripts/seed-deal-jackets.ts --force
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SEED_PASSWORD = "SeedRep123!";

type SeedRow = {
  year: number;
  make: string;
  model: string;
  stockNumber: string;
  vin: string;
  customerName: string;
  customerPhone: string;
  saleDate: string;
  soldPrice: number;
  profitNet: number;
  salesRepName: string;
  salesRepEmail: string;
  commissionAmount: number;
  commissionStatus: "paid" | "pending";
  jacketNumber: string;
};

const SEED_ROWS: SeedRow[] = [
  {
    year: 2020,
    make: "Honda",
    model: "Accord LX",
    stockNumber: "1008",
    vin: "1HGCV1F14LA123456",
    customerName: "Michael Johnson",
    customerPhone: "(916) 555-7890",
    saleDate: "2025-05-31",
    soldPrice: 18900,
    profitNet: 2506.15,
    salesRepName: "Sarah Williams",
    salesRepEmail: "sarah.williams@seed.autovault360.test",
    commissionAmount: 850.5,
    commissionStatus: "paid",
    jacketNumber: "DJ-000001",
  },
  {
    year: 2019,
    make: "BMW",
    model: "3 Series",
    stockNumber: "1005",
    vin: "WBA5R1C50KA123987",
    customerName: "David Martinez",
    customerPhone: "(916) 444-2311",
    saleDate: "2025-05-30",
    soldPrice: 22500,
    profitNet: 3217.4,
    salesRepName: "Mike Thompson",
    salesRepEmail: "mike.thompson@seed.autovault360.test",
    commissionAmount: 1125,
    commissionStatus: "paid",
    jacketNumber: "DJ-000002",
  },
  {
    year: 2021,
    make: "Ford",
    model: "F-150 XLT",
    stockNumber: "1002",
    vin: "1FTFW1E55MFB12345",
    customerName: "James Anderson",
    customerPhone: "(916) 555-6622",
    saleDate: "2025-05-29",
    soldPrice: 31995,
    profitNet: 4812.3,
    salesRepName: "Sarah Williams",
    salesRepEmail: "sarah.williams@seed.autovault360.test",
    commissionAmount: 1599.75,
    commissionStatus: "pending",
    jacketNumber: "DJ-000003",
  },
  {
    year: 2018,
    make: "Toyota",
    model: "Camry SE",
    stockNumber: "0998",
    vin: "4T1B11HKXJU123678",
    customerName: "Robert Brown",
    customerPhone: "(916) 777-3344",
    saleDate: "2025-05-28",
    soldPrice: 16250,
    profitNet: 2102.85,
    salesRepName: "Mike Thompson",
    salesRepEmail: "mike.thompson@seed.autovault360.test",
    commissionAmount: 812.5,
    commissionStatus: "paid",
    jacketNumber: "DJ-000004",
  },
  {
    year: 2022,
    make: "Honda",
    model: "CR-V EX",
    stockNumber: "1012",
    vin: "2HKRW2H85NH123456",
    customerName: "Jessica Davis",
    customerPhone: "(916) 555-9811",
    saleDate: "2025-05-27",
    soldPrice: 24900,
    profitNet: 3412.6,
    salesRepName: "John Doe",
    salesRepEmail: "john.doe@seed.autovault360.test",
    commissionAmount: 1245,
    commissionStatus: "paid",
    jacketNumber: "DJ-000005",
  },
  {
    year: 2020,
    make: "Ford",
    model: "Mustang GT",
    stockNumber: "0995",
    vin: "1FA6P8CF0L5123456",
    customerName: "Christopher Wilson",
    customerPhone: "(916) 444-7755",
    saleDate: "2025-05-26",
    soldPrice: 27800,
    profitNet: 4125.7,
    salesRepName: "Sarah Williams",
    salesRepEmail: "sarah.williams@seed.autovault360.test",
    commissionAmount: 1390,
    commissionStatus: "pending",
    jacketNumber: "DJ-000006",
  },
  {
    year: 2019,
    make: "Chevrolet",
    model: "Silverado 1500",
    stockNumber: "0989",
    vin: "3GCPYBEK2KG123456",
    customerName: "Brian Taylor",
    customerPhone: "(916) 333-2288",
    saleDate: "2025-05-24",
    soldPrice: 29500,
    profitNet: 4702.1,
    salesRepName: "Mike Thompson",
    salesRepEmail: "mike.thompson@seed.autovault360.test",
    commissionAmount: 1475,
    commissionStatus: "paid",
    jacketNumber: "DJ-000007",
  },
  {
    year: 2021,
    make: "Tesla",
    model: "Model 3",
    stockNumber: "1010",
    vin: "5YJ3E1EB5MF123456",
    customerName: "Amanda Lee",
    customerPhone: "(916) 888-6677",
    saleDate: "2025-05-23",
    soldPrice: 32750,
    profitNet: 5325.35,
    salesRepName: "John Doe",
    salesRepEmail: "john.doe@seed.autovault360.test",
    commissionAmount: 1637.5,
    commissionStatus: "paid",
    jacketNumber: "DJ-000008",
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

function parseArgs() {
  const args = process.argv.slice(2);
  let dealershipId: string | undefined;
  let force = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--dealership-id" && args[i + 1]) dealershipId = args[++i];
    else if (args[i] === "--force") force = true;
  }
  return { dealershipId, force };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
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
    if (error || !data) throw new Error(`Dealership not found: ${requestedId}`);
    console.log(`?? Dealership: ${data.name}`);
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
    throw new Error("No active dealership found. Pass --dealership-id <uuid>.");
  }
  console.log(`?? Dealership: ${data.name}`);
  return data.id;
}

async function resolveCreatedBy(
  supabase: SupabaseClient,
  dealershipId: string,
): Promise<string> {
  const preferred = await supabase
    .from("users")
    .select("id")
    .eq("dealership_id", dealershipId)
    .in("role", ["owner", "manager", "super_admin"])
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (preferred.data?.id) return preferred.data.id;

  const { data: anyUser, error } = await supabase
    .from("users")
    .select("id")
    .eq("dealership_id", dealershipId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !anyUser) {
    throw new Error("No users found for dealership ? run setup or seed sales reps first");
  }
  return anyUser.id;
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

async function ensureSalesRep(
  supabase: SupabaseClient,
  dealershipId: string,
  fullName: string,
  email: string,
): Promise<string> {
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("dealership_id", dealershipId)
    .ilike("email", email)
    .maybeSingle();

  if (existing) return existing.id;

  let authUser = await findAuthUserByEmail(supabase, email);
  if (!authUser) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: SEED_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: fullName, role: "sales_rep" },
    });
    if (error || !data.user) {
      throw new Error(`Auth create failed for ${email}: ${error?.message}`);
    }
    authUser = data.user;
    console.log(`   ? Auth user: ${email}`);
  }

  let insertResult = await supabase
    .from("users")
    .insert({
      auth_user_id: authUser.id,
      dealership_id: dealershipId,
      email,
      full_name: fullName,
      role: "sales_rep",
      commission_rate: 0.1,
      is_active: true,
    })
    .select("id")
    .single();

  if (insertResult.error?.message?.includes("does not exist")) {
    insertResult = await supabase
      .from("users")
      .insert({
        auth_user_id: authUser.id,
        dealership_id: dealershipId,
        email,
        full_name: fullName,
        role: "sales_rep",
      })
      .select("id")
      .single();
  }

  if (insertResult.error || !insertResult.data) {
    throw new Error(
      `User profile failed for ${email}: ${insertResult.error?.message}`,
    );
  }

  const profile = insertResult.data;

  console.log(`   ? Sales rep profile: ${fullName}`);
  return profile.id;
}

async function upsertCustomer(
  supabase: SupabaseClient,
  dealershipId: string,
  createdBy: string,
  row: SeedRow,
): Promise<string> {
  const { data: existing } = await supabase
    .from("customers")
    .select("id")
    .eq("dealership_id", dealershipId)
    .eq("phone", row.customerPhone)
    .is("deleted_at", null)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("customers")
      .update({ name: row.customerName, status: "customer" })
      .eq("id", existing.id);
    return existing.id;
  }

  const { data, error } = await supabase
    .from("customers")
    .insert({
      dealership_id: dealershipId,
      type: "individual",
      name: row.customerName,
      phone: row.customerPhone,
      status: "customer",
      created_by: createdBy,
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(`Customer insert failed: ${error?.message}`);
  return data.id;
}

async function upsertVehicle(
  supabase: SupabaseClient,
  dealershipId: string,
  createdBy: string,
  row: SeedRow,
  force: boolean,
): Promise<string> {
  const { data: existing } = await supabase
    .from("vehicles")
    .select("id")
    .eq("dealership_id", dealershipId)
    .eq("vin", row.vin)
    .maybeSingle();

  const profitGross = round2(row.profitNet + row.commissionAmount);
  const totalInvested = round2(row.soldPrice - profitGross);
  const acquisitionCost = Math.max(0, totalInvested);

  const payload = {
    dealership_id: dealershipId,
    vin: row.vin,
    stock_number: row.stockNumber,
    make: row.make,
    model: row.model,
    year: row.year,
    status: "sold" as const,
    acquisition_cost: acquisitionCost,
    total_invested: totalInvested,
    asking_price: row.soldPrice,
    created_by: createdBy,
  };

  if (existing) {
    if (force) {
      await supabase.from("vehicles").update(payload).eq("id", existing.id);
    }
    return existing.id;
  }

  const { data, error } = await supabase
    .from("vehicles")
    .insert(payload)
    .select("id")
    .single();

  if (error || !data) throw new Error(`Vehicle insert failed (${row.vin}): ${error?.message}`);
  return data.id;
}

async function upsertDealJacket(
  supabase: SupabaseClient,
  dealershipId: string,
  createdBy: string,
  row: SeedRow,
  vehicleId: string,
  customerId: string,
  salesRepId: string,
  force: boolean,
): Promise<void> {
  const { data: existing } = await supabase
    .from("deal_jackets")
    .select("id")
    .eq("vehicle_id", vehicleId)
    .is("deleted_at", null)
    .maybeSingle();

  if (existing && !force) {
    console.log(`   ? Jacket exists: ${row.jacketNumber} (${row.vin})`);
    return;
  }

  const profitGross = round2(row.profitNet + row.commissionAmount);
  const totalInvested = round2(row.soldPrice - profitGross);
  const dateSold = `${row.saleDate}T12:00:00Z`;

  const payload = {
    dealership_id: dealershipId,
    vehicle_id: vehicleId,
    customer_id: customerId,
    sales_rep_id: salesRepId,
    jacket_number: row.jacketNumber,
    sold_price: row.soldPrice,
    total_tax: 0,
    fees: {},
    total_sale_price: row.soldPrice,
    down_payment: 0,
    amount_financed: 0,
    balance_due: 0,
    total_invested: totalInvested,
    additional_expenses: 0,
    commission_amount: row.commissionAmount,
    profit_gross: profitGross,
    profit_net: row.profitNet,
    date_sold: dateSold,
    created_by: createdBy,
  };

  if (existing && force) {
    const { error } = await supabase
      .from("deal_jackets")
      .delete()
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
  }

  const { data: inserted, error } = await supabase
    .from("deal_jackets")
    .insert(payload)
    .select("id")
    .single();
  if (error) throw new Error(`Deal jacket insert failed (${row.jacketNumber}): ${error.message}`);

  const commissionRate =
    row.soldPrice > 0 && profitGross > 0
      ? round2(row.commissionAmount / profitGross)
      : 0.1;
  const commissionStatus = row.commissionStatus === "paid" ? "paid" : "approved";
  const { data: commission, error: commErr } = await supabase
    .from("sales_rep_commissions")
    .insert({
      dealership_id: dealershipId,
      sales_rep_id: salesRepId,
      deal_jacket_id: inserted.id,
      commission_amount: row.commissionAmount,
      commission_rate: commissionRate,
      gross_profit: profitGross,
      sold_price: row.soldPrice,
      status: commissionStatus,
      ...(commissionStatus === "paid" ? { paid_at: dateSold } : {}),
    })
    .select("id")
    .single();
  if (commErr) throw new Error(`Commission insert failed (${row.jacketNumber}): ${commErr.message}`);

  await supabase
    .from("deal_jackets")
    .update({ sales_rep_commission_id: commission.id })
    .eq("id", inserted.id);

  console.log(`   ? ${row.jacketNumber} ? ${row.year} ${row.make} ${row.model}`);
}

async function main() {
  const { dealershipId: requestedId, force } = parseArgs();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !serviceRoleKey) {
    console.error("??? Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
    process.exit(1);
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const dealershipId = await resolveDealershipId(supabase, requestedId);
  const createdBy = await resolveCreatedBy(supabase, dealershipId);

  const repCache = new Map<string, string>();

  console.log("\n?? Seeding deal jackets...\n");

  for (const row of SEED_ROWS) {
    let salesRepId = repCache.get(row.salesRepEmail);
    if (!salesRepId) {
      salesRepId = await ensureSalesRep(
        supabase,
        dealershipId,
        row.salesRepName,
        row.salesRepEmail,
      );
      repCache.set(row.salesRepEmail, salesRepId);
    }

    const customerId = await upsertCustomer(supabase, dealershipId, createdBy, row);
    const vehicleId = await upsertVehicle(
      supabase,
      dealershipId,
      createdBy,
      row,
      force,
    );

    await upsertDealJacket(
      supabase,
      dealershipId,
      createdBy,
      row,
      vehicleId,
      customerId,
      salesRepId,
      force,
    );
  }

  console.log("\n? Done. Open /dashboard/deal-jackets to view seeded data.\n");
}

main().catch((err) => {
  console.error("???", err instanceof Error ? err.message : err);
  process.exit(1);
});
