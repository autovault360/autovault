export default function VehicleAlertsLoading() {
  return (
    <div className="animate-pulse space-y-3.5">
      <div className="h-8 w-48 rounded bg-slate-800" />
      <div className="h-4 w-72 rounded bg-slate-800/60" />
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[108px] rounded-sm border border-slate-700 bg-slate-800/40" />
        ))}
      </div>
      <div className="h-[480px] rounded-sm border border-slate-700 bg-slate-800/30" />
    </div>
  );
}
