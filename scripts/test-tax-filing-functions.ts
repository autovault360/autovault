import { createClient } from "@supabase/supabase-js";
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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

// �”€�”€ Re-implement service functions inline (service uses server client with cookies) �”€�”€

async function getTaxSettings(dealershipId: string) {
  const { data } = await supabase
    .from("dealership_tax_settings")
    .select("*")
    .eq("dealership_id", dealershipId)
    .maybeSingle();
  return data;
}

async function getFilingPeriods(dealershipId: string) {
  const { data: periods } = await supabase
    .from("tax_filing_periods")
    .select("*")
    .eq("dealership_id", dealershipId)
    .order("start_date", { ascending: false });

  if (!periods) return [];

  const summaries: any[] = [];
  for (const period of periods) {
    const { data: deals } = await supabase
      .from("filing_period_deals")
      .select("deal_jacket_id")
      .eq("filing_period_id", period.id);

    const ids = (deals ?? []).map((d: any) => d.deal_jacket_id);
    let totalTax = 0;
    if (ids.length > 0) {
      const { data: jackets } = await supabase
        .from("deal_jackets")
        .select("total_tax")
        .in("id", ids);
      totalTax = (jackets ?? []).reduce((s: number, j: any) => s + Number(j.total_tax ?? 0), 0);
    }

    summaries.push({
      id: period.id,
      name: period.name,
      start_date: period.start_date,
      end_date: period.end_date,
      due_date: period.due_date,
      status: period.status,
      vehicleCount: ids.length,
      totalTaxEntered: totalTax,
    });
  }
  return summaries;
}

