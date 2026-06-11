export default function SalesRepMessagesLoading() {
  return (
    <div className="flex h-[calc(100vh-140px)] min-h-[560px] animate-pulse overflow-hidden rounded-xl border border-slate-800/80 bg-[#010d19]">
      <div className="w-[380px] border-r border-slate-800/80 bg-[#0a1524]" />
      <div className="flex-1 bg-[#010d19]" />
      <div className="hidden w-[300px] border-l border-slate-800/80 bg-[#0a1524] xl:block" />
    </div>
  );
}
