/**
 * P&L Audit Script
 * Fetches live DB data, runs the full calculation pipeline, and prints every number.
 *
 * Usage: npx tsx scripts/audit-pl-report.ts
 *        npx tsx scripts/audit-pl-report.ts --date-range last_month
 *        npx tsx scripts/audit-pl-report.ts --dealership-id <uuid>
 */

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

// ------ Import P&L functions ------------------------------------------------------------------------------------------------------------------------------------------------
import { finalizePeriodTotals, EMPTY_PERIOD_TOTALS, buildProfitLossReport, buildDailyTrendFromEvents } from "../lib/profit-loss/build-report";
import { aggregatePeriodTotals, buildDailyNetMap, matchesDealType } from "../lib/profit-loss/server/aggregate-pl-data";
import type { PlFilters } from "../lib/profit-loss/types";
import { DEFAULT_PL_FILTERS } from "../lib/profit-loss/types";
import { resolveCurrentPeriod, resolveComparisonPeriod } from "../lib/profit-loss/server/pl-period-utils";

// ------ Helpers ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function fmt$(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
}
function fmtPct(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
}
function fmt(num: number): string {
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function hr(title: string) {
  console.log(`\n${"=".repeat(72)}`);
  console.log(`  ${title}`);
  console.log(`${"=".repeat(72)}`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  let dateRange = "this_month";
  let dealershipId: string | undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--date-range" && args[i + 1]) dateRange = args[++i];
    if (args[i] === "--dealership-id" && args[i + 1]) dealershipId = args[++i];
  }
  return { dateRange, dealershipId };
}

// =========================================================================
//  MAIN
// =========================================================================
async function main() {
  const { dateRange, dealershipId: reqDid } = parseArgs();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  // ------ 1. Resolve dealership ---------------------------------------------------------------------------------------------------------------------------------------
  let dealershipId = reqDid;
  if (!dealershipId) {
    const { data: d } = await supabase
      .from("dealerships")
      .select("id, name")
      .eq("status", "active")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!d) { console.error("No active dealership found"); process.exit(1); }
    dealershipId = d.id;
    console.log(`Dealership: ${d.name} (${d.id})`);
  }

  // ------ 2. Resolve periods ------------------------------------------------------------------------------------------------------------------------------------------------
  const period = resolveCurrentPeriod(dateRange as PlFilters["dateRange"]);
  const comparison = resolveComparisonPeriod(period, "last_month", dateRange as PlFilters["dateRange"]);

  console.log(`Period:         ${period.label}  [${period.start} --- ${period.end}]`);
  console.log(`Comparison:     ${comparison.label}  [${comparison.start} --- ${comparison.end}]`);

  // ------ 3. Fetch raw data ---------------------------------------------------------------------------------------------------------------------------------------------------
  async function fetchPeriod(desc: string, from: string, to: string) {
    console.log(`\n------ Fetching ${desc} (${from} --- ${to}) ------`);

    const { data: jackets } = await supabase
      .from("deal_jackets")
      .select(`sold_price, total_invested, profit_gross, profit_net, commission_amount, total_tax, date_sold, vehicle_id, amount_financed, vehicle:vehicles(acquisition_cost, lot_location)`)
      .eq("dealership_id", dealershipId)
      .is("deleted_at", null)
      .gte("date_sold", `${from}T00:00:00`)
      .lte("date_sold", `${to}T23:59:59`);

    const mappedJackets = (jackets ?? []).map((j: any) => ({
      sold_price: Number(j.sold_price),
      total_invested: Number(j.total_invested),
      profit_gross: Number(j.profit_gross),
      profit_net: Number(j.profit_net),
      commission_amount: Number(j.commission_amount),
      total_tax: Number(j.total_tax),
      date_sold: j.date_sold,
      vehicle_id: j.vehicle_id,
      amount_financed: Number(j.amount_financed),
      acquisition_cost: j.vehicle?.acquisition_cost ? Number(j.vehicle.acquisition_cost) : null,
    }));

    const vehicleIds = [...new Set(mappedJackets.map((j) => j.vehicle_id))];

    const [vResult, dResult] = await Promise.all([
      vehicleIds.length > 0
        ? supabase.from("vehicle_expenses").select("vehicle_id, total_cost, category, repair_type, repair_date").eq("dealership_id", dealershipId).is("deleted_at", null).in("vehicle_id", vehicleIds).gte("repair_date", from).lte("repair_date", to)
        : { data: [] },
      supabase.from("dealership_expenses").select("category, amount, expense_date").eq("dealership_id", dealershipId).is("deleted_at", null).gte("expense_date", from).lte("expense_date", to),
    ]);

    const vehicleExpenses = (vResult.data ?? []).map((r: any) => ({
      vehicle_id: r.vehicle_id,
      total_cost: Number(r.total_cost),
      category: r.category ?? "",
      repair_type: r.repair_type ?? "",
      repair_date: r.repair_date,
    }));

    const dealershipExpenses = (dResult.data ?? []).map((r: any) => ({
      category: r.category,
      amount: Number(r.amount),
      expense_date: r.expense_date,
    }));

    console.log(`  Deal jackets:  ${mappedJackets.length}`);
    console.log(`  Vehicle exp:   ${vehicleExpenses.length}`);
    console.log(`  Dealership exp: ${dealershipExpenses.length}`);

    if (mappedJackets.length > 0) {
      console.log(`\n  ------ Jackets ------`);
      for (const j of mappedJackets) {
        const date = j.date_sold.slice(0, 10);
        console.log(`    ${date}  sold=$${fmt(j.sold_price)}  acq=${j.acquisition_cost != null ? "$"+fmt(j.acquisition_cost) : "null(70%rule)"}  invested=$${fmt(j.total_invested)}  gross=$${fmt(j.profit_gross)}  comm=$${fmt(j.commission_amount)}`);
      }
    }

    if (vehicleExpenses.length > 0) {
      console.log(`\n  ------ Vehicle Expenses ------`);
      for (const e of vehicleExpenses) {
        console.log(`    ${e.vehicle_id}  cost=$${fmt(e.total_cost)}  type="${e.repair_type}"  cat="${e.category}"`);
      }
    }
    if (dealershipExpenses.length > 0) {
      console.log(`\n  ------ Dealership Expenses ------`);
      for (const e of dealershipExpenses) {
        console.log(`    ${e.expense_date?.slice(0, 10)}  cat="${e.category}"  amount=$${fmt(e.amount)}`);
      }
    }

    const totals = aggregatePeriodTotals(mappedJackets, vehicleExpenses, dealershipExpenses);
    const dailyNet = buildDailyNetMap(mappedJackets, dealershipExpenses);

    return { totals, dailyNet, soldVehicleCount: mappedJackets.length };
  }

  const current = await fetchPeriod("current period", period.start, period.end);
  const previous = await fetchPeriod("comparison period", comparison.start, comparison.end);

  // ------ 4. Build daily trends ---------------------------------------------------------------------------------------------------------------------------------------
  const dailyTrend = buildDailyTrendFromEvents(period.start, period.end, current.dailyNet);
  const comparisonDailyTrend = buildDailyTrendFromEvents(comparison.start, comparison.end, previous.dailyNet);

  // ------ 5. Build report ---------------------------------------------------------------------------------------------------------------------------------------------------------
  const report = buildProfitLossReport({
    thisMonth: current.totals,
    lastMonth: previous.totals,
    period: { start: period.start, end: period.end, label: period.label, columnLabel: period.columnLabel },
    comparisonPeriod: { start: comparison.start, end: comparison.end, label: comparison.label, columnLabel: comparison.columnLabel },
    dailyTrend,
    comparisonDailyTrend,
    soldVehicleCount: current.soldVehicleCount,
  });

  // ------ 6. PRINT REPORT ---------------------------------------------------------------------------------------------------------------------------------------------------------
  hr("PROFIT & LOSS STATEMENT");

  console.log(`\nRevenue Section:`);
  const revRows = report.statementRows.filter(r => r.section === "revenue");
  for (const r of revRows) {
    console.log(`  ${r.label.padEnd(25)} this=${r.thisMonth != null ? fmt$(r.thisMonth).padStart(12) : "".padStart(12)}  last=${r.lastMonth != null ? fmt$(r.lastMonth).padStart(12) : "".padStart(12)}`);
  }

  console.log(`\nCOGS Section:`);
  const cogsRows = report.statementRows.filter(r => r.section === "cogs");
  for (const r of cogsRows) {
    console.log(`  ${r.label.padEnd(25)} this=${r.thisMonth != null ? fmt$(r.thisMonth).padStart(12) : "".padStart(12)}  last=${r.lastMonth != null ? fmt$(r.lastMonth).padStart(12) : "".padStart(12)}`);
  }

  console.log(`\nGross Profit:`);
  const gpRow = report.statementRows.find(r => r.id === "gross-profit")!;
  console.log(`  ${gpRow.label.padEnd(25)} this=${fmt$(gpRow.thisMonth!).padStart(12)}  last=${fmt$(gpRow.lastMonth!).padStart(12)}`);

  console.log(`\nOperating Expenses:`);
  const opRows = report.statementRows.filter(r => r.section === "operating_expenses");
  for (const r of opRows) {
    console.log(`  ${r.label.padEnd(25)} this=${r.thisMonth != null ? fmt$(r.thisMonth).padStart(12) : "".padStart(12)}  last=${r.lastMonth != null ? fmt$(r.lastMonth).padStart(12) : "".padStart(12)}`);
  }

  console.log(`\nNet Operating Income:`);
  const noiRow = report.statementRows.find(r => r.id === "net-op-income")!;
  console.log(`  ${noiRow.label.padEnd(25)} this=${fmt$(noiRow.thisMonth!).padStart(12)}  last=${fmt$(noiRow.lastMonth!).padStart(12)}`);

  console.log(`\nTaxes:`);
  const taxRows = report.statementRows.filter(r => r.section === "taxes");
  for (const r of taxRows) {
    console.log(`  ${r.label.padEnd(25)} this=${r.thisMonth != null ? fmt$(r.thisMonth).padStart(12) : "".padStart(12)}  last=${r.lastMonth != null ? fmt$(r.lastMonth).padStart(12) : "".padStart(12)}`);
  }

  console.log(`\nNet Profit:`);
  const npRow = report.statementRows.find(r => r.id === "net-profit")!;
  console.log(`  ${npRow.label.padEnd(25)} this=${fmt$(npRow.thisMonth!).padStart(12)}  last=${fmt$(npRow.lastMonth!).padStart(12)}`);

  // ------ 7. VERIFICATION ---------------------------------------------------------------------------------------------------------------------------------------------------------
  hr("FORMULA VERIFICATION");

  const t = current.totals;
  const p = previous.totals;

  console.log(`\n---- Derived Totals (Current Period):`);
  console.log(`  total_revenue         = vehicle_sales + other_income`);
  console.log(`                         = ${fmt$(t.vehicle_sales)} + ${fmt$(t.other_income)}`);
  console.log(`                         = ${fmt$(t.total_revenue)}`);
  verify(t.vehicle_sales + t.other_income, t.total_revenue);

  console.log(`\n  total_cogs            = purchases + auction + transport + recon + parts`);
  console.log(`                         = ${fmt$(t.vehicle_purchases)} + ${fmt$(t.auction_fees)} + ${fmt$(t.transportation)} + ${fmt$(t.reconditioning)} + ${fmt$(t.parts_supplies)}`);
  const cogsCalc = t.vehicle_purchases + t.auction_fees + t.transportation + t.reconditioning + t.parts_supplies;
  console.log(`                         = ${fmt$(cogsCalc)}`);
  verify(cogsCalc, t.total_cogs);

  console.log(`\n  gross_profit          = total_revenue - total_cogs`);
  console.log(`                         = ${fmt$(t.total_revenue)} - ${fmt$(t.total_cogs)}`);
  console.log(`                         = ${fmt$(t.gross_profit)}`);
  verify(t.total_revenue - t.total_cogs, t.gross_profit);

  console.log(`\n  total_expenses        = sum of 8 op-ex categories`);
  console.log(`                         = ${fmt$(t.payroll)} + ${fmt$(t.rent)} + ${fmt$(t.advertising)} + ${fmt$(t.utilities)} + ${fmt$(t.software)} + ${fmt$(t.insurance)} + ${fmt$(t.office)} + ${fmt$(t.other_expenses)}`);
  const expCalc = t.payroll + t.rent + t.advertising + t.utilities + t.software + t.insurance + t.office + t.other_expenses;
  console.log(`                         = ${fmt$(expCalc)}`);
  verify(expCalc, t.total_expenses);

  console.log(`\n  net_operating_income  = gross_profit - total_expenses`);
  console.log(`                         = ${fmt$(t.gross_profit)} - ${fmt$(t.total_expenses)}`);
  console.log(`                         = ${fmt$(t.net_operating_income)}`);
  verify(t.gross_profit - t.total_expenses, t.net_operating_income);

  console.log(`\n  net_profit            = net_operating_income - tax_expense`);
  console.log(`                         = ${fmt$(t.net_operating_income)} - ${fmt$(t.tax_expense)}`);
  console.log(`                         = ${fmt$(t.net_profit)}`);
  verify(t.net_operating_income - t.tax_expense, t.net_profit);

  // ------ 8. KPI VERIFICATION ---------------------------------------------------------------------------------------------------------------------------------------------
  hr("KPI ANALYSIS");

  const margin = t.total_revenue ? (t.net_profit / t.total_revenue) * 100 : 0;
  const prevMargin = p.total_revenue ? (p.net_profit / p.total_revenue) * 100 : 0;
  const marginDelta = margin - prevMargin;

  const kpiData = [
    { id: "total_revenue", label: "Total Revenue", cur: t.total_revenue, prev: p.total_revenue, isMargin: false },
    { id: "total_cogs", label: "Total COGS", cur: t.total_cogs, prev: p.total_cogs, isMargin: false },
    { id: "gross_profit", label: "Gross Profit", cur: t.gross_profit, prev: p.gross_profit, isMargin: false },
    { id: "total_expenses", label: "Total Expenses", cur: t.total_expenses, prev: p.total_expenses, isMargin: false },
    { id: "net_profit", label: "Net Profit", cur: t.net_profit, prev: p.net_profit, isMargin: false },
    { id: "net_profit_margin", label: "Net Profit Margin", cur: margin, prev: prevMargin, isMargin: true },
  ];

  for (const k of kpiData) {
    const delta = k.isMargin ? marginDelta : computePct(k.cur, k.prev);
    const expected = k.isMargin ? `${k.cur.toFixed(1)}%` : fmt$(k.cur);
    console.log(`  ${k.label.padEnd(25)} ${expected.padStart(14)}  vs ${fmt$(k.prev).padStart(12)}  -- ${k.isMargin ? `${k.cur >= 0 ? "+" : ""}${(k.cur).toFixed(1)}%` : fmtPct(delta)}`);
  }

  // ------ 9. BREAKDOWNS ---------------------------------------------------------------------------------------------------------------------------------------------------------------
  hr("BREAKDOWNS");

  console.log(`\nRevenue Breakdown:`);
  for (const item of report.revenueBreakdown) {
    console.log(`  ${item.label.padEnd(25)} ${fmt$(item.amount).padStart(12)}  ${item.percentOfTotal.toFixed(1)}% of total`);
  }

  console.log(`\nExpense Breakdown:`);
  for (const item of report.expenseBreakdown) {
    console.log(`  ${item.label.padEnd(25)} ${fmt$(item.amount).padStart(12)}  ${item.percentOfTotal.toFixed(1)}% of total`);
  }

  // ------ 10. INSIGHTS ------------------------------------------------------------------------------------------------------------------------------------------------------------------
  hr("INSIGHTS");
  for (const ins of report.insights) {
    console.log(`  [${ins.icon}] ${ins.text}`);
  }

  // ------ 11. DAILY TREND ---------------------------------------------------------------------------------------------------------------------------------------------------------
  hr("DAILY NET PROFIT TREND");
  console.log(`  (${dailyTrend.length} data points, sampled from ${period.start} --- ${period.end})`);
  for (const pt of dailyTrend) {
    console.log(`  ${pt.date}  ${pt.label.padEnd(10)}  ${fmt$(pt.netProfit)}`);
  }

  // ------ 12. SUMMARY ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
  hr("SUMMARY");
  console.log(`  Vehicles Sold:       ${current.soldVehicleCount}`);
  console.log(`  Total Revenue:       ${fmt$(t.total_revenue)}`);
  console.log(`  Gross Profit:        ${fmt$(t.gross_profit)}`);
  console.log(`  Net Profit:          ${fmt$(t.net_profit)}`);
  console.log(`  Net Profit Margin:   ${margin.toFixed(1)}%`);
  console.log(`  Profit/Vehicle:      ${current.soldVehicleCount > 0 ? fmt$(t.net_profit / current.soldVehicleCount) : "N/A"}`);
  console.log(`  Total Expenses:      ${fmt$(t.total_expenses)}`);
  console.log(`  Revenue Change:      ${fmtPct(computePct(t.total_revenue, p.total_revenue))}`);
  console.log(`  Net Profit Change:   ${fmtPct(computePct(t.net_profit, p.net_profit))}`);
  console.log(`  Margin Change:       ${marginDelta >= 0 ? "+" : ""}${marginDelta.toFixed(1)} pts`);
  console.log(`  Data Source:         Supabase (live)`);
  console.log(`  Period:              ${period.label}`);
  console.log(`  Comparison:          ${comparison.label}`);

  // ------ ALL CHECKS ------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  const allPass = runAllVerifications(t, p, current);
  console.log(`\n  Verdict: ${allPass ? "--- ALL CHECKS PASSED" : "----- SOME CHECKS FAILED"}`);
}

