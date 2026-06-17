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

async function main() {
  console.log("\n=== Tax Filing Verification ===\n");

  // 1. Dealership
  const { data: dealership } = await supabase.from("dealerships").select("id, name").eq("status", "active").single();
  console.log("Dealership:", dealership?.name);
  console.log("  ID:", dealership?.id);

  // 2. Tax Settings
  const { data: settings } = await supabase.from("dealership_tax_settings").select("*").eq("dealership_id", dealership?.id).maybeSingle();
  console.log("\nTax Settings:");
  console.log("  State:", settings?.state);
  console.log("  Frequency:", settings?.filing_frequency);
  console.log("  Reminder (days):", settings?.reminder_days);

  // 3. Filing Periods
  const { data: periods, count: pc } = await supabase.from("tax_filing_periods").select("*", { count: "exact" }).eq("dealership_id", dealership?.id).order("start_date", { ascending: true });
  console.log(`\nFiling Periods (${pc} total):`);
  for (const p of periods ?? []) {
    console.log(`  ${p.name}: ${p.start_date} to ${p.end_date} (due: ${p.due_date}) [${p.status}]`);
  }

  // 4. Filing Period Deals
  const { data: links, count: lc } = await supabase
    .from("filing_period_deals")
    .select("id, filing_period_id, deal_jacket_id", { count: "exact" });
  console.log(`\nPeriod-Deal Links (${lc} total):`);

  for (const link of links ?? []) {
    const { data: period } = await supabase.from("tax_filing_periods").select("name").eq("id", link.filing_period_id).single();
    const { data: jacket } = await supabase.from("deal_jackets").select("jacket_number, total_tax, date_sold").eq("id", link.deal_jacket_id).single();
    console.log(`  ${jacket?.jacket_number} (sold ${jacket?.date_sold?.slice(0,10) ?? "?"}, tax: $${jacket?.total_tax ?? 0}) -> ${period?.name}`);
  }

  // 5. Documents
  const { count: dc } = await supabase.from("tax_filing_documents").select("*", { count: "exact", head: true });
  console.log(`\nTax Documents: ${dc}`);

  // 6. Storage bucket
  const { data: buckets } = await supabase.storage.listBuckets();
  const taxBucket = buckets?.find(b => b.name === "tax-filings");
  console.log("\nStorage:", taxBucket ? `tax-filings bucket exists (${taxBucket.id})` : "tax-filings bucket NOT found");

  console.log("\n=== Verification Complete ===\n");
}

main().catch(console.error);
