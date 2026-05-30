"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import AdminHeader from "@/components/layout/AdminHeader";
import AddSalesRepTrigger from "@/components/sales-reps/add/add-sales-rep-trigger";
import AddSalesRepModal from "@/components/sales-reps/add/add-sales-rep-modal";
import SalesRepStatsCards from "@/components/sales-reps/sales-rep-stats-cards";
import SalesRepsInventory from "@/components/sales-reps/sales-reps-inventory";
import {
  SalesRepStatsSkeleton,
  SalesRepsTableSkeleton,
} from "@/components/sales-reps/sales-reps-skeleton";
import type {
  SalesRepDashboardData,
  SalesRepListItem,
  SalesRepPeriod,
  SalesRepStats,
} from "@/lib/sales-reps/types";

type Props = {
  salesReps: SalesRepListItem[];
  stats: SalesRepStats;
  loadError?: string;
  defaultOpen?: boolean;
};

export default function SalesRepsPageContent({
  salesReps: initialSalesReps,
  stats: initialStats,
  loadError,
  defaultOpen = false,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [addOpen, setAddOpen] = useState(defaultOpen);

  useEffect(() => {
    setAddOpen(defaultOpen);
  }, [defaultOpen]);

  const handleAddOpenChange = (next: boolean) => {
    setAddOpen(next);
    window.history.replaceState(null, "", next ? pathname + "?add=true" : pathname);
  };
  const [salesReps, setSalesReps] = useState(initialSalesReps);
  const [stats, setStats] = useState(initialStats);
  const [error, setError] = useState(loadError);
  const [period, setPeriod] = useState<SalesRepPeriod>("this_month");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setSalesReps(initialSalesReps);
    setStats(initialStats);
    setError(loadError);
  }, [initialSalesReps, initialStats, loadError]);

  const handleRepSaved = useCallback(() => {
    router.refresh();
  }, [router]);

  const handlePeriodChange = useCallback((nextPeriod: SalesRepPeriod) => {
    setPeriod(nextPeriod);
    startTransition(async () => {
      try {
        const response = await fetch(`/api/sales-reps?period=${nextPeriod}`);
        const data = (await response.json()) as SalesRepDashboardData & {
          error?: string;
        };

        if (!response.ok) {
          setError(data.error ?? "Unable to load sales rep data.");
          return;
        }

        setSalesReps(data.salesReps);
        setStats(data.stats);
        setError(undefined);
      } catch {
        setError("Unable to load sales rep data. Please try again.");
      }
    });
  }, []);

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
        <AddSalesRepTrigger onClick={() => handleAddOpenChange(true)} />
      </section>

      {error && (
        <div className="mb-3.5 flex items-center gap-2 rounded-sm border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-[12px] text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isPending ? (
        <SalesRepStatsSkeleton />
      ) : (
        <SalesRepStatsCards stats={stats} />
      )}

      {isPending ? (
        <SalesRepsTableSkeleton />
      ) : (
        <SalesRepsInventory
          salesReps={salesReps}
          period={period}
          onPeriodChange={handlePeriodChange}
          isLoading={isPending}
        />
      )}

      <AddSalesRepModal
        open={addOpen}
        onOpenChange={handleAddOpenChange}
        onSaved={handleRepSaved}
      />
    </div>
  );
}