// ------ Helpers ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function verify(expected: number, actual: number, precision = 2) {
  const diff = Math.abs(expected - actual);
  if (diff > 0.01) {
    console.log(`  ----- MISMATCH: expected=${fmt$(expected)}  actual=${fmt$(actual)}  diff=${fmt$(diff)}`);
  } else {
    console.log(`  --- OK`);
  }
}

function computePct(cur: number, prev: number): number {
  if (prev === 0) return cur === 0 ? 0 : 100;
  return ((cur - prev) / Math.abs(prev)) * 100;
}

function runAllVerifications(t: typeof EMPTY_PERIOD_TOTALS, p: typeof EMPTY_PERIOD_TOTALS, current: any): boolean {
  let allOk = true;
  const checks: { label: string; expected: number; actual: number }[] = [
    { label: "total_revenue = vehicle_sales + other_income", expected: t.vehicle_sales + t.other_income, actual: t.total_revenue },
    { label: "total_cogs = sum of COGS lines", expected: t.vehicle_purchases + t.auction_fees + t.transportation + t.reconditioning + t.parts_supplies, actual: t.total_cogs },
    { label: "gross_profit = revenue - cogs", expected: t.total_revenue - t.total_cogs, actual: t.gross_profit },
    { label: "total_expenses = sum of op-ex", expected: t.payroll + t.rent + t.advertising + t.utilities + t.software + t.insurance + t.office + t.other_expenses, actual: t.total_expenses },
    { label: "net_operating_income = gp - expenses", expected: t.gross_profit - t.total_expenses, actual: t.net_operating_income },
    { label: "net_profit = noi - tax", expected: t.net_operating_income - t.tax_expense, actual: t.net_profit },
  ];

  for (const c of checks) {
    const ok = Math.abs(c.expected - c.actual) <= 0.01;
    if (!ok) {
      console.log(`  ----- ${c.label}: expected ${fmt$(c.expected)}, got ${fmt$(c.actual)}`);
      allOk = false;
    }
  }
  return allOk;
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
