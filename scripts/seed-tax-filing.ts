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

async function resolveDealershipId(supabase: SupabaseClient): Promise<string> {
  const { data } = await supabase
    .from("dealerships")
    .select("id, name")
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!data) throw new Error("No active dealership found");
  console.log(`  ? Using dealership: ${data.name} (${data.id})`);
  return data.id;
}

async function main() {
  console.log("\n============================================");
  console.log("  AutoVault360 ? Tax Filing Seeder");
  console.log("============================================\n");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const dealershipId = await resolveDealershipId(supabase);
  const today = new Date();
  const currentYear = today.getFullYear();

  // ── Step 1: Dealership Tax Settings ──
  console.log("\n? [1/4] Dealership Tax Settings");

  const { error: settingsErr } = await supabase
    .from("dealership_tax_settings")
    .upsert(
      {
        dealership_id: dealershipId,
        state: "CA",
        filing_frequency: "quarterly",
        reminder_days: 14,
      },
      { onConflict: "dealership_id" },
    );

  if (settingsErr) {
    console.error(`  ?? Settings error: ${settingsErr.message}`);
    process.exit(1);
  }
  console.log("  ? Tax settings: CA, quarterly, 14-day reminder");

  // ── Step 2: Filing Periods ──
  console.log("\n? [2/4] Filing Periods");

  const quarterNames = ["Q1", "Q2", "Q3", "Q4"];
  const quarterMonths = [0, 3, 6, 9];
  const periods: {
    name: string;
    start_date: string;
    end_date: string;
    due_date: string;
  }[] = [];

  // Generate 4 quarters for current and previous year
  for (const yearOffset of [-1, 0]) {
    const year = currentYear + yearOffset;
    for (let qi = 0; qi < 4; qi++) {
      const startDate = new Date(year, quarterMonths[qi], 1);
      const endDate = new Date(year, quarterMonths[qi] + 3, 0);
      const dueDate = new Date(year, quarterMonths[qi] + 3, 20);
      periods.push({
        name: `${quarterNames[qi]} ${year}`,
        start_date: startDate.toISOString().slice(0, 10),
        end_date: endDate.toISOString().slice(0, 10),
        due_date: dueDate.toISOString().slice(0, 10),
      });
    }
  }

  // Also generate monthly periods for current year
  for (let mi = 0; mi < 12; mi++) {
    const monthStart = new Date(currentYear, mi, 1);
    const monthEnd = new Date(currentYear, mi + 1, 0);
    const dueDate = new Date(currentYear, mi + 1, 20);
    periods.push({
      name: monthStart.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      start_date: monthStart.toISOString().slice(0, 10),
      end_date: monthEnd.toISOString().slice(0, 10),
      due_date: dueDate.toISOString().slice(0, 10),
    });
  }

  // Remove duplicates (quarterly + monthly might overlap but that's fine)
  const { data: existingPeriods } = await supabase
    .from("tax_filing_periods")
    .select("name")
    .eq("dealership_id", dealershipId);

  const existingNames = new Set((existingPeriods ?? []).map((p: { name: string }) => p.name));
  const toInsert = periods.filter((p) => !existingNames.has(p.name));

  if (toInsert.length > 0) {
    const rows = toInsert.map((p) => ({
      dealership_id: dealershipId,
      ...p,
      status: new Date(p.due_date) < today ? "due" : "open",
    }));
    const { data: inserted, error: periodErr } = await supabase
      .from("tax_filing_periods")
      .insert(rows)
      .select("id, name");

    if (periodErr) {
      console.error(`  ?? Periods error: ${periodErr.message}`);
      process.exit(1);
    }
    console.log(`  ? Inserted ${inserted?.length ?? 0} filing periods`);
  } else {
    console.log("  ? All periods already exist");
  }

  // ── Step 3: Fetch all inserted periods for assignment ──
  const { data: allPeriods } = await supabase
    .from("tax_filing_periods")
    .select("id, start_date, end_date")
    .eq("dealership_id", dealershipId)
    .order("start_date", { ascending: true });

  if (!allPeriods || allPeriods.length === 0) {
    console.error("  ?? No filing periods found");
    process.exit(1);
  }

  // ── Step 4: Assign Deal Jackets to Periods ──
  console.log("\n? [3/4] Assign Deal Jackets to Filing Periods");

  const { data: jackets } = await supabase
    .from("deal_jackets")
    .select("id, jacket_number, date_sold, total_tax")
    .eq("dealership_id", dealershipId)
    .not("date_sold", "is", null);

  if (!jackets || jackets.length === 0) {
    console.log("  ? No sold deal jackets found to assign");
  } else {
    let assigned = 0;
    for (const jacket of jackets) {
      const soldDate = new Date(jacket.date_sold).toISOString().slice(0, 10);

      const matchingPeriod = allPeriods.find(
        (p) => soldDate >= p.start_date && soldDate <= p.end_date,
      );

      if (!matchingPeriod) {
        console.log(`  ?? No period for ${jacket.jacket_number} (sold ${soldDate})`);
        continue;
      }

      const { error: linkErr } = await supabase
        .from("filing_period_deals")
        .upsert(
          {
            filing_period_id: matchingPeriod.id,
            deal_jacket_id: jacket.id,
          },
          { onConflict: "filing_period_id, deal_jacket_id" },
        );

      if (linkErr) {
        console.log(`  ?? Link error ${jacket.jacket_number}: ${linkErr.message}`);
      } else {
        assigned++;
      }
    }
    console.log(`  ? Assigned ${assigned}/${jackets.length} deal jackets to periods`);
  }

  // ── Summary ──
  console.log("\n? [4/4] Verification");

  const { count: periodCount } = await supabase
    .from("tax_filing_periods")
    .select("*", { count: "exact", head: true })
    .eq("dealership_id", dealershipId);

  const { count: linkCount } = await supabase
    .from("filing_period_deals")
    .select("*", { count: "exact", head: true });

  const { count: docCount } = await supabase
    .from("tax_filing_documents")
    .select("*", { count: "exact", head: true });

  console.log(`  ? Tax settings:  1 record`);
  console.log(`  ? Filing periods: ${periodCount}`);
  console.log(`  ? Period-deal links: ${linkCount}`);
  console.log(`  ? Tax documents:  ${docCount}`);

  console.log("\n============================================");
  console.log("  Tax Filing Seed Complete! ?");
  console.log("============================================\n");
}

main().catch((err) => {
  console.error("\n??? Seed failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
