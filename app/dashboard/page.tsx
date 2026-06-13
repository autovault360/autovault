import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getEssentialDashboardData } from "@/lib/dashboard/server/get-essential-dashboard-data";
import { PageHeaderTitle } from "@/components/layout/page-header-title";
import KPISection from "./_components/kpi-section";
import ExtendedDashboardContent from "./_components/extended-dashboard-content";

function ExtendedFallback() {
  return (
    <div className="space-y-3.5">
      <div className="mb-3.5 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex h-full animate-pulse flex-col rounded-sm border border-[#1e293b] bg-card p-3 shadow-none"
          >
            <div className="flex items-start gap-2.5">
              <div className="h-10 w-10 shrink-0 rounded-full bg-slate-800/80" />
              <div className="min-w-0 space-y-1.5">
                <div className="h-3 w-24 rounded-md bg-slate-800/80" />
                <div className="h-5 w-20 rounded-md bg-slate-800/80" />
                <div className="h-3 w-28 rounded-md bg-slate-800/80" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mb-3.5 h-32 animate-pulse rounded-sm border border-[#1e293b] bg-card" />
      <div className="mb-3.5 h-24 animate-pulse rounded-sm border border-[#1e293b] bg-card" />
      <div className="mb-3.5 grid grid-cols-1 gap-3 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-sm border border-[#1e293b] bg-card"
          />
        ))}
      </div>
    </div>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: dealStatusFilter } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const essential = await getEssentialDashboardData(dealStatusFilter);

  return (
    <div>
      <section className="mb-3.5 flex flex-wrap items-center justify-between gap-3 px-0.5">
        <PageHeaderTitle
          title="Retail Dashboard Overview"
          subtitle={essential.periodLabel}
        />
      </section>

      <KPISection kpis={essential.kpiCards} />

      <Suspense fallback={<ExtendedFallback />}>
        <ExtendedDashboardContent dealStatusFilter={dealStatusFilter} />
      </Suspense>
    </div>
  );
}
