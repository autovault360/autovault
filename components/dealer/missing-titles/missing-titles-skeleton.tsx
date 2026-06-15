import KpiGridSkeleton from "@/components/ui/kpi-grid-skeleton";

const CARD_COUNT = 5;

export default function MissingTitlesPageSkeleton() {
  return (
    <div className="min-w-0 space-y-3.5">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="h-8 w-56 animate-pulse rounded-md bg-slate-800/80" />
        <div className="flex gap-2">
          <div className="h-9 w-36 animate-pulse rounded-md bg-slate-800/80" />
          <div className="h-9 w-52 animate-pulse rounded-md bg-slate-800/80" />
        </div>
      </section>
      <KpiGridSkeleton count={CARD_COUNT} />
      <div className="h-9 w-full max-w-3xl animate-pulse rounded-md bg-slate-800/80" />
      <div className="overflow-hidden rounded-sm border border-slate-800/50 bg-transparent p-3.5">
        <div className="mb-3 h-10 w-full animate-pulse rounded-md bg-slate-800/80" />
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="mb-2 h-14 w-full animate-pulse rounded-sm bg-slate-800/80"
          />
        ))}
      </div>
    </div>
  );
}
