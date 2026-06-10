
export default function CustomerDetailLoading() {
  return (
    <div className="relative pb-8 animate-pulse">
      <div className="mb-3 inline-flex items-center gap-1.5">
        <div className="h-3.5 w-3.5 rounded bg-slate-800/80" />
        <div className="h-3 w-32 rounded bg-slate-800/80" />
      </div>
      <section className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="h-5 w-5 rounded bg-slate-800/80" />
          <div className="h-7 w-48 rounded bg-slate-800/80" />
        </div>
        <div className="h-9 w-32 rounded-md bg-slate-800/80" />
      </section>
      <div className="mb-4 rounded-lg border border-slate-800/90 p-4 lg:p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center">
            <div className="h-24 w-24 shrink-0 rounded-full border-2 border-slate-700/80 bg-slate-800/80" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="h-6 w-48 rounded bg-slate-800/80" />
                <div className="h-5 w-24 rounded-full bg-slate-800/60" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 rounded bg-slate-800/60" />
                  <div className="h-3 w-36 rounded bg-slate-800/60" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 rounded bg-slate-800/60" />
                  <div className="h-3 w-44 rounded bg-slate-800/60" />
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 h-3.5 w-3.5 rounded bg-slate-800/60" />
                  <div className="h-3 w-52 rounded bg-slate-800/60" />
                </div>
              </div>
            </div>
          </div>
          <div className="w-full shrink-0 lg:max-w-[520px] lg:flex-1">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 rounded-md border border-slate-800/80 bg-slate-800/40"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mb-4 flex gap-0 overflow-x-auto border-b border-slate-800">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex shrink-0 items-center gap-1 px-4 py-3">
            <div className="h-3 w-16 rounded bg-slate-800/60" />
            {i > 0 && <div className="h-3 w-6 rounded bg-slate-800/40" />}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-3">
        <div className="h-64 rounded-sm border border-slate-700 bg-slate-800/30" />
        <div className="h-64 rounded-sm border border-slate-700 bg-slate-800/30" />
        <div className="h-64 rounded-sm border border-slate-700 bg-slate-800/30" />
      </div>
    </div>
  );
}
