"use client";

import CpaHeader from "../layout/cpa-header";
import CpaMonthSelector from "./cpa-month-selector";
import CpaDashboardSkeleton from "./cpa-dashboard-skeleton";
import CpaSalesActivity from "./cpa-sales-activity";
import CpaVehiclesSoldTable from "./cpa-vehicles-sold-table";
import CpaSalesTaxSummary from "./cpa-sales-tax-summary";
import CpaPayrollSummary from "./cpa-payroll-summary";
import CpaProfitLossTable from "./cpa-profit-loss-table";
import CpaRevenueProfitChart from "./cpa-revenue-profit-chart";
import CpaDealJacketDonut from "./cpa-deal-jacket-donut";
import CpaFilesWidget from "./cpa-files-widget";
import CpaNotesPreview from "./cpa-notes-preview";
import CpaGeneratePackage from "./cpa-generate-package";
import CpaQuickExport from "./cpa-quick-export";
import CpaAiAssistant from "./cpa-ai-assistant";
import { useCpaPortal } from "../context/cpa-portal-context";
import { PanelPreview } from "@/components/dashboard/PanelPreview";
import { CardShell, CardHead } from "@/components/dashboard/card-shell";
import { KPICard, type KPICardData } from "@/components/ui/kpi-card";
import { KPIChart } from "@/components/dashboard/KPIChart";
import { cn } from "@/lib/utils";
import { Download, FileText } from "lucide-react";

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

const cpaColorToHex: Record<string, string> = {
  green: "#22c55e",
  purple: "#a855f7",
  blue: "#3b82f6",
  red: "#ef4444",
  teal: "#14b8a6",
  orange: "#f97316",
};

const cpaColorToTailwind: Record<string, string> = {
  green: "green",
  purple: "violet",
  blue: "blue",
  red: "red",
  teal: "teal",
  orange: "orange",
};

const sparkPoints =
  "0,40 25,34 50,30 75,28 100,24 125,20 150,18 175,14 200,12 220,8";

function toKpiCardData(kpi: import("@/lib/cpa/types").CpaKpi): KPICardData {
  return {
    icon: kpi.icon as KPICardData["icon"],
    color: cpaColorToTailwind[kpi.color] || "blue",
    label: kpi.label,
    value: kpi.value,
    delta: kpi.delta,
    link: "View Details",
    sparkColor: cpaColorToHex[kpi.color] || "#3b82f6",
    sparkPoints,
  };
}

function ExpandedKpi({ kpi }: { kpi: import("@/lib/cpa/types").CpaKpi }) {
  const hex = cpaColorToHex[kpi.color] || "#3b82f6";
  return (
    <div className="flex h-full flex-col gap-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white">{kpi.label}</h2>
        <p className="mt-0.5 text-sm text-slate-500">Monthly trend for {kpi.label}.</p>
      </div>
      <div className="flex items-baseline gap-4 shrink-0">
        <div className="text-5xl font-bold text-white">{kpi.value}</div>
        <div className={cn("text-base", kpi.deltaPositive ? "text-emerald-400" : "text-red-400")}>{kpi.delta}</div>
      </div>
      <div className="h-64 w-full">
        <KPIChart data={kpi.chartData} color={hex} label={kpi.label} gradId={`kpi-${kpi.label.replace(/[^a-z0-9]/gi, "-")}`} />
      </div>
    </div>
  );
}

