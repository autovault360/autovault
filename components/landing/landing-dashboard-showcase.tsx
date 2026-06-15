import Link from "next/link";
import {
  BadgeDollarSign,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  House,
  HousePlus,
  Landmark,
  LucideIcon,
  ReceiptText,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Users,
} from "lucide-react";
import Image from "next/image";
import { ChartDonut } from "@/components/landing/landing-charts";
import {
  IconButton,
  InventoryLegend,
  MetricCard,
  Panel,
  PanelHeader,
  SummaryStat,
  inventoryTone,
  statusToneClass,
  typeToneClass,
} from "@/components/landing/landing-shared";

type NavItem = {
  label: string;
  icon: LucideIcon;
  active?: boolean;
};

const navItems: NavItem[] = [
  { label: "Dashboard", icon: House, active: true },
  { label: "Inventory", icon: HousePlus },
  { label: "Transactions", icon: Clock3 },
  { label: "Sales Reps", icon: Users },
  { label: "Sold Vehicles", icon: BadgeDollarSign },
  { label: "Auctions", icon: ShoppingCart },
  { label: "Payments", icon: Landmark },
  { label: "Expenses", icon: ReceiptText },
  { label: "Reports", icon: CircleDollarSign },
  { label: "Customers", icon: Users },
  { label: "Tasks", icon: ShieldCheck },
  { label: "Settings", icon: Settings },
];

const performance = [
  { name: "Michael Brown", vehicles: "8 Vehicles Sold", profit: "$78,450", delta: "+$12,450" },
  { name: "Jessica Taylor", vehicles: "9 Vehicles Sold", profit: "$54,120", delta: "+$8,220" },
  { name: "David Wilson", vehicles: "7 Vehicles Sold", profit: "$42,300", delta: "+$4,130" },
  { name: "Sarah Martinez", vehicles: "5 Vehicles Sold", profit: "$28,950", delta: "+$4,210" },
];

const inventory = [
  { name: "2020 BMW 5 Series 530i", stock: "Stock: 1HCG40-0E42", status: "In Stock", price: "$25,023", tone: "green" as const },
  { name: "2019 Audi A4 Premium", stock: "Stock: 1HCG40-0E42", status: "In Stock", price: "$22,450", tone: "green" as const },
  { name: "2021 Honda Accord Sport", stock: "Stock: 1HCG40-0E42", status: "At Auction", price: "$22,465", tone: "blue" as const },
  { name: "2020 Toyota Camry SE", stock: "Stock: 1HCG40-0E01", status: "Pending", price: "$18,500", tone: "orange" as const },
];

const transactions = [
  { date: "May 24, 2024", type: "Dealer Sale", typeTone: "green" as const, vehicle: "2020 BMW 5 Series 530i", amount: "$25,023", status: "Paid", statusTone: "paid" as const },
  { date: "May 22, 2024", type: "Dealer Sale", typeTone: "green" as const, vehicle: "2019 Audi A4 Premium", amount: "$22,450", status: "Paid", statusTone: "paid" as const },
  { date: "May 20, 2024", type: "Auction Sale", typeTone: "blue" as const, vehicle: "2021 Honda Accord Sport", amount: "$22,465", status: "Partial", statusTone: "partial" as const },
  { date: "May 18, 2024", type: "Auction Sale", typeTone: "blue" as const, vehicle: "2020 Toyota Camry SE", amount: "$18,500", status: "Pending", statusTone: "pending" as const },
];

