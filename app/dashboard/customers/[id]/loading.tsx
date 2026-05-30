import AdminHeader from "@/components/layout/AdminHeader";

export default function CustomerDetailLoading() {
  return (
    <div className="relative pb-8 animate-pulse">
      <AdminHeader />
      <div className="mb-3 h-4 w-40 rounded bg-slate-800/80" />
      <div className="mb-4 flex justify-between gap-3">
        <div className="h-7 w-48 rounded bg-slate-800/80" />
        <div className="h-9 w-32 rounded-md bg-slate-800/80" />
      </div>
      <div className="mb-4 rounded-lg border border-slate-800/90 p-5">
        <div className="flex flex-col gap-5 lg:flex-row">
          <div className="flex gap-4">
            <div className="h-24 w-24 rounded-full bg-slate-800/80" />
            <div className="space-y-2">
              <div className="h-6 w-48 rounded bg-slate-800/80" />
              <div className="h-3 w-36 rounded bg-slate-800/60" />
              <div className="h-3 w-44 rounded bg-slate-800/60" />
            </div>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-md border border-slate-800/80 bg-slate-800/40"
              />
            ))}
          </div>
        </div>
      </div>
      <div className="mb-4 flex gap-4 border-b border-slate-800/80 pb-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-4 w-24 rounded bg-slate-800/60" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-64 rounded-sm border border-slate-700 bg-slate-800/30"
          />
        ))}
      </div>
    </div>
  );
}
