import { Card } from "@/components/ui/card";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-800/80 ${className ?? ""}`}
    />
  );
}

function KpiCardSkeleton() {
  return (
    <Card className="flex h-full flex-col gap-1.5 rounded-sm border border-slate-800/50 bg-transparent p-3 shadow-none">
      <div className="flex items-start gap-2.5">
        <SkeletonBar className="h-10 w-10 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <SkeletonBar className="h-3 w-24" />
          <SkeletonBar className="h-5 w-20" />
          <SkeletonBar className="h-3 w-16" />
        </div>
      </div>
      <SkeletonBar className="mt-1 h-9 w-full" />
    </Card>
  );
}

function CardShellSkeleton({ rows = 4, rowHeight = "h-6" }: { rows?: number; rowHeight?: string }) {
  return (
    <Card className="flex h-full flex-col gap-2 rounded-sm border border-slate-800/50 bg-transparent p-3.5 shadow-none">
      <div className="flex items-center justify-between">
        <SkeletonBar className="h-3 w-32" />
        <SkeletonBar className="h-5 w-16 rounded-full" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonBar key={i} className={`${rowHeight} w-full`} />
      ))}
    </Card>
  );
}

function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-2 py-1.5">
      <SkeletonBar className="h-3 w-16" />
      <SkeletonBar className="h-3 flex-1" />
      <SkeletonBar className="h-3 w-20" />
      <SkeletonBar className="h-3 w-16" />
      <SkeletonBar className="h-3 w-16" />
    </div>
  );
}

function SidebarCardSkeleton() {
  return (
    <Card className="flex flex-col gap-2 rounded-sm border border-slate-800/50 bg-transparent p-3.5 shadow-none">
      <SkeletonBar className="h-3 w-28" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <SkeletonBar className="h-3 w-3 shrink-0 rounded-full" />
          <SkeletonBar className="h-3 flex-1" />
          <SkeletonBar className="h-3 w-12" />
        </div>
      ))}
      <SkeletonBar className="h-8 w-full" />
    </Card>
  );
}

export default function CpaDashboardSkeleton() {
  return (
    <div>
      {/* Header */}
      <header className="mb-4 space-y-3 border-b border-slate-800 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <SkeletonBar className="h-8 w-48" />
            <SkeletonBar className="h-3 w-72" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SkeletonBar className="h-8 w-32 rounded-lg" />
            <SkeletonBar className="h-8 w-48 rounded-lg" />
            <div className="flex items-center gap-3 border-l border-slate-800 pl-3">
              <SkeletonBar className="h-9 w-9 rounded-full" />
              <SkeletonBar className="h-8 w-24 rounded-md" />
            </div>
          </div>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="mb-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-[1fr_320px]">
        <div className="space-y-3.5">
          {/* Sales Activity + Vehicles Sold */}
          <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-3">
            <CardShellSkeleton rows={4} />
            <div className="lg:col-span-2">
              <CardShellSkeleton rows={5} rowHeight="h-5" />
            </div>
          </div>

          {/* Sales Tax + Payroll */}
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
            <CardShellSkeleton rows={6} />
            <CardShellSkeleton rows={6} />
          </div>

          {/* P&L + Revenue Chart */}
          <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-[1.4fr_1fr]">
            <CardShellSkeleton rows={6} rowHeight="h-5" />
            <Card className="flex flex-col gap-2 rounded-sm border border-slate-800/50 bg-transparent p-3.5 shadow-none">
              <div className="flex items-center justify-between">
                <SkeletonBar className="h-3 w-36" />
                <SkeletonBar className="h-5 w-16 rounded-full" />
              </div>
              <SkeletonBar className="h-48 w-full" />
            </Card>
          </div>

          {/* Deal Jackets + Files */}
          <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
            <Card className="flex flex-col gap-2 rounded-sm border border-slate-800/50 bg-transparent p-3.5 shadow-none">
              <div className="flex items-center justify-between">
                <SkeletonBar className="h-3 w-32" />
                <SkeletonBar className="h-5 w-16 rounded-full" />
              </div>
              <SkeletonBar className="h-36 w-full" />
            </Card>
            <CardShellSkeleton rows={6} />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-3.5">
          <SidebarCardSkeleton />
          <SidebarCardSkeleton />
          <Card className="flex flex-col gap-2 rounded-sm border border-slate-800/50 bg-transparent p-3.5 shadow-none">
            <SkeletonBar className="h-3 w-24" />
            <SkeletonBar className="h-8 w-full" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <SkeletonBar className="h-3 w-3 shrink-0 rounded-sm" />
                <SkeletonBar className="h-3 flex-1" />
              </div>
            ))}
            <SkeletonBar className="h-8 w-full" />
          </Card>
          <Card className="flex flex-col gap-2 rounded-sm border border-slate-800/50 bg-transparent p-3.5 shadow-none">
            <div className="flex items-center gap-2">
              <SkeletonBar className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <SkeletonBar className="h-3 w-28" />
                <SkeletonBar className="h-2.5 w-20" />
              </div>
            </div>
            <SkeletonBar className="h-12 w-full rounded-lg" />
          </Card>
        </div>
      </div>
    </div>
  );
}