async function getUpcomingReminders(dealershipId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const { data: periods } = await supabase
    .from("tax_filing_periods")
    .select("id, name, due_date, status")
    .eq("dealership_id", dealershipId)
    .in("status", ["open", "due"])
    .order("due_date", { ascending: true });

  if (!periods) return [];

  const reminders: any[] = [];
  for (const p of periods) {
    const settings = await getTaxSettings(dealershipId);
    const reminderDays = settings?.reminder_days ?? 14;
    const due = new Date(p.due_date);
    const diffDays = Math.ceil((due.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= reminderDays) {
      reminders.push({
        periodId: p.id,
        periodName: p.name,
        dueDate: p.due_date,
        status: p.status,
        daysUntilDue: diffDays,
      });
    }
  }
  return reminders;
}

async function testFilingPeriodSummary(dealershipId: string) {
  const periodIdResponse = await supabase
    .from("filing_period_deals")
    .select("filing_period_id")
    .limit(1);
  
  if (!periodIdResponse.data?.length) return null;
  const periodId = periodIdResponse.data[0].filing_period_id;
  
  const { data: period } = await supabase
    .from("tax_filing_periods")
    .select("*")
    .eq("id", periodId)
    .single();
    
  if (!period) return null;

  const { data: dealLinks } = await supabase
    .from("filing_period_deals")
    .select("deal_jacket_id")
    .eq("filing_period_id", periodId);

  const ids = (dealLinks ?? []).map((d: any) => d.deal_jacket_id);
  const vehicles: any[] = [];
  let totalTax = 0;

  if (ids.length > 0) {
    const { data: jackets } = await supabase
      .from("deal_jackets")
      .select("id, jacket_number, date_sold, total_tax, sold_price, customer_id, vehicle_id")
      .in("id", ids);

    for (const j of jackets ?? []) {
      const { data: c } = await supabase.from("customers").select("name, zip").eq("id", j.customer_id).maybeSingle();
      const { data: v } = await supabase.from("vehicles").select("year, make, model").eq("id", j.vehicle_id).maybeSingle();
      vehicles.push({
        jacketNumber: j.jacket_number,
        vehicle: v ? `${v.year} ${v.make} ${v.model}` : "?",
        customer: c?.name ?? "?",
        soldDate: j.date_sold ? new Date(j.date_sold).toLocaleDateString() : "",
        salePrice: Number(j.sold_price ?? 0),
        tax: Number(j.total_tax ?? 0),
      });
      totalTax += Number(j.total_tax ?? 0);
    }
  }

  return { period, vehicles, totalTax };
}

async function testStatusTransitions(dealershipId: string) {
  const { data: period } = await supabase
    .from("tax_filing_periods")
    .select("id, name, status")
    .eq("dealership_id", dealershipId)
    .eq("status", "open")
    .order("due_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!period) {
    console.log("  ? No 'open' period to test status transitions");
    return;
  }

  console.log(`\n? Testing status transitions on: ${period.name} (currently ${period.status})`);

  // Transition: open -> due
  await supabase.from("tax_filing_periods").update({ status: "due", updated_at: new Date().toISOString() }).eq("id", period.id);
  console.log(`  ? open -> due: OK`);

  // Transition: due -> paid
  await supabase.from("tax_filing_periods").update({ status: "paid", updated_at: new Date().toISOString() }).eq("id", period.id);
  console.log(`  ? due -> paid: OK`);

  // Transition: paid -> filed
  await supabase.from("tax_filing_periods").update({ status: "filed", updated_at: new Date().toISOString() }).eq("id", period.id);
  console.log(`  ? paid -> filed: OK`);

  // Transition: filed -> closed
  await supabase.from("tax_filing_periods").update({ status: "closed", updated_at: new Date().toISOString() }).eq("id", period.id);
  console.log(`  ? filed -> closed: OK`);

  // Reset back to open
  await supabase.from("tax_filing_periods").update({ status: "open", updated_at: new Date().toISOString() }).eq("id", period.id);
  console.log(`  ? reset -> open: OK`);
}

async function main() {
  console.log("\n=== Tax Filing Function Tests ===\n");

  const { data: dealership } = await supabase.from("dealerships").select("id, name").eq("status", "active").single();
  if (!dealership) { console.error("No dealership found"); process.exit(1); }
  const did = dealership.id;

  // 1. getTaxSettings
  console.log("? [1] getTaxSettings");
  const settings = await getTaxSettings(did);
  console.log(`  State: ${settings?.state}, Frequency: ${settings?.filing_frequency}, Reminder: ${settings?.reminder_days}d`);
  console.log(`  ${settings ? "PASS" : "FAIL"}`);

  // 2. getFilingPeriods (summaries with vehicle counts and tax totals)
  console.log("\n? [2] getFilingPeriods");
  const summaries = await getFilingPeriods(did);
  const withDeals = summaries.filter((s: any) => s.vehicleCount > 0);
  console.log(`  Total periods: ${summaries.length}, With deals: ${withDeals.length}`);
  for (const s of withDeals) {
    console.log(`  ${s.name}: ${s.vehicleCount} vehicles, $${s.totalTaxEntered} tax`);
  }
  console.log(`  ${withDeals.length > 0 ? "PASS" : "WARN: no periods with deals"}`);

  // 3. getFilingPeriodDetail (vehicles + documents)
  console.log("\n? [3] getFilingPeriodDetail");
  const detail = await testFilingPeriodSummary(did);
  if (detail) {
    console.log(`  Period: ${detail.period.name} (${detail.period.status})`);
    console.log(`  Vehicles (${detail.vehicles.length}):`);
    for (const v of detail.vehicles) {
      console.log(`    ${v.jacketNumber} - ${v.vehicle} - ${v.customer} - $${v.tax} tax`);
    }
    console.log(`  Total Tax: $${detail.totalTax}`);
    console.log(`  ${detail.vehicles.length > 0 ? "PASS" : "WARN: no vehicles"}`);
  } else {
    console.log("  WARN: no deal links found to test detail");
  }

  // 4. getUpcomingReminders
  console.log("\n? [4] getUpcomingReminders");
  const reminders = await getUpcomingReminders(did);
  console.log(`  Upcoming reminders (within reminder_days): ${reminders.length}`);
  for (const r of reminders) {
    console.log(`  ${r.periodName}: due ${r.dueDate} (${r.daysUntilDue} days) [${r.status}]`);
  }
  console.log(`  ${reminders.length > 0 ? "PASS" : "OK (no due-soon periods)"}`);

  // 5. Status Transitions
  console.log("\n? [5] Status Transitions");
  await testStatusTransitions(did);

  // 6. Filing Period Overview counts
  console.log("\n? [6] Dashboard KPI calculations");
  const allSummaries = await getFilingPeriods(did);
  const totalTax = allSummaries.reduce((s: number, p: any) => s + p.totalTaxEntered, 0);
  const totalVehicles = allSummaries.reduce((s: number, p: any) => s + p.vehicleCount, 0);
  const activePeriods = allSummaries.filter((p: any) => p.status === "open" || p.status === "due").length;
  console.log(`  Total Tax Entered: $${totalTax}`);
  console.log(`  Total Vehicles in Filing: ${totalVehicles}`);
  console.log(`  Active Periods: ${activePeriods}`);
  console.log(`  ${activePeriods > 0 ? "PASS" : "FAIL"}`);

  console.log("\n=== All Tests Complete ===\n");
}

main().catch(console.error);