export default function CpaDashboardContent() {
  const { dashboard, loading, month, year } = useCpaPortal();
  const monthLabel = `${["January","February","March","April","May","June","July","August","September","October","November","December"][month - 1]?.toUpperCase() ?? "MAY"} ${year}`;

  if (!dashboard && loading) {
    return <CpaDashboardSkeleton />;
  }

  if (!dashboard) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-red-400">
        Unable to load dashboard data.
      </div>
    );
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 z-50 flex items-start justify-center bg-slate-950/60 pt-32 backdrop-blur-[1px]">
          <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-900 px-5 py-3 shadow-2xl">
            <svg className="h-5 w-5 animate-spin text-blue-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span className="text-sm text-slate-300">Updating data…</span>
          </div>
        </div>
      )}
      <CpaHeader />
      <CpaMonthSelector />

      {/* KPI Cards */}
      <div className="mb-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {dashboard.kpis.map((kpi) => (
          <PanelPreview key={kpi.label} title={kpi.label} expanded={<ExpandedKpi kpi={kpi} />}>
            <KPICard data={toKpiCardData(kpi)} showLink={false} />
          </PanelPreview>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-[1fr_320px]">
        <div className="space-y-3.5">
          {/* Sales Activity + Vehicles Sold */}
          <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-3">
            <PanelPreview title="Sales Activity" expanded={
              <div className="space-y-4">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-white">Sales Activity</h2>
                  <p className="mt-0.5 text-sm text-slate-500">{`Sales activity overview for ${monthLabel}.`}</p>
                </div>
                <ul className="space-y-3">
                  {dashboard.salesActivity.map((row) => (
                    <li key={row.label} className="flex items-center justify-between rounded-lg border border-slate-700 bg-[#0e1626] p-3">
                      <span className="text-sm text-slate-300">{row.label}</span>
                      <span className="font-semibold text-white">{row.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            }>
              <CardShell>
                <CardHead title={`SALES ACTIVITY - ${monthLabel}`} />
                <ul className="space-y-2.5">
                  {dashboard.salesActivity.map((row) => (
                    <li key={row.label} className="flex items-center justify-between gap-2">
                      <span className="text-[11.5px] text-slate-300">{row.label}</span>
                      <span className="text-[13px] font-semibold text-white">{row.value}</span>
                    </li>
                  ))}
                </ul>
              </CardShell>
            </PanelPreview>
            <div className="lg:col-span-2">
              <PanelPreview title="Vehicles Sold" expanded={
                <div className="space-y-4">
                  <div className="mb-4">
                    <h2 className="text-lg font-bold text-white">Vehicles Sold</h2>
                    <p className="mt-0.5 text-sm text-slate-500">{`${dashboard.vehiclesSoldTotal} vehicles sold in ${monthLabel}.`}</p>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-500">
                        <th className="px-2 py-2 text-left">Stock</th>
                        <th className="px-2 py-2 text-left">Vehicle</th>
                        <th className="px-2 py-2 text-left">Date</th>
                        <th className="px-2 py-2 text-right">Price</th>
                        <th className="px-2 py-2 text-right">Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.vehiclesSold.map((v) => (
                        <tr key={v.id} className="border-b border-slate-800/60">
                          <td className="px-2 py-2 text-blue-400">{v.stockNumber}</td>
                          <td className="px-2 py-2 text-slate-300">{v.vehicle}</td>
                          <td className="px-2 py-2 text-slate-400">{v.dateSold}</td>
                          <td className="px-2 py-2 text-right text-white">{formatMoney(v.salePrice)}</td>
                          <td className="px-2 py-2 text-right text-emerald-400">{formatMoney(v.grossProfit)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              }>
                <CardShell>
                  <CardHead title={`VEHICLES SOLD - ${monthLabel} (${dashboard.vehiclesSoldTotal} Total)`} />
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px] text-[11.5px]">
                      <thead className="text-slate-500">
                        <tr className="border-b border-slate-800">
                          <th className="px-1.5 py-2 text-left font-medium">Stock</th>
                          <th className="px-1.5 py-2 text-left font-medium">Vehicle</th>
                          <th className="px-1.5 py-2 text-left font-medium">Date</th>
                          <th className="px-1.5 py-2 text-right font-medium">Price</th>
                          <th className="px-1.5 py-2 text-right font-medium">Profit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboard.vehiclesSold.slice(0, 5).map((v) => (
                          <tr key={v.id} className="border-b border-slate-800/60 last:border-0">
                            <td className="px-1.5 py-2 text-blue-400">{v.stockNumber}</td>
                            <td className="px-1.5 py-2 text-slate-300">{v.vehicle}</td>
                            <td className="px-1.5 py-2 text-slate-400">{v.dateSold}</td>
                            <td className="px-1.5 py-2 text-right text-white">{formatMoney(v.salePrice)}</td>
                            <td className="px-1.5 py-2 text-right text-emerald-400">{formatMoney(v.grossProfit)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardShell>
              </PanelPreview>
            </div>
          </div>

          {/* Sales Tax + Payroll */}
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
            <PanelPreview title="Sales Tax Summary" expanded={
              <div className="space-y-4">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-white">Sales Tax Summary</h2>
                  <p className="mt-0.5 text-sm text-slate-500">Quarterly sales tax snapshot with balance and filing details.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-slate-700 bg-[#0e1626] p-4">
                    <div className="text-xs text-slate-500">Taxable Sales</div>
                    <div className="mt-1 text-xl font-bold text-white">{formatMoney(dashboard.salesTax.taxableSales)}</div>
                  </div>
                  <div className="rounded-lg border border-slate-700 bg-[#0e1626] p-4">
                    <div className="text-xs text-slate-500">Tax Collected</div>
                    <div className="mt-1 text-xl font-bold text-white">{formatMoney(dashboard.salesTax.taxCollected)}</div>
                  </div>
                  <div className="rounded-lg border border-slate-700 bg-[#0e1626] p-4">
                    <div className="text-xs text-slate-500">Payments Made</div>
                    <div className="mt-1 text-xl font-bold text-white">{formatMoney(dashboard.salesTax.taxPaymentsMade)}</div>
                  </div>
                  <div className="rounded-lg border border-slate-700 bg-[#0e1626] p-4">
                    <div className="text-xs text-slate-500">Balance Due</div>
                    <div className="mt-1 text-xl font-bold text-red-400">{formatMoney(dashboard.salesTax.balanceDue)}</div>
                  </div>
                </div>
              </div>
            }>
              <CardShell>
                <CardHead title="SALES TAX SUMMARY" pill={monthLabel} />
                <ul className="space-y-2.5">
                  {[
                    { label: "Taxable Sales", value: formatMoney(dashboard.salesTax.taxableSales) },
                    { label: "Tax Collected", value: formatMoney(dashboard.salesTax.taxCollected) },
                    { label: "Payments Made", value: formatMoney(dashboard.salesTax.taxPaymentsMade) },
                    { label: "Balance Due", value: formatMoney(dashboard.salesTax.balanceDue), red: true },
                    { label: "Filing Frequency", value: dashboard.salesTax.filingFrequency },
                    { label: "Due Date", value: dashboard.salesTax.dueDate },
                  ].map((r) => (
                    <li key={r.label} className="flex justify-between text-[11.5px]">
                      <span className="text-slate-500">{r.label}</span>
                      <span className={r.red ? "font-semibold text-red-400" : "text-white"}>{r.value}</span>
                    </li>
                  ))}
                </ul>
              </CardShell>
            </PanelPreview>
            <PanelPreview title="Payroll Summary" expanded={
              <div className="space-y-6">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-white">Payroll Summary</h2>
                  <p className="mt-0.5 text-sm text-slate-500">Monthly payroll breakdown including commissions, bonuses, and taxes.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Total Payroll", value: formatMoney(dashboard.payroll.totalPayroll) },
                    { label: "Employees Paid", value: String(dashboard.payroll.employeesPaid) },
                    { label: "Commissions", value: formatMoney(dashboard.payroll.commissionsPaid) },
                    { label: "Bonuses", value: formatMoney(dashboard.payroll.bonusesPaid) },
                    { label: "Payroll Taxes", value: formatMoney(dashboard.payroll.payrollTaxes) },
                    { label: "Next Payroll", value: dashboard.payroll.nextPayrollDate },
                  ].map((r) => (
                    <div key={r.label} className="rounded-lg border border-slate-700 bg-[#0e1626] p-4">
                      <div className="text-xs text-slate-500">{r.label}</div>
                      <div className="mt-1 text-xl font-bold text-white">{r.value}</div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-500"
                  onClick={() => {}}
                >
                  <Download className="mr-2 inline h-4 w-4" />
                  Export Payroll Report
                </button>
              </div>
            }>
              <CardShell>
                <CardHead title="PAYROLL SUMMARY" pill={monthLabel} />
                <ul className="mb-3 space-y-2 text-[11.5px]">
                  {[
                    { label: "Total Payroll", value: formatMoney(dashboard.payroll.totalPayroll) },
                    { label: "Employees Paid", value: String(dashboard.payroll.employeesPaid) },
                    { label: "Commissions", value: formatMoney(dashboard.payroll.commissionsPaid) },
                    { label: "Bonuses", value: formatMoney(dashboard.payroll.bonusesPaid) },
                    { label: "Payroll Taxes", value: formatMoney(dashboard.payroll.payrollTaxes) },
                    { label: "Next Payroll", value: dashboard.payroll.nextPayrollDate },
                  ].map((r) => (
                    <li key={r.label} className="flex justify-between">
                      <span className="text-slate-500">{r.label}</span>
                      <span className="text-white">{r.value}</span>
                    </li>
                  ))}
                </ul>
              </CardShell>
            </PanelPreview>
          </div>

          {/* P&L Table */}
          <PanelPreview title="Profit & Loss" expanded={
            <div className="space-y-4">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-white">Monthly Profit & Loss</h2>
                <p className="mt-0.5 text-sm text-slate-500">{`Detailed income statement for ${monthLabel}.`}</p>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-500">
                    <th className="py-2 text-left">Line Item</th>
                    <th className="py-2 text-right">Current</th>
                    <th className="py-2 text-right">Previous</th>
                    <th className="py-2 text-right">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.profitLoss.map((row) => (
                    <tr key={row.label} className="border-b border-slate-800/50">
                      <td className="py-2 text-slate-300">{row.label}</td>
                      <td className="py-2 text-right text-white">{row.isMargin ? `${row.current}%` : formatMoney(row.current)}</td>
                      <td className="py-2 text-right text-slate-400">{row.isMargin ? `${row.previous}%` : formatMoney(row.previous)}</td>
                      <td className={`py-2 text-right font-medium ${row.changePct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {row.changePct >= 0 ? "+" : ""}{row.changePct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }>
            <CardShell>
              <CardHead title={`MONTHLY PROFIT & LOSS - ${monthLabel}`} />
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500">
                    <th className="py-2 text-left font-medium">Line Item</th>
                    <th className="py-2 text-right font-medium">Current</th>
                    <th className="py-2 text-right font-medium">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.profitLoss.map((row) => (
                    <tr key={row.label} className="border-b border-slate-800/50">
                      <td className="py-2 text-slate-300">{row.label}</td>
                      <td className="py-2 text-right text-white">{row.isMargin ? `${row.current}%` : formatMoney(row.current)}</td>
                      <td className={`py-2 text-right font-medium ${row.changePct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {row.changePct >= 0 ? "+" : ""}{row.changePct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardShell>
          </PanelPreview>

          {/* Revenue Chart + Deal Jackets */}
          <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
            <PanelPreview title="Revenue & Profit Trend" expanded={
              <div className="space-y-4">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-white">Revenue & Profit Trend</h2>
                  <p className="mt-0.5 text-sm text-slate-500">Monthly revenue and profit performance over time.</p>
                </div>
                <CpaRevenueProfitChart data={dashboard.trend} bare />
              </div>
            }>
              <CardShell>
                <CardHead title="REVENUE & PROFIT TREND" pill={monthLabel} />
                <CpaRevenueProfitChart data={dashboard.trend} bare />
              </CardShell>
            </PanelPreview>
            <PanelPreview title="Deal Jackets" expanded={
              <div className="space-y-4">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-white">Deal Jackets by Status</h2>
                  <p className="mt-0.5 text-sm text-slate-500">{`${dashboard.dealJacketsTotal} total deal jackets by status.`}</p>
                </div>
                <CpaDealJacketDonut segments={dashboard.dealJackets} total={dashboard.dealJacketsTotal} bare />
              </div>
            }>
              <CardShell>
                <CardHead title="DEAL JACKETS BY STATUS" />
                <CpaDealJacketDonut segments={dashboard.dealJackets} total={dashboard.dealJacketsTotal} bare />
              </CardShell>
            </PanelPreview>
          </div>

          {/* Files + Notes + Generate Package */}
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
            <PanelPreview title="Storage" expanded={
              <div className="space-y-6">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-white">Files & Storage</h2>
                  <p className="mt-0.5 text-sm text-slate-500">Document storage and folder usage overview. Click folders to browse files.</p>
                </div>
                <CpaFilesWidget folders={dashboard.storageFolders} bare />
                <div className="rounded-lg border border-slate-700 bg-[#0e1626] p-4">
                  <div className="text-xs text-slate-500">Total Storage Folders</div>
                  <div className="mt-1 text-2xl font-bold text-white">{dashboard.storageFolders.length}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {dashboard.storageFolders.reduce((s, f) => s + f.fileCount, 0)} total files across all folders
                  </div>
                </div>
              </div>
            }>
              <CardShell>
                <CardHead title="FILES & STORAGE" />
                <CpaFilesWidget folders={dashboard.storageFolders} bare />
              </CardShell>
            </PanelPreview>
            <PanelPreview title="Notes" expanded={
              <div className="space-y-6">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-white">Notes & Comments</h2>
                  <p className="mt-0.5 text-sm text-slate-500">All recent notes and activity comments across the dealership.</p>
                </div>
                <CpaNotesPreview notes={dashboard.notePreviews} bare />
                <div className="rounded-lg border border-slate-700 bg-[#0e1626] p-4">
                  <div className="text-xs text-slate-500">{dashboard.notePreviews.length} Recent Notes</div>
                  <div className="mt-1 text-xs text-slate-400">View and manage all notes in the full CPA Notes modal.</div>
                </div>
              </div>
            }>
              <CardShell>
                <CardHead title="NOTES & COMMENTS" />
                <CpaNotesPreview notes={dashboard.notePreviews} bare />
              </CardShell>
            </PanelPreview>
            <PanelPreview title="Generate Package" expanded={
              <div className="space-y-6">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-white">Generate CPA Package</h2>
                  <p className="mt-0.5 text-sm text-slate-500">Compile and export a complete CPA package for your dealership. All documents will be bundled into a single downloadable archive.</p>
                </div>
                <CpaGeneratePackage bare />
                <div className="rounded-lg border border-slate-700 bg-[#0e1626] p-4">
                  <div className="text-xs text-slate-500">Package Contents</div>
                  <ul className="mt-2 space-y-1.5">
                    <li className="flex items-center gap-2 text-xs text-slate-400"><FileText className="h-3.5 w-3.5 text-slate-500" /> Financial reports for current period</li>
                    <li className="flex items-center gap-2 text-xs text-slate-400"><FileText className="h-3.5 w-3.5 text-slate-500" /> Payroll summaries and tax filings</li>
                    <li className="flex items-center gap-2 text-xs text-slate-400"><FileText className="h-3.5 w-3.5 text-slate-500" /> Sales tax returns and payment history</li>
                    <li className="flex items-center gap-2 text-xs text-slate-400"><FileText className="h-3.5 w-3.5 text-slate-500" /> Deal jacket documentation</li>
                  </ul>
                </div>
              </div>
            }>
              <CardShell>
                <CardHead title="GENERATE CPA PACKAGE" />
                <CpaGeneratePackage bare />
              </CardShell>
            </PanelPreview>
          </div>

          {/* Quick Export */}
          <div>
            <p className="mb-2 text-[10px] font-semibold tracking-wider text-slate-500">QUICK EXPORT</p>
            <CpaQuickExport />
          </div>
        </div>

        {/* AI Assistant sidebar */}
        <div className="hidden xl:block">
          <CpaAiAssistant />
        </div>
      </div>

      <div className="mt-4 xl:hidden">
        <CpaAiAssistant />
      </div>
    </div>
  );
}
