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
  Maximize2,
  Pause,
  ReceiptText,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Users,
  Volume2,
} from "lucide-react";
import { ChartDonut } from "@/components/landing/landing-charts";
import {
  IconButton,
  InventoryLegend,
  MetricCard,
  Panel,
  PanelHeader,
} from "@/components/landing/landing-shared";

const previewNav = [
  { icon: House, active: true },
  { icon: HousePlus },
  { icon: Clock3 },
  { icon: Users },
  { icon: BadgeDollarSign },
  { icon: ShoppingCart },
  { icon: Landmark },
  { icon: ReceiptText },
  { icon: CircleDollarSign },
  { icon: Users },
  { icon: ShieldCheck },
  { icon: Settings },
];

const previewInventory = [
  { name: "2020 BMW 5 Series 530i", stock: "Stock: 1HCG40-0E42", status: "In Stock", price: "$25,023", tone: "text-[#12713b]" },
  { name: "2019 Audi A4 Premium", stock: "Stock: 1HCG40-0E42", status: "In Stock", price: "$22,450", tone: "text-[#12713b]" },
  { name: "2021 Honda Accord Sport", stock: "Stock: 1HCG40-0E42", status: "At Auction", price: "$22,465", tone: "text-[#245eea]" },
];

export default function LandingDashboardPreview({ serifClassName }: { serifClassName: string }) {
  return (
    <section className="relative z-[0] bg-[var(--lp-bg)] pb-10 pt-16 transition-colors duration-300 sm:pb-12 sm:pt-20 lg:pt-24">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[18px] border border-[var(--lp-border-strong)] bg-[var(--lp-dash-bg)] shadow-[var(--lp-shadow-preview)]">
          <div className="grid grid-cols-[52px_minmax(0,1fr)] sm:grid-cols-[64px_minmax(0,1fr)]">
            <aside className="hidden sm:flex flex-col items-center gap-1 bg-[linear-gradient(180deg,var(--lp-dash-sidebar-from)_0%,var(--lp-dash-sidebar-mid)_100%)] px-2 py-4 text-white">
              <div className={`mb-3 text-[28px] font-semibold leading-none tracking-[-0.12em] ${serifClassName}`}>
                V<span className="relative -left-[1px]">A</span>
              </div>
              {previewNav.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className={[
                      "flex h-8 w-8 items-center justify-center rounded-[6px]",
                      item.active ? "bg-[var(--lp-dash-active)]" : "text-white/90",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </div>
                );
              })}
            </aside>

            <div className="min-w-0 p-3 sm:p-4">
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                <MetricCard compact title="Profit & Loss (This Month)" value="$187,452" subtitle="Total Profit" delta="16% vs last month" accent="green" />
                <MetricCard compact title="Revenue" value="$1,247,499" subtitle="Total Revenue" delta="12% vs last month" accent="green" />
                <MetricCard compact title="Gross Profit" value="$187,452" subtitle="Gross Profit" delta="16% vs last month" accent="green" />
                <MetricCard compact title="Pending Payments" value="$27,450" subtitle="Amount Owed" delta="8 Transactions" accent="orange" />
              </div>

              <div className="mt-2 grid grid-cols-1 gap-2 lg:grid-cols-[1.1fr_0.9fr_1fr]">
                <Panel className="hidden px-3 py-3 lg:block">
                  <PanelHeader compact title="Sales Reps Performance" />
                  <div className="mt-3 space-y-2.5">
                    {[
                      ["Michael Brown", "$78,450"],
                      ["Jessica Taylor", "$54,120"],
                      ["David Wilson", "$42,300"],
                    ].map(([name, profit]) => (
                      <div key={name} className="flex items-center justify-between gap-2 text-[11px]">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-[#ececec]" />
                          <span className="font-medium text-[var(--lp-fg)]">{name}</span>
                        </div>
                        <span className="font-semibold text-[var(--lp-dash-positive)]">{profit}</span>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel className="px-3 py-3">
                  <PanelHeader
                    compact
                    title="Calendar"
                    right={
                      <div className="hidden sm:flex items-center gap-1">
                        <IconButton compact><ChevronLeft className="h-3.5 w-3.5" /></IconButton>
                        <span className="px-1 text-[10px] font-semibold">May 2024</span>
                        <IconButton compact><ChevronRight className="h-3.5 w-3.5" /></IconButton>
                      </div>
                    }
                  />
                  <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[9px] text-[var(--lp-dash-title)]">
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                      <div key={`${day}-${i}`} className="py-1">{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium">
                    {["28", "29", "30", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"].map((day, index) => (
                      <div key={`${day}-${index}`} className={index < 3 ? "text-[var(--lp-fg-subtle)]" : "text-[var(--lp-dash-calendar-fg)]"}>
                        {day === "13" ? (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#2060ea] text-[9px] text-white">13</span>
                        ) : (
                          day
                        )}
                      </div>
                    ))}
                  </div>
                </Panel>

                <div className="space-y-2">
                  <Panel className="px-3 py-3">
                    <PanelHeader compact title="Inventory Overview" />
                    <div className="mt-2 flex items-start gap-3">
                      <div className="scale-[0.72] origin-top-left -mr-6">
                        <ChartDonut />
                      </div>
                      <div className="flex-1 space-y-2 pt-1">
                        <InventoryLegend compact color="#15803d" label="In Stock" value="68 (53%)" />
                        <InventoryLegend compact color="#2563eb" label="At Auction" value="28 (22%)" />
                        <InventoryLegend compact color="#233b6b" label="Sold" value="24 (19%)" />
                      </div>
                    </div>
                  </Panel>

                  <Panel className="px-3 py-3">
                    <PanelHeader
                      compact
                      title="Recent Inventory"
                      right={<Link href="#" className="text-[10px] text-[var(--lp-fg-accent)]">View All</Link>}
                    />
                    <div className="mt-2 space-y-2">
                      {previewInventory.map((item) => (
                        <div key={item.name} className="grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-2 text-[10px]">
                          <div className="h-6 w-9 rounded bg-[#ececec]" />
                          <div className="min-w-0">
                            <div className="truncate font-medium">{item.name}</div>
                            <div className="truncate text-[9px] text-[var(--lp-fg-subtle)]">{item.stock}</div>
                          </div>
                          <div className="text-right">
                            <div className={item.tone}>{item.status}</div>
                            <div>{item.price}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Panel>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-[var(--lp-border-subtle)] bg-[var(--lp-bg-video)] px-4 py-3 text-white sm:px-5">
            <button aria-label="Pause" className="text-white/90">
              <Pause className="h-4 w-4 fill-current" />
            </button>
            <span className="text-[12px] tabular-nums text-white/80">0:12 / 0:30</span>
            <div className="relative mx-1 h-1.5 flex-1 rounded-full bg-white/20">
              <div className="absolute left-0 top-0 h-full w-[40%] rounded-full bg-[var(--lp-bg-accent)]" />
              <div className="absolute left-[40%] top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
            </div>
            <Volume2 className="hidden h-4 w-4 text-white/80 sm:block" />
            <Maximize2 className="h-4 w-4 text-white/80" />
          </div>
        </div>
      </div>
    </section>
  );
}