export default function LandingDashboardShowcase() {
  return (
    <section className="bg-[var(--lp-bg-muted)] py-6 transition-colors duration-300 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[52px_minmax(0,1fr)] xl:grid-cols-[188px_minmax(0,1fr)] gap-2 lg:gap-3">
          <aside className="hidden lg:flex relative flex-col overflow-hidden rounded-[12px] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.1),_transparent_34%),linear-gradient(180deg,var(--lp-dash-sidebar-from)_0%,var(--lp-dash-sidebar-mid)_42%,var(--lp-dash-sidebar-to)_100%)] px-1.5 xl:px-3 pb-3 pt-3 xl:pt-4 text-white shadow-[var(--lp-shadow-sidebar)] ring-1 ring-white/10">
            <div className="flex items-center justify-center pb-2 xl:pb-3">
              <Image src="/logo_short.webp" alt="AutoVault" width={24} height={24} className="xl:h-7 xl:w-7" />
            </div>

            <nav className="space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href="#"
                    className={[
                      "flex h-[34px] xl:h-[36px] items-center justify-center xl:justify-start gap-3 rounded-[7px] px-0 xl:px-3 text-[13px] transition-colors",
                      item.active
                        ? "bg-[var(--lp-dash-active)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]"
                        : "text-white/94 hover:bg-white/8",
                    ].join(" ")}
                  >
                    <Icon className="h-[16px] w-[16px] shrink-0 stroke-[2]" />
                    <span className="hidden xl:inline font-medium truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto rounded-[8px] border border-white/16 bg-white/4 p-1 xl:p-1.5 backdrop-blur-sm">
              <div className="flex flex-col xl:flex-row items-center gap-1.5 xl:gap-2 rounded-[7px] px-0.5 py-1">
                <img
                  src="https://i.pravatar.cc/70?img=5"
                  alt="John Smith"
                  className="h-[32px] w-[32px] xl:h-[44px] xl:w-[44px] rounded-full border border-white/15 object-cover"
                />
                <div className="hidden xl:block min-w-0">
                  <div className="truncate text-[13px] font-medium leading-none">John Smith</div>
                  <div className="mt-1 text-[11px] leading-none text-white/92">Admin</div>
                </div>
                <ChevronDown className="hidden xl:block h-4 w-4 shrink-0 text-white/88" />
              </div>
            </div>
          </aside>

          <section className="min-w-0">
            <div className="flex items-center justify-between rounded-[12px] bg-[var(--lp-bg-elevated)] px-3 py-2 text-white lg:hidden">
              <Image src="/logo_short.webp" alt="AutoVault" width={28} height={28} />
              <div className="flex items-center gap-2">
                <img
                  src="https://i.pravatar.cc/40?img=5"
                  alt="User"
                  className="h-7 w-7 rounded-full border border-white/20 object-cover"
                />
                <div className="text-right text-[11px] leading-none">
                  <div className="font-medium">John Smith</div>
                  <div className="mt-0.5 text-white/70">Admin</div>
                </div>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-2 lg:grid-cols-4 gap-2">
              <MetricCard showcase title="PROFIT & LOSS (THIS MONTH)" value="$187,452" subtitle="Total Profit" delta="16% vs last month" accent="green" />
              <MetricCard showcase title="REVENUE" value="$1,247,499" subtitle="Total Revenue" delta="12% vs last month" accent="green" />
              <MetricCard showcase title="GROSS PROFIT" value="$187,452" subtitle="Gross Profit" delta="16% vs last month" accent="green" />
              <MetricCard showcase title="PENDING PAYMENTS" value="$27,450" subtitle="Amount Owed" delta="8 Transactions" accent="orange" />
            </div>

            <div className="mt-2 grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-[0.86fr_1.42fr_1fr] gap-2">
              <Panel className="px-3 py-3 xl:px-4 xl:py-3.5">
                <PanelHeader showcase title="SALES REPS PERFORMANCE" />
                <div className="mt-3 grid grid-cols-[1fr_auto] px-2 text-[10px] text-[var(--lp-dash-label)]">
                  <div>Sales Rep</div>
                  <div>Profit</div>
                </div>
                <div className="mt-2 space-y-2.5">
                  {performance.map((rep, index) => (
                    <div key={rep.name} className="grid grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-2">
                      <img
                        src={`https://i.pravatar.cc/48?img=${index + 1}`}
                        alt={rep.name}
                        className="h-8 w-8 rounded-full border border-[var(--lp-border-strong)] object-cover"
                      />
                      <div className="min-w-0">
                        <div className="text-[12px] font-semibold truncate">{rep.name}</div>
                        <div className="mt-0.5 text-[10px] text-[var(--lp-dash-secondary)]">{rep.vehicles}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[12px] font-semibold">{rep.profit}</div>
                        <div className="mt-0.5 text-[10px] font-medium text-[var(--lp-dash-positive)]">{rep.delta}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel className="px-3 py-3 xl:px-4 xl:py-3.5">
                <PanelHeader
                  showcase
                  title="CALENDAR"
                  right={
                    <div className="hidden sm:flex items-center gap-1">
                      <IconButton compact><ChevronLeft className="h-3.5 w-3.5" /></IconButton>
                      <IconButton compact><ChevronRight className="h-3.5 w-3.5" /></IconButton>
                      <div className="ml-1 rounded-[2px] px-2 py-1 text-[11px] font-semibold">May 2024</div>
                      <div className="rounded-[2px] border border-[var(--lp-border-strong)] px-2 py-1 text-[11px] font-semibold">Today</div>
                      <div className="ml-2 flex rounded-[2px] border border-[var(--lp-border-strong)] bg-[var(--lp-dash-card)]">
                        <button className="border-r border-[var(--lp-border-strong)] px-2.5 py-1 text-[10px] font-semibold">Month</button>
                        <button className="px-2.5 py-1 text-[10px] font-semibold">Week</button>
                      </div>
                    </div>
                  }
                />
                <div className="mt-2 grid grid-cols-7 text-center text-[9px] text-[var(--lp-dash-title)]">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="py-1">{day}</div>
                  ))}
                </div>
                <div className="mt-1 grid grid-cols-7 gap-y-1.5 text-center text-[11px] font-medium">
                  {[
                    "28", "29", "30", "1", "2", "3", "4",
                    "5", "6", "7", "8", "9", "10", "11",
                    "12", "13", "14", "15", "16", "17", "18",
                    "19", "20", "21", "22", "23", "24", "25",
                  ].map((day, index) => {
                    const isBlue = day === "13";
                    return (
                      <div
                        key={`${day}-${index}`}
                        className={["relative min-h-[36px] px-0.5 py-0.5", index < 3 ? "text-[var(--lp-dash-calendar-muted)]" : "text-[var(--lp-dash-calendar-fg)]"].join(" ")}
                      >
                        {isBlue ? (
                          <div className="mx-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#2060ea] text-[10px] font-semibold text-white">
                            {day}
                          </div>
                        ) : (
                          <div>{day}</div>
                        )}
                        {["1", "6", "8", "16", "20", "22"].includes(day) ? (
                          <div className="mt-0.5 text-[8px] leading-tight text-[var(--lp-dash-positive-text)]">
                            1 Sold
                            <br />
                            ${day === "1" ? "34,900" : day === "6" ? "34,400" : day === "8" ? "41,750" : day === "16" ? "31,100" : day === "20" ? "36,400" : "34,450"}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </Panel>

              <div className="space-y-2">
                <Panel className="px-3 py-3 xl:px-4 xl:py-3.5">
                  <PanelHeader showcase title="INVENTORY OVERVIEW" />
                  <div className="mt-2 flex items-start gap-3">
                    <ChartDonut size="showcase" />
                    <div className="w-full flex-1 space-y-2 pt-0.5">
                      <InventoryLegend compact color="#15803d" label="In Stock" value="68 (53%)" />
                      <InventoryLegend compact color="#2563eb" label="At Auction" value="28 (22%)" />
                      <InventoryLegend compact color="#233b6b" label="Sold" value="24 (19%)" />
                      <InventoryLegend compact color="#f97316" label="Pending" value="8 (6%)" />
                    </div>
                  </div>
                </Panel>

                <Panel className="px-3 py-3 xl:px-4 xl:py-3.5">
                  <PanelHeader
                    showcase
                    title="RECENT INVENTORY"
                    right={<Link href="#" className="text-[10px] text-[var(--lp-fg-accent)] shrink-0">View All</Link>}
                  />
                  <div className="mt-2 -mx-3 overflow-x-auto xl:mx-0">
                    <div className="min-w-[320px] px-3 xl:px-0 space-y-1.5">
                      {inventory.map((item) => (
                        <div key={item.name} className="grid grid-cols-[36px_minmax(0,1fr)_68px_62px] items-center gap-1.5">
                          <img
                            src={`https://placehold.co/36x24/${item.tone === "green" ? "101010" : item.tone === "blue" ? "0d1221" : "151515"}/${item.tone === "green" ? "6f6f6f" : item.tone === "blue" ? "6f7fa7" : "8d6230"}?text=V`}
                            alt="Vehicle"
                            className="h-6 w-9 rounded object-cover"
                          />
                          <div className="min-w-0">
                            <div className="truncate text-[11px] font-medium">{item.name}</div>
                            <div className="mt-0.5 truncate text-[9px] text-[var(--lp-fg-subtle)]">{item.stock}</div>
                          </div>
                          <div className={inventoryTone(item.tone) + " text-[10px]"}>{item.status}</div>
                          <div className="text-right text-[11px]">{item.price}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Panel>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[1.58fr_1fr] gap-2">
              <Panel className="px-3 py-3 xl:px-4 xl:py-3.5">
                <PanelHeader
                  showcase
                  title="RECENT TRANSACTIONS"
                  right={<Link href="#" className="text-[10px] text-[var(--lp-fg-link)] shrink-0">View All</Link>}
                />
                <div className="mt-2 -mx-3 overflow-x-auto xl:mx-0">
                  <div className="min-w-[480px] px-3 xl:px-0 space-y-2">
                    {transactions.map((row) => (
                      <div
                        key={`${row.date}-${row.vehicle}`}
                        className="grid grid-cols-[88px_100px_minmax(0,1fr)_72px_64px] items-center gap-1.5 text-[11px]"
                      >
                        <div>{row.date}</div>
                        <div className={typeToneClass(row.typeTone)}>
                          <span className="mr-1 text-[12px] font-semibold">+</span>
                          {row.type}
                        </div>
                        <div className="truncate text-[var(--lp-dash-body)]">{row.vehicle}</div>
                        <div className="text-[var(--lp-dash-body)]">{row.amount}</div>
                        <div className={statusToneClass(row.statusTone) + " !px-2 !py-0.5 !text-[10px]"}>{row.status}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Panel>

              <Panel className="px-3 py-3 xl:px-4 xl:py-3.5">
                <PanelHeader
                  showcase
                  title="PAYMENTS OVERVIEW"
                  right={
                    <div className="flex items-center gap-0.5 text-[10px] text-[var(--lp-fg-link)] shrink-0">
                      This Month
                      <ChevronDown className="h-3 w-3" />
                    </div>
                  }
                />
                <div className="mt-3 grid grid-cols-3 gap-1.5">
                  <SummaryStat showcase tone="green" label="Paid" value="$326,359" count="20 Transactions" />
                  <SummaryStat showcase tone="orange" label="Pending" value="$27,450" count="6 Transactions" />
                  <SummaryStat showcase tone="blue" label="Partial" value="$13,671" count="7 Transactions" />
                </div>
              </Panel>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
