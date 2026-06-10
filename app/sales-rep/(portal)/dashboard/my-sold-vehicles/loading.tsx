export default function MySoldVehiclesLoading() {
  return (
    <div className="animate-pulse space-y-3.5">
      <div className="h-8 w-56 rounded bg-slate-800" />
      <div className="h-4 w-80 rounded bg-slate-800/60" />
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-[108px] rounded-sm border border-slate-700 bg-slate-800/40" />
        ))}
      </div>
      <div className="h-[480px] rounded-sm border border-slate-700 bg-slate-800/30" />
    </div>
  );
}
