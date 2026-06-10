export default function PayrollEarningsLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex justify-between gap-3">
        <div className="space-y-2">
          <div className="h-8 w-56 rounded bg-slate-800" />
          <div className="h-4 w-72 rounded bg-slate-800/60" />
        </div>
        <div className="h-9 w-56 rounded bg-slate-800/60" />
      </div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-[118px] rounded-lg border border-slate-700 bg-slate-800/40" />
        ))}
      </div>
      <div className="h-[420px] rounded-lg border border-slate-700 bg-slate-800/30" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-[300px] rounded-lg border border-slate-700 bg-slate-800/30" />
        <div className="h-[300px] rounded-lg border border-slate-700 bg-slate-800/30" />
      </div>
    </div>
  );
}
