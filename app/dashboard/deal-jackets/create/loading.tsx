export default function AdminCreateDealJacketLoading() {
  return (
    <div className="min-h-full">
      <div className="mb-4 space-y-2 px-0.5">
        <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-700/60" />
        <div className="h-7 w-56 animate-pulse rounded-md bg-slate-700/60" />
        <div className="h-4 w-80 animate-pulse rounded-md bg-slate-700/40" />
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
          <div className="space-y-3 xl:col-span-3">
            <div className="h-48 animate-pulse rounded-lg bg-slate-700/60" />
            <div className="h-72 animate-pulse rounded-lg bg-slate-700/60" />
          </div>
          <div className="h-[520px] animate-pulse rounded-lg bg-slate-700/60 xl:col-span-5" />
          <div className="space-y-3 xl:col-span-4">
            <div className="h-56 animate-pulse rounded-lg bg-slate-700/60" />
            <div className="h-64 animate-pulse rounded-lg bg-slate-700/60" />
          </div>
        </div>
        <div className="h-28 animate-pulse rounded-lg bg-slate-700/60" />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div className="h-56 animate-pulse rounded-lg bg-slate-700/60" />
          <div className="h-56 animate-pulse rounded-lg bg-slate-700/60" />
          <div className="h-56 animate-pulse rounded-lg bg-slate-700/60" />
        </div>
      </div>
    </div>
  );
}
