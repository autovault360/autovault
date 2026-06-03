import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminHeader from "@/components/layout/AdminHeader";
import {
  Car,
  Tag,
  DollarSign,
  TrendingDown,
  BarChart3,
  Bell,
  Calendar,
  FileText,
  CheckCircle,
  PieChart,
  Info,
  ChevronLeft,
  ChevronRightIcon,
  Wrench,
  FileWarning,
  ClipboardList,
  BellRing,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { KPICard, type KPICardData } from "@/components/ui/kpi-card";
import { PanelPreview } from "@/components/dashboard/PanelPreview";
import { KPIChart } from "@/components/dashboard/KPIChart";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, role")
    .eq("auth_user_id", user.id)
    .single();

  return (
    <div>
      <AdminHeader />

      {/* Welcome */}
      <section className="mb-3.5 flex flex-wrap items-center justify-between gap-3 px-0.5">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {profile?.full_name?.split(" ")[0] || "User"}!
          </h1>
          <p className="mt-0.5 text-[12.5px] text-slate-500">
            Here&apos;s what&apos;s happening with your dealership today.
          </p>
        </div>
        <Select defaultValue="today">
          <SelectTrigger className="h-9 gap-1.5 border-slate-800 bg-[#0e1626] px-3.5 py-2 text-[12.5px] text-slate-300">
            <Calendar className="h-3.5 w-3.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-slate-800 bg-[#0e1626] text-slate-300">
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="this-week">This Week</SelectItem>
            <SelectItem value="this-month">This Month</SelectItem>
            <SelectItem value="last-month">Last Month</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
      </section>

      <div>
        {/* KPI + Compare */}
        <section className="mb-3.5 grid gap-3.5 2xl:grid-cols-[1fr_380px]">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
            {kpis.map((k) => (
              <PanelPreview key={k.label} title={k.label} expanded={<ExpandedKPI data={k} />}>
                <KPICard data={k} />
              </PanelPreview>
            ))}
          </div>
          <PanelPreview title="Last Month vs This Month" expanded={<ExpandedComparison />}>
            <CardShell>
            <CardHead title="LAST MONTH vs THIS MONTH" pill="This Month" />
            <table className="w-full text-[11.5px]">
              <thead className="text-slate-500">
                <tr className="border-b border-slate-800">
                  {["Metric", "Last Month", "This Month", "Change"].map((h) => (
                    <th key={h} className="px-1 py-1.5 text-left font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {compareRows.map(([m, l, t, c, pos]) => (
                  <tr
                    key={m as string}
                    className="border-b border-slate-800/60 last:border-0"
                  >
                    <td className="px-1 py-2 text-slate-200">{m as string}</td>
                    <td className="px-1 py-2 text-slate-300">{l as string}</td>
                    <td className="px-1 py-2 text-slate-300">{t as string}</td>
                    <td
                      className={cn(
                        "px-1 py-2 font-medium",
                        pos ? "text-emerald-400" : "text-red-400",
                      )}
                    >
                      {c as string}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardShell>
          </PanelPreview>
        </section>
      </div>

      {/* Charts */}
      <section className="mb-3.5 grid gap-3.5 md:grid-cols-2 2xl:grid-cols-[1.1fr_1fr_1fr_1.3fr]">
        <PanelPreview title="Profit & Loss Overview" expanded={<ExpandedPnL />}>
          <CardShell>
          <CardHead title="PROFIT & LOSS OVERVIEW" pill="This Month" />
          <div className="mb-2 flex items-start justify-between">
            <div>
              <div className="text-[11px] text-slate-500">Total Net Profit</div>
              <div className="text-[22px] font-bold text-emerald-400">
                $32,560
              </div>
              <div className="text-[10.5px] text-emerald-400">
                ↑ 15.3% vs last month
              </div>
            </div>
            <div className="space-y-1 text-right text-[11px]">
              <div>
                <Dot c="bg-emerald-500" />
                Total Income <b className="ml-2 text-white">$98,450</b>
              </div>
              <div>
                <Dot c="bg-red-500" />
                Total Expenses <b className="ml-2 text-white">$16,190</b>
              </div>
              <div>
                <Dot c="bg-blue-500" />
                Net Profit <b className="ml-2 text-white">$32,560</b>
              </div>
            </div>
          </div>
          <svg
            viewBox="0 0 560 220"
            preserveAspectRatio="none"
            className="h-44 w-full"
          >
            <g stroke="#1f2937" strokeWidth="1">
              {[40, 80, 120, 160, 200].map((y) => (
                <line key={y} x1="40" y1={y} x2="560" y2={y} />
              ))}
            </g>
            <g fill="#6b7280" fontSize="10">
              {["$100K", "$80K", "$60K", "$40K", "$20K"].map((t, i) => (
                <text key={t} x="0" y={44 + i * 40}>
                  {t}
                </text>
              ))}
              <text x="10" y="218">
                $0
              </text>
            </g>
            <polyline
              fill="none"
              stroke="#22c55e"
              strokeWidth="2.5"
              points="50,140 110,110 170,100 230,90 290,75 350,70 410,55 470,45 530,40"
            />
            <polyline
              fill="none"
              stroke="#ef4444"
              strokeWidth="2.5"
              points="50,180 110,170 170,165 230,160 290,150 350,145 410,140 470,135 530,130"
            />
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2.5"
              points="50,170 110,160 170,150 230,140 290,130 350,120 410,110 470,100 530,90"
            />
            <g fill="#22c55e">
              {[
                [50, 140],
                [110, 110],
                [170, 100],
                [230, 90],
                [290, 75],
                [350, 70],
                [410, 55],
                [470, 45],
                [530, 40],
              ].map(([x, y]) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r="3" />
              ))}
            </g>
            <g fill="#6b7280" fontSize="10">
              {[
                ["May 1", 44],
                ["May 5", 104],
                ["May 10", 164],
                ["May 15", 224],
                ["May 20", 284],
                ["May 25", 344],
                ["May 31", 404],
              ].map(([t, x]) => (
                <text key={t as string} x={x as number} y="216">
                  {t as string}
                </text>
              ))}
            </g>
          </svg>
        </CardShell>
        </PanelPreview>

        <PanelPreview title="Expenses Breakdown" expanded={<ExpandedExpenses />}>
          <CardShell>
          <CardHead title="EXPENSES BREAKDOWN" pill="This Month" />
          <Donut
            center="$16,190"
            label="Total Expenses"
            segments={[
              { color: "#22c55e", value: 38.6 },
              { color: "#3b82f6", value: 21.3 },
              { color: "#a855f7", value: 14.2 },
              { color: "#f59e0b", value: 11.4 },
              { color: "#ef4444", value: 4.6 },
              { color: "#06b6d4", value: 4.0 },
              { color: "#6b7280", value: 5.8 },
            ]}
          />
          <ul className="mt-3 space-y-1.5 text-[11px]">
            {expenseLegend.map(([c, l, v]) => (
              <li key={l} className="flex items-center">
                <Dot c={c} />
                {l}
                <b className="ml-auto font-medium text-slate-400">{v}</b>
              </li>
            ))}
          </ul>
        </CardShell>
        </PanelPreview>

        <PanelPreview title="Payroll Breakdown" expanded={<ExpandedPayroll />}>
          <CardShell>
          <CardHead title="PAYROLL BREAKDOWN" pill="This Month" info />
          <Donut
            center="$21,435"
            label="Total Payroll"
            segments={[
              { color: "#22c55e", value: 58 },
              { color: "#3b82f6", value: 29.3 },
              { color: "#f59e0b", value: 8.8 },
              { color: "#a855f7", value: 2.7 },
              { color: "#ef4444", value: 1.2 },
            ]}
          />
          <ul className="mt-3 space-y-1.5 text-[11px]">
            {payrollLegend.map(([c, l, v]) => (
              <li key={l} className="flex items-center">
                <Dot c={c} />
                {l}
                <b className="ml-auto font-medium text-slate-400">{v}</b>
              </li>
            ))}
          </ul>
        </CardShell>
        </PanelPreview>

        <PanelPreview title="Calendar" expanded={<ExpandedCalendar />}>
          <CardShell className="md:col-span-2 2xl:col-span-1">
          <div className="mb-2.5 flex items-center justify-between">
            <div className="text-[11px] font-bold tracking-[0.14em] text-slate-500">
              CALENDAR
            </div>
            <div className="flex items-center gap-1.5 text-[11.5px] text-slate-300">
              <span className="mr-1">May 20 – May 26, 2026</span>
              <button className="grid h-6 w-6 place-items-center rounded-md border border-slate-800 bg-slate-900">
                <ChevronLeft className="h-3 w-3" />
              </button>
              <button className="grid h-6 w-6 place-items-center rounded-md border border-slate-800 bg-slate-900">
                <ChevronRightIcon className="h-3 w-3" />
              </button>
              <button className="rounded-md border border-slate-800 bg-slate-900 px-2.5 py-0.5 text-[11px]">
                Today
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="grid min-w-[520px] grid-cols-[42px_repeat(7,1fr)] gap-0.5 text-[9.5px]">
              <div />
              {calDays.map((d) => (
                <div
                  key={d}
                  className="py-1 text-center text-[10px] text-slate-500"
                >
                  {d}
                </div>
              ))}
              {calHours.map((h, hi) => [
                <div
                  key={`h-${h}`}
                  className="border-t border-slate-800 pr-1 pt-1 text-right text-[10px] text-slate-500"
                >
                  {h}
                </div>,
                ...[0, 1, 2, 3, 4, 5, 6].map((d) => {
                  const ev = events.find((e) => e.day === d && e.hour === hi);
                  return (
                    <div
                      key={`d-${hi}-${d}`}
                      className="min-h-[22px] rounded-[4px] border-t border-slate-800 p-0.5"
                    >
                      {ev && (
                        <div
                          className={cn(
                            "flex flex-col rounded-md px-1 py-0.5 text-[9px] leading-tight text-white",
                            ev.color,
                          )}
                        >
                          <span className="font-semibold">{ev.title}</span>
                          <span className="text-[8px] opacity-80">
                            {ev.time}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                }),
              ])}
            </div>
          </div>
          <ViewMore label="View Full Calendar" />
        </CardShell>
        </PanelPreview>
      </section>

      {/* Deals + Top vehicles */}
      <section className="mb-3.5 grid gap-3.5 xl:grid-cols-[1.4fr_1fr]">
        <PanelPreview title="Recent Deal Activity" expanded={<ExpandedDeals />}>
          <CardShell>
          <CardHead title="RECENT DEAL ACTIVITY" pill="This Month" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-[11.5px]">
              <thead className="text-slate-500">
                <tr className="border-b border-slate-800">
                  {[
                    "Deal #",
                    "Customer",
                    "Vehicle",
                    "Status",
                    "Sales Price",
                    "Profit",
                    "Date",
                  ].map((h) => (
                    <th key={h} className="px-1.5 py-2 text-left font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deals.map((r) => (
                  <tr
                    key={r[0]}
                    className="border-b border-slate-800/60 last:border-0"
                  >
                    <td className="px-1.5 py-2 text-slate-300">{r[0]}</td>
                    <td className="px-1.5 py-2 text-slate-200">{r[1]}</td>
                    <td className="px-1.5 py-2 text-slate-300">{r[2]}</td>
                    <td className="px-1.5 py-2">
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-[10px] font-semibold",
                          statusStyle[r[3]],
                        )}
                      >
                        {r[3]}
                      </span>
                    </td>
                    <td className="px-1.5 py-2 text-slate-300">{r[4]}</td>
                    <td className="px-1.5 py-2 text-emerald-400">{r[5]}</td>
                    <td className="px-1.5 py-2 text-slate-400">{r[6]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ViewMore label="View All Deals" />
        </CardShell>
        </PanelPreview>

        <PanelPreview title="Top Vehicles by Gross Profit" expanded={<ExpandedTopVehicles />}>
          <CardShell>
          <CardHead title="TOP VEHICLES BY GROSS PROFIT" pill="This Month" />
          <ul className="space-y-2.5">
            {topVehicles.map((v) => (
              <li
                key={v.vin}
                className="flex items-center gap-2.5 border-b border-slate-800/60 pb-2 last:border-0"
              >
                <img
                  src={v.img}
                  alt={v.title}
                  className="h-9 w-14 rounded-md object-cover"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-semibold text-white">
                    {v.title}
                  </div>
                  <div className="truncate text-[10px] text-slate-500">
                    VIN: {v.vin}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[13px] font-bold text-emerald-400">
                    {v.profit}
                  </div>
                  <div className="text-[10px] text-slate-500">Profit</div>
                </div>
              </li>
            ))}
          </ul>
          <ViewMore label="View All Vehicles" />
        </CardShell>
        </PanelPreview>
      </section>

      {/* Bottom row */}
      <section className="grid gap-3.5 lg:grid-cols-3">
        <PanelPreview title="CDTFA Quarterly Snapshot" expanded={<ExpandedCDTFA />}>
          <CardShell>
          <CardHead title="CDTFA QUARTERLY SNAPSHOT" pill="Q2 2025" />
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <Snap label="Taxable Sales" value="$245,750" />
            <Snap label="Sales Tax (7.75%)" value="$19,034" />
            <Snap label="Payments Made" value="$10,584" />
            <Snap label="Balance Due" value="$8,450" red />
          </div>
          <ViewMore label="View CDTFA Report" />
        </CardShell>
        </PanelPreview>

        <PanelPreview title="Audit Readiness" expanded={<ExpandedAudit />}>
          <CardShell>
          <CardHead title="AUDIT READINESS" info />
          <div className="flex items-center gap-3.5">
            <div className="relative h-28 w-28 shrink-0">
              <svg viewBox="0 0 120 120" className="h-full w-full">
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  fill="none"
                  stroke="#1f2a3d"
                  strokeWidth="14"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="14"
                  strokeDasharray="277 302"
                  transform="rotate(-90 60 60)"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-[20px] font-bold text-white">92%</div>
                <div className="text-[10px] text-slate-500">Audit Ready</div>
              </div>
            </div>
            <ul className="space-y-1.5 text-[11.5px]">
              {[
                "Receipts Uploaded",
                "Bank Reconciled",
                "Payroll Updated",
                "State Tax",
                "Documents Complete",
              ].map((t) => (
                <li
                  key={t}
                  className="flex items-center gap-1.5 text-slate-300"
                >
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <ViewMore label="View Audit Center" />
        </CardShell>
        </PanelPreview>

        <PanelPreview title="Pending Tasks" expanded={<ExpandedTasks />}>
          <CardShell>
          <CardHead title="PENDING TASKS" />
          <ul className="space-y-1.5">
            {tasks.map((t) => {
              const Ico = t.icon;
              return (
                <li
                  key={t.label}
                  className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-[#0e1626] px-3 py-2 text-[12px]"
                >
                  <span
                    className={cn(
                      "grid h-6 w-6 place-items-center rounded-md",
                      t.color,
                    )}
                  >
                    <Ico className="h-3.5 w-3.5" />
                  </span>
                  <span className="flex-1 text-slate-200">{t.label}</span>
                  <span className="rounded-md bg-[#0a1020] px-2 py-0.5 text-[12px] font-bold text-white">
                    {t.num}
                  </span>
                </li>
              );
            })}
          </ul>
          <ViewMore label="View All Tasks" />
        </CardShell>
        </PanelPreview>
      </section>
    </div>
  );
}

/* ─── Data ─── */

const kpis = [
  {
    icon: "car" as const,
    color: "blue",
    label: "Total Inventory",
    value: "85",
    unit: "Vehicles",
    link: "View Inventory",
    sparkColor: "#3b82f6",
    sparkPoints:
      "0,40 25,32 50,34 75,28 100,30 125,22 150,24 175,16 200,18 220,10",
  },
  {
    icon: "tag" as const,
    color: "green",
    label: "Sold This Month",
    value: "12",
    unit: "Vehicles",
    link: "View Sales",
    sparkColor: "#10b981",
    sparkPoints:
      "0,38 25,30 50,32 75,26 100,28 125,20 150,22 175,14 200,16 220,8",
  },
  {
    icon: "dollar-sign" as const,
    color: "amber",
    label: "Gross Profit (MTD)",
    value: "$48,750",
    delta: "↑ 18.5% vs last month",
    link: "View Resales",
    sparkColor: "#22c55e",
    sparkPoints:
      "0,40 25,34 50,30 75,28 100,24 125,22 150,18 175,16 200,12 220,8",
  },
  {
    icon: "pie-chart" as const,
    color: "violet",
    label: "Net Profit (MTD)",
    value: "$32,560",
    delta: "↑ 15.3% vs last month",
    link: "View Report",
    sparkColor: "#a855f7",
    sparkPoints:
      "0,38 25,32 50,30 75,26 100,24 125,20 150,18 175,14 200,12 220,8",
  },
  {
    icon: "trending-down" as const,
    color: "red",
    label: "Monthly Expenses",
    value: "$16,190",
    unit: " ",
    link: "View Expenses",
    sparkColor: "#ef4444",
    sparkPoints:
      "0,36 25,34 50,30 75,28 100,26 125,22 150,20 175,18 200,14 220,10",
  },
];

const compareRows = [
  ["Total Sales", "$485,230", "$538,450", "↑ 10.9%", true],
  ["Gross Profit", "$41,230", "$48,750", "↑ 18.2%", true],
  ["Net Profit", "$28,240", "$32,560", "↑ 15.3%", true],
  ["Total Expenses", "$14,850", "$16,190", "↑ 9.0%", false],
  ["Vehicles Sold", "47", "58", "↑ 23.4%", true],
] as const;

const expenseLegend = [
  ["bg-emerald-500", "Payroll", "$6,250 (38.6%)"],
  ["bg-blue-500", "Vehicle Expenses", "$3,450 (21.3%)"],
  ["bg-purple-500", "Rent & Utilities", "$2,300 (14.2%)"],
  ["bg-amber-500", "Advertising", "$1,850 (11.4%)"],
  ["bg-red-500", "Software", "$750 (4.6%)"],
  ["bg-cyan-500", "Office", "$650 (4.0%)"],
  ["bg-slate-500", "Other", "$940 (5.8%)"],
] as const;

const payrollLegend = [
  ["bg-emerald-500", "Commissions", "$12,450 (58.0%)"],
  ["bg-blue-500", "Salaries", "$6,280 (29.3%)"],
  ["bg-amber-500", "Bonuses", "$1,880 (8.8%)"],
  ["bg-purple-500", "Contractors", "$575 (2.7%)"],
  ["bg-red-500", "Payroll Taxes", "$250 (1.2%)"],
] as const;

const calDays = [
  "Sun 20",
  "Mon 21",
  "Tue 22",
  "Wed 23",
  "Thu 24",
  "Fri 25",
  "Sat 26",
];
const calHours = [
  "8 AM",
  "9 AM",
  "10 AM",
  "11 AM",
  "12 PM",
  "1 PM",
  "2 PM",
  "3 PM",
  "4 PM",
  "5 PM",
  "6 PM",
  "7 PM",
  "8 PM",
  "9 PM",
];

const events = [
  {
    day: 1,
    hour: 2,
    title: "Sales Meeting",
    time: "10:00 AM",
    color: "bg-blue-800",
  },
  {
    day: 5,
    hour: 2,
    title: "Payroll Run",
    time: "10:00 AM",
    color: "bg-red-800",
  },
  {
    day: 2,
    hour: 3,
    title: "Test Drive",
    time: "11:00 AM",
    color: "bg-orange-800",
  },
  {
    day: 3,
    hour: 3,
    title: "Bank Deposit",
    time: "11:00 AM",
    color: "bg-green-800",
  },
  {
    day: 0,
    hour: 5,
    title: "Follow Up Call",
    time: "1:00 PM",
    color: "bg-amber-800",
  },
  {
    day: 3,
    hour: 5,
    title: "Deal Review",
    time: "2:00 PM",
    color: "bg-purple-800",
  },
  {
    day: 1,
    hour: 7,
    title: "Appraisal",
    time: "3:00 PM",
    color: "bg-blue-800",
  },
  {
    day: 4,
    hour: 7,
    title: "Team Huddle",
    time: "3:00 PM",
    color: "bg-red-800",
  },
  {
    day: 3,
    hour: 10,
    title: "Customer Dinner",
    time: "6:00 PM",
    color: "bg-cyan-800",
  },
];

const deals = [
  [
    "RO-1021",
    "James Anderson",
    "2021 BMW 330i",
    "Sold",
    "$28,900",
    "$4,300",
    "May 20, 2025",
  ],
  [
    "RO-1020",
    "Sarah Williams",
    "2019 Honda Accord LX",
    "Delivered",
    "$18,750",
    "$2,100",
    "May 20, 2025",
  ],
  [
    "RO-1019",
    "Michael Brown",
    "2018 Toyota Camry SE",
    "In Progress",
    "$19,900",
    "$2,650",
    "May 19, 2025",
  ],
  [
    "RO-1018",
    "David Miller",
    "2020 Ford F-150 XLT",
    "Sold",
    "$32,500",
    "$4,000",
    "May 19, 2025",
  ],
  [
    "RO-1017",
    "Chris Johnson",
    "2022 Chevrolet Malibu LS",
    "In Progress",
    "$21,800",
    "$2,750",
    "May 18, 2025",
  ],
];

const statusStyle: Record<string, string> = {
  Sold: "bg-emerald-500/15 text-emerald-400",
  Delivered: "bg-blue-500/15 text-blue-400",
  "In Progress": "bg-amber-500/15 text-amber-400",
};

const topVehicles = [
  {
    title: "2021 BMW X5 xDrive40i",
    vin: "5UXCR6C07M9F12345",
    profit: "$4,850",
    img: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=120&q=70",
  },
  {
    title: "2019 Mercedes-Benz E 350",
    vin: "WDDZF4KBXKA567890",
    profit: "$3,650",
    img: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=120&q=70",
  },
  {
    title: "2020 Audi Q7 Premium",
    vin: "WA1LAAF72LD012345",
    profit: "$3,250",
    img: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=120&q=70",
  },
  {
    title: "2021 Lexus RX 350",
    vin: "2T2HZMDA1MC123456",
    profit: "$2,950",
    img: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=120&q=70",
  },
  {
    title: "2018 Toyota Tacoma TRD",
    vin: "3TMCZ5AN8JM123456",
    profit: "$2,750",
    img: "https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=120&q=70",
  },
];

const tasks = [
  {
    icon: BellRing,
    label: "Pending Smog",
    num: 12,
    color: "bg-amber-500/20 text-amber-400",
  },
  {
    icon: ClipboardList,
    label: "Pending Registration",
    num: 8,
    color: "bg-blue-500/20 text-blue-400",
  },
  {
    icon: Wrench,
    label: "Pending Recon",
    num: 15,
    color: "bg-emerald-500/20 text-emerald-400",
  },
  {
    icon: FileWarning,
    label: "Missing Documents",
    num: 6,
    color: "bg-red-500/20 text-red-400",
  },
];

/* ─── Sub-Components ─── */

function CardShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "flex h-full flex-col rounded-sm border border-slate-700 bg-transparent p-3.5 text-slate-200 shadow-none",
        className,
      )}
    >
      {children}
    </Card>
  );
}

function CardHead({
  title,
  pill,
  info,
}: {
  title: string;
  pill?: string;
  info?: boolean;
}) {
  return (
    <div className="mb-2.5 flex items-center justify-between">
      <div className="flex items-center gap-1 text-[11px] font-bold tracking-[0.14em] text-slate-500">
        {title}
        {info && <Info className="h-3 w-3" />}
      </div>
      {pill && (
        <Select defaultValue={pill}>
          <SelectTrigger className="h-7 border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] text-slate-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-slate-800 bg-[#0e1626] text-slate-300 text-[11px]">
            <SelectItem value="This Month">This Month</SelectItem>
            <SelectItem value="Last Month">Last Month</SelectItem>
            <SelectItem value="This Quarter">This Quarter</SelectItem>
            <SelectItem value="This Year">This Year</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

function Dot({ c }: { c: string }) {
  return (
    <span
      className={cn("mr-1.5 inline-block h-2 w-2 rounded-full align-middle", c)}
    />
  );
}

function Donut({
  segments,
  center,
  label,
}: {
  segments: { color: string; value: number }[];
  center: string;
  label: string;
}) {
  const total = segments.reduce((a, b) => a + b.value, 0);
  const C = 2 * Math.PI * 46;
  let offset = 0;
  return (
    <div className="relative flex flex-col items-center">
      <svg viewBox="0 0 120 120" className="h-32 w-32">
        <circle
          cx="60"
          cy="60"
          r="46"
          fill="none"
          stroke="#1f2a3d"
          strokeWidth="18"
        />
        {segments.map((s, i) => {
          const len = (s.value / total) * C;
          const el = (
            <circle
              key={i}
              cx="60"
              cy="60"
              r="46"
              fill="none"
              stroke={s.color}
              strokeWidth="18"
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 60 60)"
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute top-10 text-center">
        <div className="text-[15px] font-bold text-white">{center}</div>
        <div className="text-[9.5px] text-slate-500">{label}</div>
      </div>
    </div>
  );
}

function ViewMore({ label }: { label: string }) {
  return (
    <button className="mt-auto -mx-3.5 -mb-3.5 rounded-b-sm border-t border-slate-700 bg-transparent py-2.5 text-center text-[11.5px] font-medium text-blue-400">
      {label} →
    </button>
  );
}

function Snap({
  label,
  value,
  red,
}: {
  label: string;
  value: string;
  red?: boolean;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-[#0e1626] p-2.5 text-center">
      <div
        className={cn("text-[10.5px]", red ? "text-red-400" : "text-slate-500")}
      >
        {label}
      </div>
      <div
        className={cn(
          "mt-1 text-[16px] font-bold",
          red ? "text-red-400" : "text-white",
        )}
      >
        {value}
      </div>
    </div>
  );
}

/* ─── Expanded Panel Views (Full-Screen Detail) ─── */

function BigDonut({
  segments,
  center,
  label,
}: {
  segments: { color: string; value: number }[];
  center: string;
  label: string;
}) {
  const total = segments.reduce((a, b) => a + b.value, 0);
  const C = 2 * Math.PI * 96;
  let offset = 0;
  return (
    <div className="relative flex flex-col items-center">
      <svg viewBox="0 0 240 240" className="h-56 w-56">
        <circle cx="120" cy="120" r="96" fill="none" stroke="#1f2a3d" strokeWidth="24" />
        {segments.map((s, i) => {
          const len = (s.value / total) * C;
          const el = (
            <circle
              key={i}
              cx="120" cy="120" r="96"
              fill="none" stroke={s.color} strokeWidth="24"
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 120 120)"
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute top-20 text-center">
        <div className="text-2xl font-bold text-white">{center}</div>
        <div className="text-sm text-slate-500">{label}</div>
      </div>
    </div>
  );
}

function ExpandedHeader({
  title,
  subtitle,
  period = "This Month",
}: {
  title: string;
  subtitle: string;
  period?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
      </div>
      <Select defaultValue={period}>
        <SelectTrigger className="h-9 w-40 border-slate-800 bg-[#0e1626] text-sm text-slate-300">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="border-slate-800 bg-[#0e1626] text-slate-300">
          <SelectItem value="This Month">This Month</SelectItem>
          <SelectItem value="Last Month">Last Month</SelectItem>
          <SelectItem value="This Quarter">This Quarter</SelectItem>
          <SelectItem value="This Year">This Year</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function ExpandedKPI({ data }: { data: KPICardData }) {
  const breakdowns: Record<string, { label: string; value: string; sub: string }[]> = {
    "Total Inventory": [
      { label: "Available", value: "45", sub: "53% of total" },
      { label: "In Transit", value: "22", sub: "26% of total" },
      { label: "Pending Sale", value: "12", sub: "14% of total" },
      { label: "In Service", value: "6", sub: "7% of total" },
    ],
    "Sold This Month": [
      { label: "Week 1", value: "3", sub: "May 1-7" },
      { label: "Week 2", value: "4", sub: "May 8-14" },
      { label: "Week 3", value: "3", sub: "May 15-21" },
      { label: "Week 4", value: "2", sub: "May 22-31" },
    ],
    "Gross Profit (MTD)": [
      { label: "Vehicle Sales", value: "$38,200", sub: "78.4%" },
      { label: "Finance Income", value: "$6,300", sub: "12.9%" },
      { label: "Trade-Ins", value: "$3,150", sub: "6.5%" },
      { label: "Other", value: "$1,100", sub: "2.2%" },
    ],
    "Net Profit (MTD)": [
      { label: "Gross Profit", value: "$48,750", sub: "Revenue - COGS" },
      { label: "Operating Exp.", value: "-$12,350", sub: "Deductible" },
      { label: "Tax Provision", value: "-$3,840", sub: "Estimated" },
      { label: "Net", value: "$32,560", sub: "After all deductions" },
    ],
    "Monthly Expenses": [
      { label: "Fixed", value: "$8,450", sub: "Rent, Utilities" },
      { label: "Variable", value: "$5,240", sub: "Inventory, Supplies" },
      { label: "Payroll", value: "$2,500", sub: "Non-commission" },
    ],
  };
  const items = breakdowns[data.label] || [];
  const sparkYValues = data.sparkPoints.split(" ").map((p) => Number(p.split(",")[1]));
  const maxY = Math.max(...sparkYValues);
  const trendData = sparkYValues.map((y, i) => ({
    name: `D${i + 1}`,
    value: maxY - y,
  }));
  const gradId = data.label.toLowerCase().replace(/[^a-z0-9-]/g, "");

  return (
    <div className="flex h-full flex-col gap-4">
      <ExpandedHeader title={data.label} subtitle="Real-time performance indicator with trend analysis and category breakdown." />
      <div className="flex items-center justify-between shrink-0">
        <div>
          <div className="text-sm text-slate-500">{data.label}</div>
          <div className="text-4xl font-bold text-white">{data.value}</div>
          {data.unit && <div className="mt-0.5 text-base text-slate-400">{data.unit}</div>}
          {data.delta && (
            <div className="mt-0.5 text-sm font-medium text-emerald-400">{data.delta}</div>
          )}
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <KPIChart data={trendData} color={data.sparkColor} label={data.label} gradId={gradId} />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 shrink-0">
        {items.map((b) => (
          <div key={b.label} className="rounded-lg border border-slate-700 bg-[#0e1626] p-3">
            <div className="text-[11px] text-slate-500">{b.label}</div>
            <div className="mt-0.5 text-xl font-bold text-white">{b.value}</div>
            <div className="text-[11px] text-slate-400">{b.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExpandedComparison() {
  const maxVal = 538450;
  return (
    <div className="space-y-6">
      <ExpandedHeader title="Last Month vs This Month" subtitle="Period-over-period comparison of key dealership metrics with visual performance bars." />
      <div className="grid grid-cols-2 gap-6">
        {compareRows.map(([m, l, t, c, pos]) => {
          const lNum = parseInt(String(l).replace(/[$,]/g, "")) || 0;
          const tNum = parseInt(String(t).replace(/[$,]/g, "")) || 0;
          return (
            <div key={m as string} className="rounded-lg border border-slate-700 bg-[#0e1626] p-5">
              <div className="text-sm font-semibold text-slate-300">{m as string}</div>
              <div className="mt-4 flex items-end gap-6">
                <div className="flex-1">
                  <div className="text-xs text-slate-500">Last Month</div>
                  <div className="relative mt-1 h-8 rounded-md bg-slate-800">
                    <div
                      className="absolute bottom-0 left-0 rounded-md bg-slate-500 transition-all"
                      style={{ width: `${(lNum / maxVal) * 100}%`, height: "100%" }}
                    />
                  </div>
                  <div className="mt-1 text-lg font-bold text-white">{l as string}</div>
                </div>
                <div className="flex-1">
                  <div className="text-xs text-slate-500">This Month</div>
                  <div className="relative mt-1 h-8 rounded-md bg-slate-800">
                    <div
                      className={cn(
                        "absolute bottom-0 left-0 rounded-md transition-all",
                        pos ? "bg-emerald-500" : "bg-red-500",
                      )}
                      style={{ width: `${(tNum / maxVal) * 100}%`, height: "100%" }}
                    />
                  </div>
                  <div className="mt-1 text-lg font-bold text-white">{t as string}</div>
                </div>
              </div>
              <div className={cn("mt-3 text-sm font-medium", pos ? "text-emerald-400" : "text-red-400")}>
                {c as string}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ExpandedPnL() {
  return (
    <div className="space-y-6">
      <ExpandedHeader title="Profit & Loss Overview" subtitle="Comprehensive income statement showing revenue, expenses, and net profit with monthly trend chart." />
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-emerald-700 bg-emerald-500/10 p-4">
          <div className="text-xs text-emerald-400">Total Income</div>
          <div className="text-3xl font-bold text-emerald-400">$98,450</div>
          <div className="text-xs text-emerald-500/70">↑ 12.4% vs last month</div>
        </div>
        <div className="rounded-lg border border-red-700 bg-red-500/10 p-4">
          <div className="text-xs text-red-400">Total Expenses</div>
          <div className="text-3xl font-bold text-red-400">$16,190</div>
          <div className="text-xs text-red-500/70">↑ 9.0% vs last month</div>
        </div>
        <div className="rounded-lg border border-blue-700 bg-blue-500/10 p-4">
          <div className="text-xs text-blue-400">Net Profit</div>
          <div className="text-3xl font-bold text-blue-400">$32,560</div>
          <div className="text-xs text-blue-500/70">↑ 15.3% vs last month</div>
        </div>
      </div>
      <svg viewBox="0 0 900 300" preserveAspectRatio="none" className="h-64 w-full">
        <g stroke="#1f2937" strokeWidth="1">
          {[60, 120, 180, 240].map((y) => (
            <line key={y} x1="50" y1={y} x2="900" y2={y} />
          ))}
        </g>
        <g fill="#6b7280" fontSize="12">
          {["$100K", "$80K", "$60K", "$40K", "$20K"].map((t, i) => (
            <text key={t} x="0" y={64 + i * 60}>{t}</text>
          ))}
          <text x="10" y="298">$0</text>
        </g>
        <polyline fill="none" stroke="#22c55e" strokeWidth="3"
          points="60,190 140,150 220,135 300,120 380,100 460,90 540,75 620,60 700,50 780,45 860,40" />
        <polyline fill="none" stroke="#ef4444" strokeWidth="3"
          points="60,240 140,230 220,225 300,220 380,210 460,200 540,195 620,190 700,185 780,180 860,175" />
        <polyline fill="none" stroke="#3b82f6" strokeWidth="3"
          points="60,230 140,215 220,205 300,195 380,180 460,165 540,155 620,140 700,125 780,115 860,100" />
        <g fill="#6b7280" fontSize="11">
          {["May 1","May 5","May 10","May 15","May 20","May 25","May 31"].map((t, i) => (
            <text key={t} x={70 + i * 130} y="296">{t}</text>
          ))}
        </g>
      </svg>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-500">
              <th className="px-3 py-2 text-left font-medium">Category</th>
              <th className="px-3 py-2 text-right font-medium">Amount</th>
              <th className="px-3 py-2 text-right font-medium">% of Revenue</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Vehicle Sales", "$82,300", "83.6%"],
              ["Finance & Insurance", "$11,250", "11.4%"],
              ["Trade-In Profit", "$3,650", "3.7%"],
              ["Other Income", "$1,250", "1.3%"],
            ].map(([cat, amt, pct]) => (
              <tr key={cat} className="border-b border-slate-800/60">
                <td className="px-3 py-2 text-slate-200">{cat}</td>
                <td className="px-3 py-2 text-right text-slate-300">{amt}</td>
                <td className="px-3 py-2 text-right text-slate-400">{pct}</td>
              </tr>
            ))}
            <tr className="border-b border-slate-700 font-semibold">
              <td className="px-3 py-2 text-white">Total Revenue</td>
              <td className="px-3 py-2 text-right text-white">$98,450</td>
              <td className="px-3 py-2 text-right text-white">100%</td>
            </tr>
            <tr className="border-b border-slate-800/60">
              <td className="px-3 py-2 text-red-400">Total Expenses</td>
              <td className="px-3 py-2 text-right text-red-400">-$16,190</td>
              <td className="px-3 py-2 text-right text-red-400">16.4%</td>
            </tr>
            <tr className="text-emerald-400 font-bold">
              <td className="px-3 py-2">Net Profit</td>
              <td className="px-3 py-2 text-right">$32,560</td>
              <td className="px-3 py-2 text-right">33.1%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ExpandedExpenses() {
  return (
    <div className="space-y-6">
      <ExpandedHeader title="Expenses Breakdown" subtitle="Detailed expense category analysis with spending distribution and budget compliance tracking." />
      <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
      <div className="flex flex-col items-center justify-center">
        <BigDonut
          center="$16,190"
          label="Total Expenses"
          segments={[
            { color: "#22c55e", value: 38.6 },
            { color: "#3b82f6", value: 21.3 },
            { color: "#a855f7", value: 14.2 },
            { color: "#f59e0b", value: 11.4 },
            { color: "#ef4444", value: 4.6 },
            { color: "#06b6d4", value: 4.0 },
            { color: "#6b7280", value: 5.8 },
          ]}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-500">
              <th className="px-3 py-2.5 text-left font-medium">Category</th>
              <th className="px-3 py-2.5 text-right font-medium">Amount</th>
              <th className="px-3 py-2.5 text-right font-medium">%</th>
              <th className="px-3 py-2.5 text-right font-medium">vs Budget</th>
            </tr>
          </thead>
          <tbody>
            {expenseLegend.map(([color, label, detail], i) => {
              const amt = detail.match(/^\$[\d,]+/)?.[0] || "";
              const pct = detail.match(/\([\d.]+%\)/)?.[0] || "";
              const vsBudget = ["On Track","Over +5%","On Track","Under -3%","On Track","On Track","Over +2%"];
              const vsColor = ["text-emerald-400","text-red-400","text-emerald-400","text-emerald-400","text-emerald-400","text-emerald-400","text-red-400"];
              const hexMap: Record<string, string> = { "bg-emerald-500": "#22c55e", "bg-blue-500": "#3b82f6", "bg-purple-500": "#a855f7", "bg-amber-500": "#f59e0b", "bg-red-500": "#ef4444", "bg-cyan-500": "#06b6d4", "bg-slate-500": "#6b7280" };
              return (
                <tr key={label} className="border-b border-slate-800/60">
                  <td className="px-3 py-2.5">
                    <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: hexMap[color] || "#6b7280" }} />
                    {label}
                  </td>
                  <td className="px-3 py-2.5 text-right text-slate-300">{amt}</td>
                  <td className="px-3 py-2.5 text-right text-slate-400">{pct}</td>
                  <td className={cn("px-3 py-2.5 text-right", vsColor[i] || "text-slate-400")}>
                    {vsBudget[i] || "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}

function ExpandedPayroll() {
  return (
    <div className="space-y-6">
      <ExpandedHeader title="Payroll Breakdown" subtitle="Employee compensation analysis with commission, salary, and tax breakdown." />
      <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
      <div className="flex flex-col items-center justify-center">
        <BigDonut
          center="$21,435"
          label="Total Payroll"
          segments={[
            { color: "#22c55e", value: 58 },
            { color: "#3b82f6", value: 29.3 },
            { color: "#f59e0b", value: 8.8 },
            { color: "#a855f7", value: 2.7 },
            { color: "#ef4444", value: 1.2 },
          ]}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-500">
              <th className="px-3 py-2.5 text-left font-medium">Category</th>
              <th className="px-3 py-2.5 text-right font-medium">Amount</th>
              <th className="px-3 py-2.5 text-right font-medium">%</th>
              <th className="px-3 py-2.5 text-right font-medium">Employees</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Commissions", "$12,450", "58.0%", "8"],
              ["Salaries", "$6,280", "29.3%", "5"],
              ["Bonuses", "$1,880", "8.8%", "3"],
              ["Contractors", "$575", "2.7%", "2"],
              ["Payroll Taxes", "$250", "1.2%", "-"],
            ].map(([cat, amt, pct, emp]) => (
              <tr key={cat} className="border-b border-slate-800/60">
                <td className="px-3 py-2.5 text-slate-200">{cat}</td>
                <td className="px-3 py-2.5 text-right text-slate-300">{amt}</td>
                <td className="px-3 py-2.5 text-right text-slate-400">{pct}</td>
                <td className="px-3 py-2.5 text-right text-slate-400">{emp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}

function ExpandedCalendar() {
  const fullMonthDays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const monthDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const firstDay = 3;
  return (
    <div className="space-y-4">
      <ExpandedHeader title="Calendar" subtitle="Full monthly schedule with events, appointments, and dealership activities." />
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {fullMonthDays.map((d) => (
          <div key={d} className="py-2 text-xs font-semibold text-slate-500">{d}</div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {monthDays.map((d) => {
          const dayEvents = events.filter((e) => {
            const calDayIndex = Math.floor((d - 1 + firstDay) % 7);
            return e.day === calDayIndex;
          });
          return (
            <div
              key={d}
              className={cn(
                "min-h-[70px] rounded-md border border-slate-800 p-1 text-left text-xs",
                d === 22 && "border-blue-500/50 bg-blue-500/5",
              )}
            >
              <div className={cn("mb-1 text-slate-400", d === 22 && "text-blue-400 font-bold")}>
                {d}
              </div>
              {dayEvents.slice(0, 2).map((ev, i) => (
                <div
                  key={i}
                  className={cn("mb-0.5 rounded px-1 py-0.5 text-[9px] leading-tight text-white truncate", ev.color)}
                >
                  {ev.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <div className="rounded-lg border border-slate-700 bg-[#0e1626] p-4">
        <div className="mb-2 text-xs font-semibold text-slate-500">ALL EVENTS</div>
        <div className="space-y-1.5">
          {events.map((ev, i) => (
            <div key={i} className="flex items-center gap-3 text-xs">
              <span className={cn("h-2 w-2 rounded-full", ev.color.replace("bg-", "bg-"))} />
              <span className="text-slate-300 w-16">{ev.time}</span>
              <span className="text-slate-200 font-medium">{ev.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExpandedDeals() {
  const totalSales = deals.reduce((s, r) => s + parseInt(String(r[4]).replace(/[$,]/g, "")) || 0, 0);
  const totalProfit = deals.reduce((s, r) => s + parseInt(String(r[5]).replace(/[$,]/g, "")) || 0, 0);
  return (
    <div className="space-y-4">
      <ExpandedHeader title="Recent Deal Activity" subtitle="Complete deal pipeline with sales performance, margins, and transaction history." />
      <div className="flex gap-4">
        <div className="rounded-lg border border-slate-700 bg-[#0e1626] px-4 py-3">
          <div className="text-xs text-slate-500">Total Deals</div>
          <div className="text-xl font-bold text-white">{deals.length}</div>
        </div>
        <div className="rounded-lg border border-slate-700 bg-[#0e1626] px-4 py-3">
          <div className="text-xs text-slate-500">Total Sales</div>
          <div className="text-xl font-bold text-emerald-400">${totalSales.toLocaleString()}</div>
        </div>
        <div className="rounded-lg border border-slate-700 bg-[#0e1626] px-4 py-3">
          <div className="text-xs text-slate-500">Total Profit</div>
          <div className="text-xl font-bold text-emerald-400">${totalProfit.toLocaleString()}</div>
        </div>
        <div className="rounded-lg border border-slate-700 bg-[#0e1626] px-4 py-3">
          <div className="text-xs text-slate-500">Avg Profit/Deal</div>
          <div className="text-xl font-bold text-blue-400">${Math.round(totalProfit / deals.length).toLocaleString()}</div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-500">
              {["Deal #","Customer","Vehicle","Status","Sales Price","Profit","Margin","Date"].map((h) => (
                <th key={h} className="px-3 py-2.5 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {deals.map((r) => {
              const price = parseInt(String(r[4]).replace(/[$,]/g, "")) || 0;
              const profit = parseInt(String(r[5]).replace(/[$,]/g, "")) || 0;
              const margin = price ? ((profit / price) * 100).toFixed(1) : "0";
              return (
                <tr key={r[0]} className="border-b border-slate-800/60">
                  <td className="px-3 py-2.5 text-slate-300">{r[0]}</td>
                  <td className="px-3 py-2.5 text-slate-200">{r[1]}</td>
                  <td className="px-3 py-2.5 text-slate-300">{r[2]}</td>
                  <td className="px-3 py-2.5">
                    <span className={cn("rounded-md px-2 py-0.5 text-xs font-semibold", statusStyle[r[3]])}>{r[3]}</span>
                  </td>
                  <td className="px-3 py-2.5 text-slate-300">{r[4]}</td>
                  <td className="px-3 py-2.5 text-emerald-400">{r[5]}</td>
                  <td className="px-3 py-2.5 text-slate-400">{margin}%</td>
                  <td className="px-3 py-2.5 text-slate-500">{r[6]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ExpandedTopVehicles() {
  const allVehicles = [
    ...topVehicles,
    { title: "2022 Tesla Model Y", vin: "7SAY12345ABCDEFGH", profit: "$2,450", img: "https://images.unsplash.com/photo-1619767886558-efdc7b9af27a?w=200&q=70" },
    { title: "2020 Honda CR-V EX", vin: "2HKRW12345GHIJKLM", profit: "$2,150", img: "https://images.unsplash.com/photo-1568844293986-8d0400bd4745?w=200&q=70" },
    { title: "2021 Ford Explorer ST", vin: "1FM5K8ABCDEF12345", profit: "$3,100", img: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=200&q=70" },
    { title: "2019 Ram 1500 Laramie", vin: "1C6SRFJT123456789", profit: "$3,850", img: "https://images.unsplash.com/photo-1609630875171-b13213776701?w=200&q=70" },
  ];
  return (
    <div className="space-y-6">
      <ExpandedHeader title="Top Vehicles by Gross Profit" subtitle="Highest-margin vehicles in current inventory with ROI analysis." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {allVehicles.map((v) => (
          <div key={v.vin} className="rounded-lg border border-slate-700 bg-[#0e1626] overflow-hidden">
            <img src={v.img} alt={v.title} className="h-40 w-full object-cover" loading="lazy" />
            <div className="p-4">
              <div className="text-sm font-semibold text-white truncate">{v.title}</div>
              <div className="mt-1 text-xs text-slate-500 truncate">VIN: {v.vin}</div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-emerald-400">{v.profit}</div>
                  <div className="text-xs text-slate-500">Gross Profit</div>
                </div>
                <span className="rounded-md bg-emerald-500/15 px-2 py-1 text-xs font-medium text-emerald-400">
                  +{((parseInt(v.profit.replace(/[$,]/g, "")) / 25000) * 100).toFixed(1)}% ROI
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExpandedCDTFA() {
  return (
    <div className="space-y-6">
      <ExpandedHeader title="CDTFA Quarterly Snapshot" subtitle="Sales tax reporting, payments, and compliance status for California Department of Tax and Fee Administration." />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-slate-700 bg-[#0e1626] p-4 text-center">
          <div className="text-xs text-slate-500">Taxable Sales</div>
          <div className="mt-1 text-2xl font-bold text-white">$245,750</div>
          <div className="mt-0.5 text-xs text-slate-400">Q2 2025</div>
        </div>
        <div className="rounded-lg border border-slate-700 bg-[#0e1626] p-4 text-center">
          <div className="text-xs text-slate-500">Sales Tax (7.75%)</div>
          <div className="mt-1 text-2xl font-bold text-white">$19,034</div>
          <div className="mt-0.5 text-xs text-slate-400">Collected</div>
        </div>
        <div className="rounded-lg border border-slate-700 bg-[#0e1626] p-4 text-center">
          <div className="text-xs text-slate-500">Payments Made</div>
          <div className="mt-1 text-2xl font-bold text-green-400">$10,584</div>
          <div className="mt-0.5 text-xs text-slate-400">55.6% Paid</div>
        </div>
        <div className="rounded-lg border border-red-700 bg-red-500/10 p-4 text-center">
          <div className="text-xs text-red-400">Balance Due</div>
          <div className="mt-1 text-2xl font-bold text-red-400">$8,450</div>
          <div className="mt-0.5 text-xs text-red-400/70">Due Jul 31, 2025</div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-500">
              <th className="px-3 py-2 text-left font-medium">Month</th>
              <th className="px-3 py-2 text-right font-medium">Taxable Sales</th>
              <th className="px-3 py-2 text-right font-medium">Tax Collected</th>
              <th className="px-3 py-2 text-right font-medium">Payment Made</th>
              <th className="px-3 py-2 text-right font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["April 2025", "$82,150", "$6,367", "$6,367", "Paid"],
              ["May 2025", "$79,600", "$6,169", "$4,217", "Partial"],
              ["June 2025", "$84,000", "$6,498", "$0", "Pending"],
            ].map(([m, s, t, p, st]) => (
              <tr key={m} className="border-b border-slate-800/60">
                <td className="px-3 py-2 text-slate-200">{m}</td>
                <td className="px-3 py-2 text-right text-slate-300">{s}</td>
                <td className="px-3 py-2 text-right text-slate-300">{t}</td>
                <td className="px-3 py-2 text-right text-slate-300">{p}</td>
                <td className="px-3 py-2 text-right">
                  <span className={cn(
                    "rounded-md px-2 py-0.5 text-xs font-medium",
                    st === "Paid" ? "bg-emerald-500/15 text-emerald-400" :
                    st === "Partial" ? "bg-amber-500/15 text-amber-400" :
                    "bg-red-500/15 text-red-400"
                  )}>{st}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ExpandedAudit() {
  const items = [
    { label: "Receipts Uploaded", progress: 95, status: "Complete" },
    { label: "Bank Reconciled", progress: 88, status: "In Progress" },
    { label: "Payroll Updated", progress: 100, status: "Complete" },
    { label: "State Tax Filed", progress: 85, status: "In Progress" },
    { label: "Documents Complete", progress: 92, status: "In Progress" },
    { label: "Inventory Audited", progress: 78, status: "Needs Review" },
  ];
  return (
    <div className="space-y-5">
      <ExpandedHeader title="Audit Readiness" subtitle="Compliance checklist tracking dealership readiness for financial and regulatory audits." />
      <div className="flex items-center gap-6">
        <div className="relative h-36 w-36 shrink-0">
          <svg viewBox="0 0 120 120" className="h-full w-full">
            <circle cx="60" cy="60" r="48" fill="none" stroke="#1f2a3d" strokeWidth="14" />
            <circle cx="60" cy="60" r="48" fill="none" stroke="#22c55e" strokeWidth="14"
              strokeDasharray="277 302" transform="rotate(-90 60 60)" strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-white">92%</div>
            <div className="text-sm text-slate-500">Audit Ready</div>
          </div>
        </div>
        <div className="text-sm text-slate-400 leading-relaxed">
          Your dealership is <span className="text-emerald-400 font-semibold">92% audit-ready</span>.
          Complete the remaining checklist items to reach full compliance.
        </div>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg border border-slate-700 bg-[#0e1626] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className={cn("h-4 w-4", item.progress === 100 ? "text-emerald-400" : "text-slate-600")} />
                <span className="text-sm text-slate-200">{item.label}</span>
              </div>
              <span className={cn(
                "rounded-md px-2 py-0.5 text-xs font-medium",
                item.progress === 100 ? "bg-emerald-500/15 text-emerald-400" :
                item.progress >= 80 ? "bg-amber-500/15 text-amber-400" :
                "bg-red-500/15 text-red-400"
              )}>{item.status}</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-slate-800">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  item.progress === 100 ? "bg-emerald-500" :
                  item.progress >= 80 ? "bg-amber-500" :
                  "bg-red-500"
                )}
                style={{ width: `${item.progress}%` }}
              />
            </div>
            <div className="mt-1 text-right text-xs text-slate-500">{item.progress}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExpandedTasks() {
  return (
    <div className="space-y-4">
      <ExpandedHeader title="Pending Tasks" subtitle="Dealership action items with priorities, assignments, and deadlines for team management." />
      <div className="grid grid-cols-4 gap-4">
        {tasks.map((t) => {
          const Ico = t.icon;
          return (
            <div key={t.label} className="rounded-lg border border-slate-700 bg-[#0e1626] p-4 text-center">
              <span className={cn("mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full", t.color)}>
                <Ico className="h-5 w-5" />
              </span>
              <div className="text-2xl font-bold text-white">{t.num}</div>
              <div className="text-xs text-slate-400">{t.label}</div>
            </div>
          );
        })}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-500">
              {["Task","Priority","Assigned To","Due Date","Status"].map((h) => (
                <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["Smog Check - BMW 330i", "High", "Mike Tech", "Jun 5, 2026", "Pending"],
              ["Registration - Honda Accord", "Medium", "Sarah Admin", "Jun 8, 2026", "In Progress"],
              ["Recon - Toyota Camry", "High", "Mike Tech", "Jun 3, 2026", "Pending"],
              ["Upload Receipts (April)", "Low", "Sarah Admin", "Jun 10, 2026", "Not Started"],
              ["Finalize Payroll", "High", "Manager", "Jun 1, 2026", "Complete"],
              ["Bank Reconciliation", "Medium", "Accountant", "Jun 7, 2026", "In Progress"],
            ].map(([task, priority, assigned, due, status]) => (
              <tr key={task} className="border-b border-slate-800/60">
                <td className="px-3 py-2 text-slate-200">{task}</td>
                <td className="px-3 py-2">
                  <span className={cn(
                    "rounded-md px-2 py-0.5 text-xs font-medium",
                    priority === "High" ? "bg-red-500/15 text-red-400" :
                    priority === "Medium" ? "bg-amber-500/15 text-amber-400" :
                    "bg-blue-500/15 text-blue-400"
                  )}>{priority}</span>
                </td>
                <td className="px-3 py-2 text-slate-300">{assigned}</td>
                <td className="px-3 py-2 text-slate-400">{due}</td>
                <td className="px-3 py-2">
                  <span className={cn(
                    "rounded-md px-2 py-0.5 text-xs font-medium",
                    status === "Complete" ? "bg-emerald-500/15 text-emerald-400" :
                    status === "In Progress" ? "bg-blue-500/15 text-blue-400" :
                    status === "Pending" ? "bg-amber-500/15 text-amber-400" :
                    "bg-slate-500/15 text-slate-400"
                  )}>{status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
