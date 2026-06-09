"use client";

import Link from "next/link";
import { Calendar, Trophy, User } from "lucide-react";
import { CardShell } from "@/components/dashboard/card-shell";
import { formatCurrency } from "@/lib/dealer/dashboard/calculations";
import type { AdminTodayEvent } from "@/lib/dashboard/admin/types";
import type { SalesRepListItem } from "@/lib/sales-reps/types";
import type { TopVehicle } from "@/services/vehicle.service";
import { ADMIN_PANEL_SHELL_CLASS } from "./admin-panel-styles";

type Props = {
  topVehicle: TopVehicle | null;
  topVehicleUnitsSold: number;
  topSalesRep: SalesRepListItem | null;
  todayEvents: AdminTodayEvent[];
};

export default function PerformanceRow({
  topVehicle,
  topVehicleUnitsSold,
  topSalesRep,
  todayEvents,
}: Props) {
  return (
    <section className="mb-3.5">
      <CardShell className={ADMIN_PANEL_SHELL_CLASS}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="flex items-start gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-amber-500/15 text-amber-400">
              <Trophy className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-wide text-[#64748b]">
                TOP PERFORMING VEHICLE
              </div>
              <div className="mt-1 text-[13px] font-bold text-white">
                {topVehicle?.title ?? "No data yet"}
              </div>
              {topVehicle && (
                <>
                  <div className="mt-0.5 text-[12px] tabular-nums text-emerald-400">
                    Gross Profit: {formatCurrency(topVehicle.profit)}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500">
                    Units Sold: {topVehicleUnitsSold}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-500/15 text-blue-400">
              <User className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-wide text-[#64748b]">
                TOP SALES REP
              </div>
              <div className="mt-1 text-[13px] font-bold text-white">
                {topSalesRep?.fullName ?? "No data yet"}
              </div>
              {topSalesRep && (
                <>
                  <div className="mt-0.5 text-[12px] text-slate-300">
                    Cars Sold: {topSalesRep.unitsSold}
                  </div>
                  <div className="mt-0.5 text-[12px] tabular-nums text-emerald-400">
                    Gross Profit: {formatCurrency(topSalesRep.grossProfit)}
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="text-[10px] font-bold tracking-wide text-[#64748b]">
                TODAY&apos;S EVENTS
              </div>
              <Link
                href="/dashboard/calendar"
                className="text-[10px] text-blue-400 hover:underline"
              >
                View Calendar
              </Link>
            </div>
            {todayEvents.length ? (
              <ul className="space-y-2">
                {todayEvents.slice(0, 3).map((ev) => (
                  <li key={ev.id} className="flex items-start gap-2 text-[11px]">
                    <Calendar className="mt-0.5 h-3 w-3 shrink-0 text-slate-500" />
                    <div>
                      <span className="text-slate-400">{ev.time}</span>
                      <span className="mx-1.5 text-slate-600">|</span>
                      <span className="text-slate-200">{ev.title}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[11px] text-slate-500">No events scheduled today.</p>
            )}
          </div>
        </div>
      </CardShell>
    </section>
  );
}
