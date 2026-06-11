export default function SendDocumentLoading() {
  return (
    <div className="w-full min-w-0 animate-pulse space-y-4">
      <div className="h-16 rounded-lg bg-slate-800/40" />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="space-y-4">
          <div className="h-48 rounded-xl bg-slate-800/30" />
          <div className="h-56 rounded-xl bg-slate-800/30" />
          <div className="h-36 rounded-xl bg-slate-800/30" />
        </div>
        <div className="space-y-4">
          <div className="h-40 rounded-xl bg-slate-800/30" />
          <div className="h-44 rounded-xl bg-slate-800/30" />
          <div className="h-32 rounded-xl bg-slate-800/30" />
        </div>
      </div>
    </div>
  );
}
