"use client";

import { BarChart3, TrendingUp, TrendingDown, Wallet, ArrowRight } from "lucide-react";
import Link from "next/link";

const modules = [
  {
    title: "Payroll & Commissions",
    description: "Track payroll expenses and sales commissions for your team.",
    icon: BarChart3,
    href: "/dashboard/financials/payroll-commissions",
    gradient: "from-violet-600/20 to-violet-900/10",
    border: "border-violet-500/30",
    iconBg: "bg-violet-500/15",
    iconColor: "text-violet-400",
  },
  {
    title: "Vehicle Profit Report",
    description: "All vehicles sold at a profit with detailed analytics.",
    icon: TrendingUp,
    href: "/dashboard/financials/profit-vehicles-report",
    gradient: "from-emerald-600/20 to-emerald-900/10",
    border: "border-emerald-500/30",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
  },
  {
    title: "Vehicle Loss Report",
    description: "Vehicles sold at a loss, returned to auction, or with negative profit.",
    icon: TrendingDown,
    href: "/dashboard/financials/vehicle-losses-report",
    gradient: "from-red-600/20 to-red-900/10",
    border: "border-red-500/30",
    iconBg: "bg-red-500/15",
    iconColor: "text-red-400",
  },
  {
    title: "Expenses",
    description: "Operating expense breakdown and category reporting.",
    icon: Wallet,
    href: "/dashboard/financials/expenses",
    gradient: "from-orange-600/20 to-orange-900/10",
    border: "border-orange-500/30",
    iconBg: "bg-orange-500/15",
    iconColor: "text-orange-400",
  },
];

export default function FinancialsSection() {
  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center justify-between px-0.5">
        <h2 className="text-[11px] font-bold tracking-[0.12em] text-slate-400 uppercase">
          Financial Reports
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {modules.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className={`group relative overflow-hidden rounded-lg border ${mod.border} bg-gradient-to-br ${mod.gradient} p-4 transition-all hover:scale-[1.02] hover:shadow-lg`}
          >
            <div className="flex items-start gap-3">
              <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${mod.iconBg}`}>
                <mod.icon className={`h-5 w-5 ${mod.iconColor}`} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-[13px] font-semibold text-white">
                  {mod.title}
                </h3>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400 line-clamp-2">
                  {mod.description}
                </p>
              </div>
              <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-600 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-400" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
