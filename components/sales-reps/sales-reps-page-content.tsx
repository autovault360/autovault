"use client";

import { Suspense } from "react";
import AdminHeader from "@/components/layout/AdminHeader";
import AddSalesRepTrigger from "@/components/sales-reps/add-sales-rep-trigger";
import SalesRepStatsCards from "@/components/sales-reps/sales-rep-stats-cards";
import SalesRepsInventory from "@/components/sales-reps/sales-reps-inventory";
import type { SalesRepListItem, SalesRepStats } from "@/lib/sales-reps/types";

type Props = {
  salesReps: SalesRepListItem[];
  stats: SalesRepStats;
};

export default function SalesRepsPageContent({ salesReps, stats }: Props) {
  return (
    <div className="relative">
      <AdminHeader />

      <section className="mb-3.5 flex flex-wrap items-center justify-between gap-3 px-0.5">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales Reps</h1>
          <p className="mt-0.5 text-[12.5px] text-slate-500">
            Track performance, manage goals, and view individual rep metrics.
          </p>
        </div>
        <AddSalesRepTrigger />
      </section>

      <SalesRepStatsCards stats={stats} />

      <Suspense fallback={null}>
        <SalesRepsInventory salesReps={salesReps} />
      </Suspense>
    </div>
  );
}
